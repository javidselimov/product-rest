using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record CsrCategoryTranslationDto(string Name);
public record CsrCategoryUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, CsrCategoryTranslationDto> Translations);

/// <summary>CSR project categories (spec 038). A plain lookup: deactivating hides it from new choices, deleting is hard.</summary>
[ApiController]
[RequirePermission(Permissions.Csr.Read)]
[Route("api/v1/csr-categories")]
public class CsrCategoriesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var categories = await db.CsrCategories.AsNoTracking()
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
        var item = await db.CsrCategories.AsNoTracking()
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);

        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Csr.Create)]
    public async Task<IActionResult> Create(CsrCategoryUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new CsrCategory { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.CsrCategories.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("csr.create", "csr_category", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Csr.Update)]
    public async Task<IActionResult> Update(int id, CsrCategoryUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.CsrCategories
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("csr.update", "csr_category", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Csr.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.CsrCategories.SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        // The FK is RESTRICT and a soft-deleted project still holds the row.
        if (await db.CsrProjects.IgnoreQueryFilters().AnyAsync(p => p.CategoryId == id))
            return ConflictProblem("The category is used by a project.");

        db.CsrCategories.Remove(entity);
        audit.Log("csr.delete", "csr_category", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static string? Invalid(CsrCategoryUpsertDto dto) =>
        dto.Translations.Count == 0 || dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Name))
            ? "A name is required."
            : null;

    private static void ApplyTranslations(CsrCategory entity, CsrCategoryUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new CsrCategoryTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(CsrCategory c) => new
    {
        c.Id,
        c.SortOrder,
        c.IsActive,
        Translations = c.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}
