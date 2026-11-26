using System.Diagnostics;
using System.Security.Claims;
using System.Security.Cryptography;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Net.Http.Headers;
using Minio.Exceptions;
using Npgsql;

namespace Cbar.AdminApi.Controllers;

[ApiController]
[RequirePermission(Permissions.Media.Read)]
[Route("api/v1/media")]
public class MediaController(
    CbarDbContext db, MediaStorage storage, AuditService audit, ILogger<MediaController> logger) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null)
    {
        var query = db.MediaAssets.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => EF.Functions.ILike(m.OriginalName, $"%{search}%"));

        var w = paging.Resolve(24);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(m => new { m.Id, m.OriginalName, m.MimeType, m.SizeBytes, m.Width, m.Height, m.CreatedAt })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    /// <summary>
    /// Image bytes for the panel's previews. The panel must not call the public api-cbar
    /// (and the token never goes in a URL), so it fetches this with its bearer token and
    /// shows the result as a blob. Non-images get 415 without touching object storage —
    /// form detail responses carry only the media id, so this is how the panel learns
    /// "show an icon, not a broken image".
    /// </summary>
    [HttpGet("{id:long}/preview")]
    public async Task<IActionResult> Preview(long id, CancellationToken ct)
    {
        var asset = await db.MediaAssets.AsNoTracking()
            .Where(m => m.Id == id)
            .Select(m => new { m.StorageKey, m.OriginalName, m.MimeType, m.ChecksumSha256 })
            .FirstOrDefaultAsync(ct);

        if (asset is null)
        {
            Response.Headers[HeaderNames.CacheControl] = "no-store";
            return NotFoundProblem("Not found.");
        }

        if (!asset.MimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            // The mime type of an id never changes (content-addressed), so the answer is cacheable.
            Response.Headers[HeaderNames.CacheControl] = PreviewCacheControl;
            return ErrorProblem(StatusCodes.Status415UnsupportedMediaType, "Preview is available for images only.",
                extensions: new Dictionary<string, object?> { ["mimeType"] = asset.MimeType });
        }

        // The checksum is already a strong validator, so it becomes the ETag as-is.
        var etag = new EntityTagHeaderValue($"\"{asset.ChecksumSha256}\"");
        if (MatchesIfNoneMatch(etag))
        {
            Response.Headers[HeaderNames.CacheControl] = PreviewCacheControl;
            Response.Headers[HeaderNames.ETag] = etag.ToString();
            return StatusCode(StatusCodes.Status304NotModified);
        }

        var disposition = new ContentDispositionHeaderValue("inline");
        disposition.SetHttpFileName(asset.OriginalName);

        try
        {
            // Headers are set inside the callback: by then the object is known to exist and
            // nothing has been flushed, so a missing one still comes back as a clean 404.
            // Same approach as api-cbar's MediaController.
            await storage.GetAsync(asset.StorageKey, async (stream, token) =>
            {
                Response.Headers[HeaderNames.ContentDisposition] = disposition.ToString();
                Response.Headers[HeaderNames.CacheControl] = PreviewCacheControl;
                Response.Headers[HeaderNames.ETag] = etag.ToString();
                Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
                // An SVG opened directly from this URL must not run script.
                Response.Headers[HeaderNames.ContentSecurityPolicy] =
                    "default-src 'none'; style-src 'unsafe-inline'; sandbox";
                Response.ContentType = asset.MimeType;
                // No Content-Length from size_bytes: migrated rows carry wrong sizes and
                // Kestrel aborts a response whose real bytes overrun the declared length.
                await stream.CopyToAsync(Response.Body, token);
            }, ct);

            return new EmptyResult();
        }
        catch (Exception ex) when (ex is ObjectNotFoundException or BucketNotFoundException)
        {
            Response.Headers[HeaderNames.CacheControl] = "no-store";
            return NotFoundProblem("Not found.");
        }
    }

    /// <summary>
    /// Bytes behind an id never change (uploads are content-addressed), so the browser may
    /// keep them; `private` because the response sits behind authentication.
    /// </summary>
    private const string PreviewCacheControl = "private, max-age=31536000, immutable";

    /// <summary>`If-None-Match: *` matches any representation (RFC 9110 §13.1.2); weak comparison for GET.</summary>
    private bool MatchesIfNoneMatch(EntityTagHeaderValue etag)
    {
        var candidates = Request.GetTypedHeaders().IfNoneMatch;
        if (candidates is null || candidates.Count == 0)
            return false;

        return candidates.Any(candidate =>
            candidate.Tag == "*" || candidate.Compare(etag, useStrongComparison: false));
    }

    [HttpPost]
    [RequirePermission(Permissions.Media.Create)]
    // Annual report PDFs and payment-system software bundles run to ~200MB.
    [RequestSizeLimit(250_000_000)]
    [RequestFormLimits(MultipartBodyLengthLimit = 250_000_000)]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        // Memory figures for the upload log line (spec 019): the start value is taken after
        // binding, when the framework has already spooled the file to disk.
        var started = Stopwatch.GetTimestamp();
        var workingSetAtStart = Environment.WorkingSet;

        if (file.Length == 0)
            return BadRequestProblem("Empty file.");

        // The whitelist is checked on the cleaned name, which is also what gets stored.
        var originalName = MediaUploadRules.SanitizeFileName(file.FileName);
        var ext = Path.GetExtension(originalName);
        if (!MediaUploadRules.AllowedTypes.TryGetValue(ext, out var mimeType))
            return BadRequestProblem($"File type '{ext}' is not allowed.");

        var ct = HttpContext.RequestAborted;
        await using var stream = file.OpenReadStream();

        // Before hashing: a mislabelled file is rejected without reading it all, and can never
        // dedup onto an existing asset.
        var head = new byte[MediaUploadRules.SignatureWindow];
        var read = await stream.ReadAtLeastAsync(head, head.Length, throwOnEndOfStream: false, ct);
        if (!MediaUploadRules.MatchesSignature(ext, head.AsSpan(0, read)))
            return BadRequestProblem($"File content does not match type '{ext}'.");

        // The framework has already spooled anything over 64 KB to a temp file (deleted when the
        // request ends), so the file is read from there twice — hash, then storage — and never
        // copied into memory. The old MemoryStream + ToArray copy held ~3.4x the file size per
        // upload and the heap stayed grown afterwards (measured on test, spec 019). Same SHA-256
        // as the one-shot hash, so dedup against existing rows is unchanged.
        stream.Position = 0;
        var checksum = Convert.ToHexString(await SHA256.HashDataAsync(stream, ct)).ToLowerInvariant();

        // Content-addressed storage: identical bytes dedup to the existing asset.
        // Soft-deleted rows keep their (unique) storage_key, so they must be matched
        // too — otherwise re-uploading a deleted file hits the unique index. A hit
        // on a deleted row revives it. checksum_sha256 is not unique (legacy data, or the
        // same bytes uploaded in two months), so the oldest live row wins.
        async Task<IActionResult?> ReturnExisting()
        {
            var existing = await db.MediaAssets.IgnoreQueryFilters()
                .Where(m => m.ChecksumSha256 == checksum)
                .OrderBy(m => m.DeletedAt != null).ThenBy(m => m.Id)
                .FirstOrDefaultAsync();
            if (existing is null)
                return null;
            var restored = existing.DeletedAt is not null;
            if (restored)
            {
                existing.DeletedAt = null;
                audit.Log("media.restore", "media_asset", existing.Id);
                await db.SaveChangesAsync();
            }
            LogUpload(restored ? "restored" : "deduplicated", existing.Id);
            return Ok(new { existing.Id, existing.OriginalName, existing.MimeType, existing.SizeBytes, existing.CreatedAt });
        }

        if (await ReturnExisting() is { } found)
            return found;

        var key = $"{DateTime.UtcNow:yyyy/MM}/{checksum[..16]}{ext.ToLowerInvariant()}";

        stream.Position = 0;
        await storage.PutAsync(key, stream, mimeType, ct);

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var asset = new MediaAsset
        {
            StorageKey = key,
            OriginalName = originalName,
            MimeType = mimeType,
            SizeBytes = file.Length,
            ChecksumSha256 = checksum,
            CreatedBy = int.TryParse(sub, out var uid) ? uid : null,
        };
        db.MediaAssets.Add(asset);
        try
        {
            await db.SaveChangesAsync();
        }
        catch (DbUpdateException ex) when (DbErrorMapping.FindPostgres(ex) is
            { SqlState: PostgresErrorCodes.UniqueViolation, ConstraintName: "media_assets_storage_key_key" })
        {
            // A concurrent upload of the same bytes won the insert (the object in storage is
            // identical), so answer as a sequential re-upload would: with that asset (spec 018).
            db.ChangeTracker.Clear();
            if (await ReturnExisting() is { } winner)
                return winner;
            throw;
        }

        audit.Log("media.upload", "media_asset", asset.Id, after: new { asset.StorageKey, asset.OriginalName });
        // The size came from the upload itself, so the size check (spec 054) has nothing to do for this file.
        db.MediaAssetDetails.Add(new MediaAssetDetail { MediaId = asset.Id, SizeVerifiedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();

        LogUpload("stored", asset.Id);
        return Ok(new { asset.Id, asset.OriginalName, asset.MimeType, asset.SizeBytes, asset.CreatedAt });

        // Peak is the process's lifetime high-water mark (VmHWM on Linux), so it isolates one
        // upload only on the first upload after a pod start; the start/end working set brackets it.
        void LogUpload(string outcome, long id)
        {
            using var process = Process.GetCurrentProcess();
            logger.LogInformation(
                "Media upload {Outcome} {MediaId}: {SizeBytes} bytes in {ElapsedMs} ms; working set {WorkingSetStartMb} -> {WorkingSetEndMb} MB, process peak {PeakWorkingSetMb} MB",
                outcome, id, file.Length, (long)Stopwatch.GetElapsedTime(started).TotalMilliseconds,
                workingSetAtStart >> 20, Environment.WorkingSet >> 20, process.PeakWorkingSet64 >> 20);
        }
    }

    [HttpDelete("{id:long}")]
    [RequirePermission(Permissions.Media.Delete, Permissions.Media.DeleteOwn)]
    public async Task<IActionResult> Delete(long id, [FromServices] PermissionChecker perms)
    {
        var asset = await db.MediaAssets.SingleOrDefaultAsync(m => m.Id == id);
        if (asset is null)
            return NotFound();

        // media.delete_own lets a role delete only its own uploads; deleting anyone's needs
        // media.delete (spec 008 edge case "Media").
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var ownUpload = int.TryParse(sub, out var userId) && asset.CreatedBy == userId;
        if (!ownUpload && !await perms.HasAsync(Permissions.Media.Delete))
            return await perms.DenyAsync(Permissions.Media.Delete, "media", id);

        // Every table that FK-references media_assets, checked in one round trip.
        // Deleting an asset that is still referenced would leave a broken image or
        // download on the public site, so the check must cover all of them.
        var inUse = await db.Database.SqlQuery<bool>($"""
            SELECT (
                   EXISTS (SELECT 1 FROM page_assets             WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM press_release_assets    WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM law_assets              WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM meas_documents          WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM gallery_images          WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM csr_project_images      WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM csr_projects            WHERE cover_media_id = {id})
                OR EXISTS (SELECT 1 FROM ifi_organizations       WHERE logo_media_id  = {id})
                OR EXISTS (SELECT 1 FROM banners                 WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM image_popup_translations WHERE media_id      = {id})
                OR EXISTS (SELECT 1 FROM news_slider             WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM homepage_publications   WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM organization_divisions  WHERE media_id       = {id})
                OR EXISTS (SELECT 1 FROM organization_staff      WHERE photo_media_id = {id})
                OR EXISTS (SELECT 1 FROM users                   WHERE avatar_media_id = {id})
                OR EXISTS (SELECT 1 FROM money_marks             WHERE front_media_id = {id} OR rear_media_id = {id})
            ) AS "Value"
            """).SingleAsync();
        if (inUse)
            return ConflictProblem("File is attached to content; detach it first.");

        asset.DeletedAt = DateTimeOffset.UtcNow;   // soft delete; object stays in storage
        audit.Log("media.delete", "media_asset", asset.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
