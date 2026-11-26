using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record ReleaseSchedulePeriodicityUpsertDto(
    int SortOrder,
    Dictionary<string, ReleaseScheduleNameTranslationDto> Translations);

/// <summary>
/// The managed periodicity list of the information disclosure schedule (spec 039), so the same value
/// is not typed differently in each row. Deleting is hard and refused while an item uses it.
/// </summary>
[ApiController]
[RequirePermission(Permissions.ReleaseSchedule.Read)]
[Route("api/v1/release-schedule/periodicities")]
public class ReleaseSchedulePeriodicitiesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var periodicities = await db.ReleaseSchedulePeriodicities.AsNoTracking()
            .Include(p => p.Translations)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .ToListAsync();

        var items = periodicities.Select(p => new
        {
            p.Id,
            p.SortOrder,
            Name = p.Translations.FirstOrDefault(t => t.Locale == "az")?.Name
                   ?? p.Translations.FirstOrDefault()?.Name,
            Translations = p.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
        });

        return Ok(new { items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.ReleaseSchedulePeriodicities.AsNoTracking()
            .Include(p => p.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);

        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.ReleaseSchedule.Create)]
    public async Task<IActionResult> Create(ReleaseSchedulePeriodicityUpsertDto dto)
    {
        if (ReleaseScheduleNames.Invalid(dto.Translations) is { } message)
            return BadRequestProblem(message);

        var entity = new ReleaseSchedulePeriodicity { SortOrder = dto.SortOrder };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.ReleaseSchedulePeriodicities.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("release_schedule.periodicity.create", "release_schedule_periodicity", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Update)]
    public async Task<IActionResult> Update(int id, ReleaseSchedulePeriodicityUpsertDto dto)
    {
        if (ReleaseScheduleNames.Invalid(dto.Translations) is { } message)
            return BadRequestProblem(message);

        var entity = await db.ReleaseSchedulePeriodicities
            .Include(p => p.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        ApplyTranslations(entity, dto);

        audit.Log("release_schedule.periodicity.update", "release_schedule_periodicity", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.ReleaseSchedulePeriodicities.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        // The FK is RESTRICT and a soft-deleted item still holds the row.
        if (await db.ReleaseScheduleItems.IgnoreQueryFilters().AnyAsync(i => i.PeriodicityId == id))
            return ConflictProblem("The periodicity is used by an item.");

        db.ReleaseSchedulePeriodicities.Remove(entity);
        audit.Log("release_schedule.periodicity.delete", "release_schedule_periodicity", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(ReleaseSchedulePeriodicity entity, ReleaseSchedulePeriodicityUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new ReleaseSchedulePeriodicityTranslation { Locale = locale, Name = tr.Name.Trim() });
            else
                existing.Name = tr.Name.Trim();
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(ReleaseSchedulePeriodicity p) => new
    {
        p.Id,
        p.SortOrder,
        Translations = p.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}
