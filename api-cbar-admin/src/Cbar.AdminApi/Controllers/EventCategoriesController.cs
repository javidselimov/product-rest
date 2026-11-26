using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record EventCategoryTranslationDto(string Name);
public record EventCategoryUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, EventCategoryTranslationDto> Translations);

/// <summary>Event categories (spec 034). A plain lookup: deactivating hides it, deleting is hard.</summary>
[ApiController]
[RequirePermission(Permissions.Events.Read)]
[Route("api/v1/event-categories")]
public class EventCategoriesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var categories = await db.EventCategories.AsNoTracking()
            .Include(c => c.Translations)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
            .ToListAsync();

        // The panel's lookup reads `translations`, the list reads `name`.
        var items = categories.Select(c => new
        {
            c.Id,
            c.SortOrder,
            c.IsActive,
            Name = c.Translations.FirstOrDefault(t => t.Locale == "az")?.Name
                   ?? c.Translations.FirstOrDefault()?.Name,
            Translations = c.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
        });

        return Ok(new { items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.EventCategories.AsNoTracking()
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);

        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Events.Create)]
    public async Task<IActionResult> Create(EventCategoryUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new EventCategory { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.EventCategories.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("events.create", "event_category", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Events.Update)]
    public async Task<IActionResult> Update(int id, EventCategoryUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.EventCategories
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("events.update", "event_category", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Events.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.EventCategories.SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        // The query filter leaves soft-deleted events out: their category is cleared by the FK.
        if (await db.Events.AnyAsync(e => e.CategoryId == id))
            return ConflictProblem("The category is used by an event.");

        db.EventCategories.Remove(entity);
        audit.Log("events.delete", "event_category", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static string? Invalid(EventCategoryUpsertDto dto) =>
        dto.Translations.Count == 0 || dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Name))
            ? "A name is required."
            : null;

    private static void ApplyTranslations(EventCategory entity, EventCategoryUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new EventCategoryTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(EventCategory c) => new
    {
        c.Id,
        c.SortOrder,
        c.IsActive,
        Translations = c.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}
