using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record BannerTranslationDto(string? Title, string? Link);
public record BannerUpsertDto(
    long? MediaId,
    int SortOrder,
    bool IsActive,
    DateTimeOffset? StartsAt,
    DateTimeOffset? EndsAt,
    Dictionary<string, BannerTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.Banners.Read)]
[Route("api/v1/banners")]
public class BannersController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.Banners.AsNoTracking()
            .Include(b => b.Translations)
            .Include(b => b.Media)
            .OrderBy(b => b.SortOrder).ThenBy(b => b.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.Banners.AsNoTracking()
            .Include(b => b.Translations)
            .Include(b => b.Media)
            .SingleOrDefaultAsync(b => b.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Banners.Create)]
    public async Task<IActionResult> Create(BannerUpsertDto dto)
    {
        // Every banner translation field is optional, so an image-only banner is a
        // valid record; only a banner with neither image nor text is rejected.
        if (dto.MediaId is null && dto.Translations.Count == 0)
            return BadRequestProblem("A banner needs an image or at least one translation.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = new Banner
        {
            MediaId = dto.MediaId,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            StartsAt = dto.StartsAt,
            EndsAt = dto.EndsAt,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Banners.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("banners.create", "banner", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Banners.Update)]
    public async Task<IActionResult> Update(int id, BannerUpsertDto dto)
    {
        // Every banner translation field is optional, so an image-only banner is a
        // valid record; only a banner with neither image nor text is rejected.
        if (dto.MediaId is null && dto.Translations.Count == 0)
            return BadRequestProblem("A banner needs an image or at least one translation.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = await db.Banners
            .Include(b => b.Translations)
            .SingleOrDefaultAsync(b => b.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.MediaId = dto.MediaId;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.StartsAt = dto.StartsAt;
        entity.EndsAt = dto.EndsAt;
        ApplyTranslations(entity, dto);

        audit.Log("banners.update", "banner", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Banners.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Banners.SingleOrDefaultAsync(b => b.Id == id);
        if (entity is null)
            return NotFound();

        db.Banners.Remove(entity);   // hard delete
        audit.Log("banners.delete", "banner", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(Banner entity, BannerUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new BannerTranslation { Locale = locale, Title = tr.Title, Link = tr.Link });
            }
            else
            {
                existing.Title = tr.Title;
                existing.Link = tr.Link;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(Banner b) => new
    {
        b.Id,
        b.MediaId,
        b.Media?.OriginalName,
        b.SortOrder,
        b.IsActive,
        b.StartsAt,
        b.EndsAt,
        b.UpdatedAt,
        Translations = b.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Link }),
    };
}
