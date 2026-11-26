using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record ImagePopupTranslationDto(long? MediaId, string? Link, string? AltText);
public record ImagePopupUpsertDto(
    string Title,
    bool IsActive,
    Dictionary<string, ImagePopupTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.ImagePopups.Read)]
[Route("api/v1/image-popups")]
public class ImagePopupsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.ImagePopups.AsNoTracking()
            .Include(p => p.Translations).ThenInclude(t => t.Media)
            .OrderByDescending(p => p.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.ImagePopups.AsNoTracking()
            .Include(p => p.Translations).ThenInclude(t => t.Media)
            .SingleOrDefaultAsync(p => p.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.ImagePopups.Create)]
    public async Task<IActionResult> Create(ImagePopupUpsertDto dto)
    {
        dto = Normalize(dto);
        if (await Validate(dto) is { } error)
            return BadRequestProblem(error);

        var entity = new ImagePopup
        {
            Title = dto.Title,
            IsActive = dto.IsActive,
            // The public site shows the active popup with the latest activation.
            ActivatedAt = dto.IsActive ? DateTimeOffset.UtcNow : null,
            CreatedBy = CurrentUserId(),
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.ImagePopups.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("image_popups.create", "image_popup", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        await LoadMedia(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.ImagePopups.Update)]
    public async Task<IActionResult> Update(int id, ImagePopupUpsertDto dto)
    {
        dto = Normalize(dto);
        if (await Validate(dto) is { } error)
            return BadRequestProblem(error);

        var entity = await db.ImagePopups
            .Include(p => p.Translations).ThenInclude(t => t.Media)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        // Only an inactive -> active switch moves the popup to the front; editing an
        // active popup must not re-show it over a newer one.
        if (!entity.IsActive && dto.IsActive)
            entity.ActivatedAt = DateTimeOffset.UtcNow;
        entity.Title = dto.Title;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("image_popups.update", "image_popup", entity.Id, before, dto);
        await db.SaveChangesAsync();

        await LoadMedia(entity);
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.ImagePopups.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.ImagePopups.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        db.ImagePopups.Remove(entity);   // hard delete; translations cascade
        audit.Log("image_popups.delete", "image_popup", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static ImagePopupUpsertDto Normalize(ImagePopupUpsertDto dto) => dto with
    {
        Title = dto.Title?.Trim() ?? "",
        Translations = (dto.Translations ?? new Dictionary<string, ImagePopupTranslationDto>()).ToDictionary(
            kv => kv.Key,
            kv => new ImagePopupTranslationDto(kv.Value.MediaId, Blank(kv.Value.Link), Blank(kv.Value.AltText))),
    };

    private static string? Blank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private async Task<string?> Validate(ImagePopupUpsertDto dto)
    {
        if (dto.Title.Length == 0)
            return "Title is required.";
        if (dto.Title.Length > 500)
            return "Title must be at most 500 characters.";

        var locales = dto.Translations.Keys.ToList();
        var known = await db.Locales.CountAsync(l => locales.Contains(l.Code));
        if (known != locales.Count)
            return "Unknown locale.";

        var mediaIds = dto.Translations.Values
            .Where(t => t.MediaId is not null).Select(t => t.MediaId!.Value).Distinct().ToList();
        if (mediaIds.Count == 0)
            return "At least one locale must have an image.";

        // The query filter on MediaAsset already hides soft-deleted assets.
        var assets = await db.MediaAssets.AsNoTracking()
            .Where(m => mediaIds.Contains(m.Id))
            .Select(m => m.MimeType)
            .ToListAsync();
        if (assets.Count != mediaIds.Count)
            return "Media asset not found.";
        if (assets.Any(mime => !mime.StartsWith("image/", StringComparison.OrdinalIgnoreCase)))
            return "Media asset must be an image.";

        foreach (var tr in dto.Translations.Values)
        {
            if (tr.Link is { } link && (link.Length > 1000 || !ContentSupport.IsAllowedLink(link)))
                return "Link must start with http://, https:// or /.";
            if (tr.AltText is { Length: > 500 })
                return "Alt text must be at most 500 characters.";
        }
        return null;
    }

    private static void ApplyTranslations(ImagePopup entity, ImagePopupUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new ImagePopupTranslation
                {
                    Locale = locale,
                    MediaId = tr.MediaId,
                    Link = tr.Link,
                    AltText = tr.AltText,
                });
            }
            else
            {
                existing.MediaId = tr.MediaId;
                existing.Link = tr.Link;
                existing.AltText = tr.AltText;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    // After a save a new or re-pointed translation carries MediaId but not (or a
    // stale) Media, and the response needs the file name.
    private async Task LoadMedia(ImagePopup entity)
    {
        foreach (var tr in entity.Translations.Where(t => t.MediaId is not null && t.Media?.Id != t.MediaId))
            await db.Entry(tr).Reference(t => t.Media).LoadAsync();
    }

    private static object ToDetailDto(ImagePopup p) => new
    {
        p.Id,
        p.Title,
        p.IsActive,
        p.ActivatedAt,
        p.CreatedAt,
        p.UpdatedAt,
        Translations = p.Translations.ToDictionary(t => t.Locale, t => new
        {
            t.MediaId,
            MediaName = t.Media?.OriginalName,
            t.Link,
            t.AltText,
        }),
    };
}
