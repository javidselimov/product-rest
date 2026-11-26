using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace Cbar.AdminApi.Controllers;

public record TranslationDto(string Title, string? Content);
/// <param name="Type">
/// 1 news, 2 announcement, 3 interview or speech. Null keeps the stored type on update and means news on create —
/// a client that never sends it (the admin panel before spec 029) cannot reset it to 0.
/// </param>
public record PressReleaseUpsertDto(
    short? Type,
    ContentStatus Status,
    DateTimeOffset? PublishedAt,
    Dictionary<string, TranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.PressReleases.Read)]
[Route("api/v1/press-releases")]
public class PressReleasesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const short News = 1;
    private const short Announcement = 2;
    private const short Interview = 3;
    private const string InvalidTypeMessage = "Type must be 1 (news), 2 (announcement) or 3 (interview or speech).";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        [FromQuery] short? type = null)
    {
        var query = db.PressReleases.AsNoTracking();
        if (status is not null)
            query = query.Where(p => p.Status == status);
        if (type is not null)
            query = query.Where(p => p.Type == type);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Translations.Any(t => EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.PublishedAt ?? p.CreatedAt)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(p => new
            {
                p.Id,
                p.Type,
                Status = p.Status.ToString().ToLowerInvariant(),
                p.PublishedAt,
                p.UpdatedAt,
                Title = p.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? p.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.PressReleases.AsNoTracking()
            .Include(p => p.Translations)
            .Include(p => p.Assets).ThenInclude(a => a.Media)
            .Include(p => p.Assets).ThenInclude(a => a.Details)
            .SingleOrDefaultAsync(p => p.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost("{id:int}/assets")]
    [RequirePermission(Permissions.PressReleases.Update)]
    public async Task<IActionResult> AttachAsset(int id, [FromBody] AttachAssetDto dto)
    {
        var release = await db.PressReleases.Include(p => p.Assets)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (release is null)
            return NotFound();
        if (!await db.MediaAssets.AnyAsync(m => m.Id == dto.MediaId))
            return BadRequestProblem("Media asset not found.");
        if (release.Assets.Any(a => a.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = release.Assets.Count == 0 ? 0 : release.Assets.Max(a => a.SortOrder);
        release.Assets.Add(new PressReleaseAsset { MediaId = dto.MediaId, SortOrder = maxOrder + 1 });
        audit.Log("press_releases.attach_asset", "press_release", id, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Spec 030: the first image attachment is the cover on the public site, the remaining
    // images form the photo gallery, so the order is editorial content, not a detail.
    [HttpPut("{id:int}/assets/order")]
    [RequirePermission(Permissions.PressReleases.Update)]
    public async Task<IActionResult> ReorderAssets(int id, [FromBody] PressReleaseAssetOrderDto dto)
    {
        var release = await db.PressReleases.Include(p => p.Assets)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (release is null)
            return NotFound();

        var current = release.Assets.Select(a => a.MediaId).ToHashSet();
        if (dto.MediaIds.Count != current.Count || !current.SetEquals(dto.MediaIds))
            return BadRequestProblem("mediaIds must contain exactly the press release's attached media ids.");

        var before = release.Assets.OrderBy(a => a.SortOrder).ThenBy(a => a.Id).Select(a => a.MediaId).ToList();
        for (var i = 0; i < dto.MediaIds.Count; i++)
            release.Assets.Single(a => a.MediaId == dto.MediaIds[i]).SortOrder = i + 1;

        audit.Log("press_releases.reorder_assets", "press_release", id,
            before: new { mediaIds = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Spec 033: an interview usually has one PDF per language. Null shows the file in both.
    [HttpPut("{id:int}/assets/{mediaId:long}/locale")]
    [RequirePermission(Permissions.PressReleases.Update)]
    public async Task<IActionResult> SetAssetLocale(int id, long mediaId, [FromBody] PressReleaseAssetLocaleDto dto)
    {
        var asset = await db.Set<PressReleaseAsset>().Include(a => a.Details)
            .SingleOrDefaultAsync(a => a.PressReleaseId == id && a.MediaId == mediaId);
        if (asset is null)
            return NotFound();
        if (dto.Locale is not null && !await db.Locales.AnyAsync(l => l.Code == dto.Locale))
            return BadRequestProblem("Unknown locale.");

        audit.Log("press_releases.set_asset_locale", "press_release", id,
            before: new { mediaId, locale = asset.Details?.Locale }, after: dto);
        asset.Details ??= new PressReleaseAssetDetail();
        asset.Details.Locale = dto.Locale;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/assets/{mediaId:long}")]
    [RequirePermission(Permissions.PressReleases.Update)]
    public async Task<IActionResult> DetachAsset(int id, long mediaId)
    {
        // Details are loaded so the row goes too where 0017 could not add the FK.
        var asset = await db.Set<PressReleaseAsset>().Include(a => a.Details)
            .SingleOrDefaultAsync(a => a.PressReleaseId == id && a.MediaId == mediaId);
        if (asset is null)
            return NotFound();

        db.Remove(asset);
        audit.Log("press_releases.detach_asset", "press_release", id, before: new { mediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost]
    [RequirePermission(Permissions.PressReleases.Create)]
    public async Task<IActionResult> Create(PressReleaseUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (!IsValidType(dto.Type))
            return BadRequestProblem(InvalidTypeMessage);

        var entity = new PressRelease { Type = dto.Type ?? News, Status = dto.Status, PublishedAt = dto.PublishedAt };
        await ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.PressReleases.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("press_releases.create", "press_release", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.PressReleases.Update)]
    public async Task<IActionResult> Update(int id, PressReleaseUpsertDto dto)
    {
        if (!IsValidType(dto.Type))
            return BadRequestProblem(InvalidTypeMessage);

        var entity = await db.PressReleases
            .Include(p => p.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.Type = dto.Type ?? entity.Type;
        entity.Status = dto.Status;
        entity.PublishedAt = dto.PublishedAt;
        await ApplyTranslations(entity, dto);

        audit.Log("press_releases.update", "press_release", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.PressReleases.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.PressReleases.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("press_releases.delete", "press_release", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static bool IsValidType(short? type) => type is null or News or Announcement or Interview;

    private async Task ApplyTranslations(PressRelease entity, PressReleaseUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new PressReleaseTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlug.ForAsync(
                        db.PressReleaseTranslations.Where(t => t.Locale == locale).Select(t => t.Slug),
                        tr.Title),
                    Content = tr.Content,
                });
            }
            else
            {
                if (existing.Title != tr.Title)
                    existing.Slug = await UniqueSlug.ForAsync(
                        db.PressReleaseTranslations.Where(t => t.Locale == locale && t.Id != existing.Id).Select(t => t.Slug),
                        tr.Title);
                existing.Title = tr.Title;
                existing.Content = tr.Content;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(PressRelease p) => new
    {
        p.Id,
        p.Type,
        Status = p.Status.ToString().ToLowerInvariant(),
        p.PublishedAt,
        p.UpdatedAt,
        Translations = p.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Content }),
        Assets = p.Assets
            .OrderBy(a => a.SortOrder)
            .Select(a => new
            {
                MediaId = a.MediaId,
                a.Media?.OriginalName,
                a.Media?.MimeType,
                SizeBytes = a.Media?.SizeBytes,
                Locale = a.Details?.Locale,
            }),
    };
}

public record AttachAssetDto(long MediaId);
public record PressReleaseAssetOrderDto(List<long> MediaIds);
/// <param name="Locale">Required so an empty body cannot clear the language; null is a valid value.</param>
public record PressReleaseAssetLocaleDto([property: JsonRequired] string? Locale);
