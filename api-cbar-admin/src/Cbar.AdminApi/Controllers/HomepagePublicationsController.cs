using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record HomepagePublicationTranslationDto(string Title, string? Url);
public record HomepagePublicationUpsertDto(
    long? MediaId,
    DateTimeOffset? PublishedAt,
    int SortOrder,
    bool IsActive,
    Dictionary<string, HomepagePublicationTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.HomepagePublications.Read)]
[Route("api/v1/homepage-publications")]
public class HomepagePublicationsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.HomepagePublications.AsNoTracking()
            .Include(p => p.Translations)
            .Include(p => p.Media)
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.HomepagePublications.AsNoTracking()
            .Include(p => p.Translations)
            .Include(p => p.Media)
            .SingleOrDefaultAsync(p => p.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.HomepagePublications.Create)]
    public async Task<IActionResult> Create(HomepagePublicationUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = new HomepagePublication
        {
            MediaId = dto.MediaId,
            PublishedAt = dto.PublishedAt,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.HomepagePublications.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("homepage_publications.create", "homepage_publication", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.HomepagePublications.Update)]
    public async Task<IActionResult> Update(int id, HomepagePublicationUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = await db.HomepagePublications
            .Include(p => p.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.MediaId = dto.MediaId;
        entity.PublishedAt = dto.PublishedAt;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("homepage_publications.update", "homepage_publication", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.HomepagePublications.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.HomepagePublications.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        db.HomepagePublications.Remove(entity);   // hard delete
        audit.Log("homepage_publications.delete", "homepage_publication", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(HomepagePublication entity, HomepagePublicationUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new HomepagePublicationTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Url = tr.Url,
                });
            }
            else
            {
                existing.Title = tr.Title;
                existing.Url = tr.Url;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(HomepagePublication p) => new
    {
        p.Id,
        p.MediaId,
        p.Media?.OriginalName,
        p.PublishedAt,
        p.SortOrder,
        p.IsActive,
        p.UpdatedAt,
        Translations = p.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Url }),
    };
}
