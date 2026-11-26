using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

/// <summary>A name in one locale; shared by schedule groups and periodicities.</summary>
public record ReleaseScheduleNameTranslationDto(string Name);
public record ReleaseScheduleGroupUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, ReleaseScheduleNameTranslationDto> Translations);

/// <summary>
/// Section headings of the information disclosure schedule (spec 039). A plain lookup: an inactive
/// group and its items do not show on the site; deleting is hard and refused while an item uses it.
/// </summary>
[ApiController]
[RequirePermission(Permissions.ReleaseSchedule.Read)]
[Route("api/v1/release-schedule/groups")]
public class ReleaseScheduleGroupsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var groups = await db.ReleaseScheduleGroups.AsNoTracking()
            .Include(g => g.Translations)
            .OrderBy(g => g.SortOrder).ThenBy(g => g.Id)
            .ToListAsync();

        // The panel's lookup reads `translations`, the list reads `name`.
        var items = groups.Select(g => new
        {
            g.Id,
            g.SortOrder,
            g.IsActive,
            Name = g.Translations.FirstOrDefault(t => t.Locale == "az")?.Name
                   ?? g.Translations.FirstOrDefault()?.Name,
            Translations = g.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
        });

        return Ok(new { items });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.ReleaseScheduleGroups.AsNoTracking()
            .Include(g => g.Translations)
            .SingleOrDefaultAsync(g => g.Id == id);

        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.ReleaseSchedule.Create)]
    public async Task<IActionResult> Create(ReleaseScheduleGroupUpsertDto dto)
    {
        if (ReleaseScheduleNames.Invalid(dto.Translations) is { } message)
            return BadRequestProblem(message);

        var entity = new ReleaseScheduleGroup { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.ReleaseScheduleGroups.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("release_schedule.group.create", "release_schedule_group", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Update)]
    public async Task<IActionResult> Update(int id, ReleaseScheduleGroupUpsertDto dto)
    {
        if (ReleaseScheduleNames.Invalid(dto.Translations) is { } message)
            return BadRequestProblem(message);

        var entity = await db.ReleaseScheduleGroups
            .Include(g => g.Translations)
            .SingleOrDefaultAsync(g => g.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("release_schedule.group.update", "release_schedule_group", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.ReleaseScheduleGroups.SingleOrDefaultAsync(g => g.Id == id);
        if (entity is null)
            return NotFound();

        // The FK is RESTRICT and a soft-deleted item still holds the row.
        if (await db.ReleaseScheduleItems.IgnoreQueryFilters().AnyAsync(i => i.GroupId == id))
            return ConflictProblem("The group is used by an item.");

        db.ReleaseScheduleGroups.Remove(entity);
        audit.Log("release_schedule.group.delete", "release_schedule_group", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(ReleaseScheduleGroup entity, ReleaseScheduleGroupUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new ReleaseScheduleGroupTranslation { Locale = locale, Name = tr.Name.Trim() });
            else
                existing.Name = tr.Name.Trim();
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(ReleaseScheduleGroup g) => new
    {
        g.Id,
        g.SortOrder,
        g.IsActive,
        Translations = g.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}

/// <summary>Validation shared by the two name lookups of the schedule.</summary>
internal static class ReleaseScheduleNames
{
    public static string? Invalid(Dictionary<string, ReleaseScheduleNameTranslationDto>? translations) =>
        translations is null || translations.Count == 0 || translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Name))
            ? "A name is required."
            : null;
}
