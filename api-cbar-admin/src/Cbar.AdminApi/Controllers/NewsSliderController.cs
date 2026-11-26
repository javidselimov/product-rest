using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record NewsSliderTranslationDto(string Title, string? Description, string? Link);
public record NewsSliderUpsertDto(
    DateOnly NewsDate,
    long? MediaId,
    int SortOrder,
    bool IsActive,
    Dictionary<string, NewsSliderTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.NewsSlider.Read)]
[Route("api/v1/news-slider")]
public class NewsSliderController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.NewsSliderItems.AsNoTracking()
            .Include(n => n.Translations)
            .Include(n => n.Media)
            .OrderBy(n => n.SortOrder).ThenByDescending(n => n.NewsDate)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.NewsSliderItems.AsNoTracking()
            .Include(n => n.Translations)
            .Include(n => n.Media)
            .SingleOrDefaultAsync(n => n.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.NewsSlider.Create)]
    public async Task<IActionResult> Create(NewsSliderUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = new NewsSliderItem
        {
            NewsDate = dto.NewsDate,
            MediaId = dto.MediaId,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.NewsSliderItems.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("news_slider.create", "news_slider_item", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.NewsSlider.Update)]
    public async Task<IActionResult> Update(int id, NewsSliderUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = await db.NewsSliderItems
            .Include(n => n.Translations)
            .SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.NewsDate = dto.NewsDate;
        entity.MediaId = dto.MediaId;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("news_slider.update", "news_slider_item", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.NewsSlider.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.NewsSliderItems.SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();

        db.NewsSliderItems.Remove(entity);   // hard delete
        audit.Log("news_slider.delete", "news_slider_item", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(NewsSliderItem entity, NewsSliderUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new NewsSliderItemTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Description = tr.Description,
                    Link = tr.Link,
                });
            }
            else
            {
                existing.Title = tr.Title;
                existing.Description = tr.Description;
                existing.Link = tr.Link;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(NewsSliderItem n) => new
    {
        n.Id,
        n.NewsDate,
        n.MediaId,
        n.Media?.OriginalName,
        n.SortOrder,
        n.IsActive,
        n.UpdatedAt,
        Translations = n.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Description, t.Link }),
    };
}
