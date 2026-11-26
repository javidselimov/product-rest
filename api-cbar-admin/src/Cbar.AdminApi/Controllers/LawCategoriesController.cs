using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record LawCategoryTranslationDto(string Name);
public record LawCategoryUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, LawCategoryTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.LawCategories.Read)]
[Route("api/v1/law-categories")]
public class LawCategoriesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.LawCategories.AsNoTracking()
            .Include(c => c.Translations)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.LawCategories.AsNoTracking()
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.LawCategories.Create)]
    public async Task<IActionResult> Create(LawCategoryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new LawCategory { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.LawCategories.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("law_categories.create", "law_category", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.LawCategories.Update)]
    public async Task<IActionResult> Update(int id, LawCategoryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.LawCategories
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("law_categories.update", "law_category", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.LawCategories.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.LawCategories.SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();
        if (await db.Laws.IgnoreQueryFilters().AnyAsync(l => l.CategoryId == id))
            return ConflictProblem("Category is referenced by laws; reassign or delete them first.");

        db.LawCategories.Remove(entity);
        audit.Log("law_categories.delete", "law_category", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(LawCategory entity, LawCategoryUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new LawCategoryTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(LawCategory c) => new
    {
        c.Id,
        c.SortOrder,
        c.IsActive,
        Translations = c.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}
