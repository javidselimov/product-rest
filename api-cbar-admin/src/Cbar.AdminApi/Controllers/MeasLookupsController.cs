using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record MeasLookupTranslationDto(string Name);
public record MeasLookupUpsertDto(bool IsActive, Dictionary<string, MeasLookupTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.Meas.Read)]
[Route("api/v1/meas-emitents")]
public class MeasEmitentsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.MeasEmitents.AsNoTracking()
            .Include(e => e.Translations)
            .OrderBy(e => e.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.MeasEmitents.AsNoTracking()
            .Include(e => e.Translations)
            .SingleOrDefaultAsync(e => e.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Meas.Create)]
    public async Task<IActionResult> Create(MeasLookupUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new MeasEmitent { IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MeasEmitents.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("meas_emitents.create", "meas_emitent", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Meas.Update)]
    public async Task<IActionResult> Update(int id, MeasLookupUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.MeasEmitents
            .Include(e => e.Translations)
            .SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("meas_emitents.update", "meas_emitent", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Meas.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MeasEmitents.SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();
        if (await db.MeasDocuments.IgnoreQueryFilters().AnyAsync(d => d.EmitentId == id))
            return ConflictProblem("Emitent is referenced by documents; reassign or delete them first.");

        db.MeasEmitents.Remove(entity);
        audit.Log("meas_emitents.delete", "meas_emitent", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(MeasEmitent entity, MeasLookupUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new MeasEmitentTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(MeasEmitent e) => new
    {
        e.Id,
        e.IsActive,
        e.UpdatedAt,
        Translations = e.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}

[ApiController]
[RequirePermission(Permissions.Meas.Read)]
[Route("api/v1/meas-info-types")]
public class MeasInfoTypesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.MeasInfoTypes.AsNoTracking()
            .Include(e => e.Translations)
            .OrderBy(e => e.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.MeasInfoTypes.AsNoTracking()
            .Include(e => e.Translations)
            .SingleOrDefaultAsync(e => e.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Meas.Create)]
    public async Task<IActionResult> Create(MeasLookupUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new MeasInfoType { IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MeasInfoTypes.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("meas_info_types.create", "meas_info_type", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Meas.Update)]
    public async Task<IActionResult> Update(int id, MeasLookupUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.MeasInfoTypes
            .Include(e => e.Translations)
            .SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("meas_info_types.update", "meas_info_type", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Meas.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MeasInfoTypes.SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();
        if (await db.MeasDocuments.IgnoreQueryFilters().AnyAsync(d => d.InfoTypeId == id))
            return ConflictProblem("Info type is referenced by documents; reassign or delete them first.");

        db.MeasInfoTypes.Remove(entity);
        audit.Log("meas_info_types.delete", "meas_info_type", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(MeasInfoType entity, MeasLookupUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new MeasInfoTypeTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(MeasInfoType e) => new
    {
        e.Id,
        e.IsActive,
        e.UpdatedAt,
        Translations = e.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}
