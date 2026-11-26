using System.IO.Compression;
using System.Text.Json;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Net.Http.Headers;
using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class OrganizationController(
    CbarDbContext db,
    IMinioClient minio,
    IOptions<MediaStorageOptions> options) : ControllerBase
{
    // Org-chart kinds that can keep their departments always open (spec 060).
    private const short ChartBlockKind = 4;
    private const short ChartGroupKind = 6;

    /// <summary>Active staff members for a locale, ordered by sort order. type: 1 = board, 2 = management.</summary>
    [HttpGet("api/v1/organization/staff")]
    public async Task<IActionResult> GetStaff(
        [FromQuery] string locale = "az",
        [FromQuery] short? type = null)
    {
        var items = await db.OrganizationStaff.AsNoTracking()
            .Where(s => s.IsActive
                && (type == null || s.Type == type)
                && s.Translations.Any(t => t.Locale == locale))
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
            .Select(s => new
            {
                id = s.Id,
                fullName = s.Translations.Where(t => t.Locale == locale).Select(t => t.FullName).FirstOrDefault(),
                position = s.Translations.Where(t => t.Locale == locale).Select(t => t.Position).FirstOrDefault(),
                receptionDays = s.Translations.Where(t => t.Locale == locale).Select(t => t.ReceptionDays).FirstOrDefault(),
                phone = s.Phone,
                bio = s.Translations.Where(t => t.Locale == locale).Select(t => t.Bio).FirstOrDefault(),
                photoUrl = s.PhotoMediaId == null ? null : $"/media/{s.PhotoMediaId}",
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>A single active staff member by id, for the detail page.</summary>
    [HttpGet("api/v1/organization/staff/{id:int}")]
    public async Task<IActionResult> GetStaffMember(
        int id,
        [FromQuery] string locale = "az")
    {
        var item = await db.OrganizationStaff.AsNoTracking()
            .Where(s => s.IsActive && s.Id == id
                && s.Translations.Any(t => t.Locale == locale))
            .Select(s => new
            {
                id = s.Id,
                type = s.Type,
                fullName = s.Translations.Where(t => t.Locale == locale).Select(t => t.FullName).FirstOrDefault(),
                position = s.Translations.Where(t => t.Locale == locale).Select(t => t.Position).FirstOrDefault(),
                receptionDays = s.Translations.Where(t => t.Locale == locale).Select(t => t.ReceptionDays).FirstOrDefault(),
                phone = s.Phone,
                bio = s.Translations.Where(t => t.Locale == locale).Select(t => t.Bio).FirstOrDefault(),
                photoUrl = s.PhotoMediaId == null ? null : $"/media/{s.PhotoMediaId}",
                // Press photos for download (Figma `2037:4289`); soft-deleted assets are
                // filtered out by the MediaAsset query filter.
                photos = s.Photos
                    .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
                    .Select(p => new
                    {
                        mediaId = p.MediaId,
                        originalName = p.Media.OriginalName,
                        mimeType = p.Media.MimeType,
                        sizeBytes = p.Media.SizeBytes,
                        width = p.Media.Width,
                        height = p.Media.Height,
                        url = $"/media/{p.MediaId}",
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        return item == null ? NotFound() : Ok(item);
    }

    /// <summary>
    /// Every press photo of an active staff member as one ZIP, streamed straight from object
    /// storage. Entries are stored, not deflated: the photos are JPEG/PNG already, so deflate
    /// would only burn CPU for nothing. No Content-Length — media_assets.size_bytes is not
    /// trustworthy for migrated rows (see MediaController), so the archive is chunked.
    /// </summary>
    [HttpGet("api/v1/organization/staff/{id:int}/photos.zip")]
    public async Task<IActionResult> GetStaffPhotosZip(int id, CancellationToken ct)
    {
        var photos = await db.Set<OrganizationStaffPhoto>().AsNoTracking()
            .Where(p => p.StaffId == id && p.Staff.IsActive)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .Select(p => new { p.Media.StorageKey, p.Media.OriginalName })
            .ToListAsync(ct);

        if (photos.Count == 0)
            return NotFound();

        var disposition = new ContentDispositionHeaderValue("attachment");
        disposition.SetHttpFileName($"{id}-photos.zip");
        Response.Headers[HeaderNames.ContentDisposition] = disposition.ToString();
        Response.Headers[HeaderNames.CacheControl] = "no-store";
        Response.Headers[HeaderNames.XContentTypeOptions] = "nosniff";
        Response.ContentType = "application/zip";

        // ZipArchive still writes some of its bookkeeping (local headers, central directory)
        // synchronously, which Kestrel rejects by default — allow it for this response only.
        var bodyControl = HttpContext.Features.Get<IHttpBodyControlFeature>();
        if (bodyControl is not null)
            bodyControl.AllowSynchronousIO = true;

        // leaveOpen: the response body is Kestrel's to close. Entry names are the original
        // file names, made unique with -2, -3 … so two "portrait.jpg" uploads both survive.
        await using var zip = new ZipArchive(Response.Body, ZipArchiveMode.Create, leaveOpen: true);
        var used = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (var photo in photos)
        {
            var entry = zip.CreateEntry(UniqueEntryName(photo.OriginalName, used), CompressionLevel.NoCompression);
            await using var target = entry.Open();
            try
            {
                await minio.GetObjectAsync(new GetObjectArgs()
                    .WithBucket(options.Value.Bucket)
                    .WithObject(photo.StorageKey)
                    .WithCallbackStream((stream, token) => stream.CopyToAsync(target, token)), ct);
            }
            catch (Exception ex) when (ex is ObjectNotFoundException or BucketNotFoundException)
            {
                // A dangling asset must not break the archive for the others; the entry stays empty.
            }
        }

        return new EmptyResult();
    }

    private static string UniqueEntryName(string originalName, HashSet<string> used)
    {
        // Strip any path the uploader's browser may have sent; the archive is flat.
        var name = Path.GetFileName(originalName);
        if (string.IsNullOrWhiteSpace(name))
            name = "photo";
        if (used.Add(name))
            return name;

        var stem = Path.GetFileNameWithoutExtension(name);
        var ext = Path.GetExtension(name);
        for (var n = 2; ; n++)
        {
            var candidate = $"{stem}-{n}{ext}";
            if (used.Add(candidate))
                return candidate;
        }
    }

    /// <summary>
    /// Active organization divisions for a locale, ordered by sort order. `regulation` is the
    /// department's regulation document of that locale (Figma `1003:12461`, file row under the
    /// info card); a soft-deleted asset is filtered out by the MediaAsset query filter and comes
    /// back as null, like a missing one.
    /// </summary>
    [HttpGet("api/v1/organization/divisions")]
    public async Task<IActionResult> GetDivisions([FromQuery] string locale = "az")
    {
        var items = await db.OrganizationDivisions.AsNoTracking()
            .Where(d => d.IsActive && d.Translations.Any(t => t.Locale == locale))
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .Select(d => new
            {
                id = d.Id,
                name = d.Translations.Where(t => t.Locale == locale).Select(t => t.Name).FirstOrDefault(),
                description = d.Translations.Where(t => t.Locale == locale).Select(t => t.Description).FirstOrDefault(),
                regulation = d.Translations
                    .Where(t => t.Locale == locale && t.Details!.RegulationMedia != null)
                    .Select(t => t.Details!.RegulationMedia!)
                    .Select(m => new
                    {
                        mediaId = m.Id,
                        originalName = m.OriginalName,
                        mimeType = m.MimeType,
                        sizeBytes = m.SizeBytes,
                        url = $"/media/{m.Id}",
                    })
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Organisational chart for a locale, flat, by sort order (Figma `2007:86377` desktop,
    /// `2007:86365` tablet). Name and role come from the node's own texts, else the linked staff
    /// member or division. A node is dropped when it is inactive, its linked record is inactive,
    /// or it has no name in the locale — together with its branch, so every parentId resolves.
    /// The link is set only when the linked page exists in the locale. <c>departmentsOpen</c> (spec 060,
    /// companion table 0045) is true only for a block or group the editor keeps always open; the site
    /// lays the desktop chart out from the tree, so <c>layout</c> and <c>connector</c> are deprecated.
    /// </summary>
    [HttpGet("api/v1/organization/chart")]
    public async Task<IActionResult> GetChart([FromQuery] string locale = "az")
    {
        var rows = await db.OrgChartNodes.AsNoTracking()
            .Where(n => n.IsActive)
            .OrderBy(n => n.SortOrder).ThenBy(n => n.Id)
            .Select(n => new
            {
                n.Id,
                n.ParentId,
                n.Kind,
                n.CuratorDirect,
                DepartmentsOpen = n.Details != null && n.Details.DepartmentsOpen,
                n.X, n.Y, n.W, n.H,
                n.Connector,
                Title = n.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                Subtitle = n.Translations.Where(t => t.Locale == locale).Select(t => t.Subtitle).FirstOrDefault(),
                // A dangling id (no FK in some environments, see migration 0015) reads as unlinked.
                StaffId = n.Staff != null ? (int?)n.Staff.Id : null,
                StaffActive = n.Staff == null || n.Staff.IsActive,
                StaffName = n.Staff!.Translations.Where(t => t.Locale == locale).Select(t => t.FullName).FirstOrDefault(),
                StaffPosition = n.Staff!.Translations.Where(t => t.Locale == locale).Select(t => t.Position).FirstOrDefault(),
                DivisionId = n.Division != null ? (int?)n.Division.Id : null,
                DivisionActive = n.Division == null || n.Division.IsActive,
                DivisionName = n.Division!.Translations.Where(t => t.Locale == locale).Select(t => t.Name).FirstOrDefault(),
            })
            .ToListAsync();

        var shown = rows
            .Where(r => r.StaffActive && r.DivisionActive && (r.Title ?? r.StaffName ?? r.DivisionName) is not null)
            .ToDictionary(r => r.Id);

        // Keep a node only if its whole ancestor chain is shown.
        var kept = new Dictionary<int, bool>();
        bool IsKept(int id)
        {
            if (kept.TryGetValue(id, out var k))
                return k;
            kept[id] = false; // a cycle in the data resolves to "not shown"
            var parentId = shown[id].ParentId;
            return kept[id] = parentId is null || (shown.ContainsKey(parentId.Value) && IsKept(parentId.Value));
        }

        var items = shown.Values
            .Where(r => IsKept(r.Id))
            .Select(r => new
            {
                id = r.Id,
                parentId = r.ParentId,
                kind = r.Kind,
                curatorDirect = r.CuratorDirect,
                name = r.Title ?? r.StaffName ?? r.DivisionName,
                role = r.Subtitle ?? r.StaffPosition,
                link = r.StaffId is { } staffId && r.StaffName is not null
                    ? new { type = "staff", id = staffId }
                    : r.DivisionId is { } divisionId && r.DivisionName is not null
                        ? new { type = "division", id = divisionId }
                        : null,
                departmentsOpen = r.DepartmentsOpen && r.Kind is ChartBlockKind or ChartGroupKind,
                layout = r.X is { } x && r.Y is { } y && r.W is { } w && r.H is { } h
                    ? new { x, y, w, h }
                    : null,
                connector = r.Connector is null ? null : JsonSerializer.Deserialize<decimal[][]>(r.Connector),
            })
            .ToList();

        return Ok(items);
    }

    /// <summary>
    /// Active organization offices for a locale, ordered by sort order. One card per office
    /// (Figma `2046:3531`): building photo, address, phone, head and the regulation document
    /// of that locale. A soft-deleted regulation asset is filtered out by the MediaAsset query
    /// filter and comes back as null, like a missing one.
    /// </summary>
    [HttpGet("api/v1/organization/offices")]
    public async Task<IActionResult> GetOffices([FromQuery] string locale = "az")
    {
        var items = await db.OrganizationOffices.AsNoTracking()
            .Where(o => o.IsActive && o.Translations.Any(t => t.Locale == locale))
            .OrderBy(o => o.SortOrder).ThenBy(o => o.Id)
            .Select(o => new
            {
                id = o.Id,
                name = o.Translations.Where(t => t.Locale == locale).Select(t => t.Name).FirstOrDefault(),
                address = o.Translations.Where(t => t.Locale == locale).Select(t => t.Address).FirstOrDefault(),
                phone = o.Translations.Where(t => t.Locale == locale).Select(t => t.Phone).FirstOrDefault(),
                // Card fields live in the *_details companion tables (0014); a missing row reads as null.
                directorName = o.Translations.Where(t => t.Locale == locale).Select(t => t.Details!.DirectorName).FirstOrDefault(),
                photoUrl = o.Details!.PhotoMediaId == null ? null : $"/media/{o.Details.PhotoMediaId}",
                regulation = o.Translations
                    .Where(t => t.Locale == locale && t.Details!.RegulationMedia != null)
                    .Select(t => t.Details!.RegulationMedia!)
                    .Select(m => new
                    {
                        mediaId = m.Id,
                        originalName = m.OriginalName,
                        mimeType = m.MimeType,
                        sizeBytes = m.SizeBytes,
                        url = $"/media/{m.Id}",
                    })
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }
}
