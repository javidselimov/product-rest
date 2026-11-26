using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record ReleaseScheduleItemTranslationDto(string Title, string? Timing);
public record ReleaseScheduleItemUpsertDto(
    int GroupId,
    int? PeriodicityId,
    ReleaseTimingMode TimingMode,
    string? TimingUrl,
    int SortOrder,
    ContentStatus Status,
    bool ShowAz,
    bool ShowEn,
    Dictionary<string, ReleaseScheduleItemTranslationDto> Translations);

/// <summary>
/// Rows of the information disclosure schedule (spec 039): what is published, how often and by when.
/// Replaces the hand-typed table of legacy page 72.
/// </summary>
[ApiController]
[RequirePermission(Permissions.ReleaseSchedule.Read)]
[Route("api/v1/release-schedule/items")]
public class ReleaseScheduleItemsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const int TimingUrlMaxLength = 1000;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        [FromQuery] int? groupId = null, [FromQuery] int? periodicityId = null)
    {
        var query = db.ReleaseScheduleItems.AsNoTracking();
        if (status is not null)
            query = query.Where(i => i.Status == status);
        if (groupId is not null)
            query = query.Where(i => i.GroupId == groupId);
        if (periodicityId is not null)
            query = query.Where(i => i.PeriodicityId == periodicityId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(i => i.Translations.Any(t => EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(i => i.Group.SortOrder).ThenBy(i => i.GroupId).ThenBy(i => i.SortOrder).ThenBy(i => i.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(i => new
            {
                i.Id,
                Title = i.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? i.Translations.Select(t => t.Title).FirstOrDefault(),
                Group = i.Group.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                        ?? i.Group.Translations.Select(t => t.Name).FirstOrDefault(),
                Periodicity = i.Periodicity == null
                    ? null
                    : i.Periodicity.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                      ?? i.Periodicity.Translations.Select(t => t.Name).FirstOrDefault(),
                i.TimingMode,
                i.SortOrder,
                Status = i.Status.ToString().ToLowerInvariant(),
                i.ShowAz,
                i.ShowEn,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await LoadAsync(id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.ReleaseSchedule.Create)]
    public async Task<IActionResult> Create(ReleaseScheduleItemUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new ReleaseScheduleItem();
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.ReleaseScheduleItems.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("release_schedule.item.create", "release_schedule_item", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto((await LoadAsync(entity.Id))!));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Update)]
    public async Task<IActionResult> Update(int id, ReleaseScheduleItemUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.ReleaseScheduleItems
            .Include(i => i.Translations)
            .SingleOrDefaultAsync(i => i.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        Apply(entity, dto);

        audit.Log("release_schedule.item.update", "release_schedule_item", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto((await LoadAsync(id))!));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.ReleaseSchedule.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.ReleaseScheduleItems.SingleOrDefaultAsync(i => i.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("release_schedule.item.delete", "release_schedule_item", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<ReleaseScheduleItem?> LoadAsync(int id) => db.ReleaseScheduleItems.AsNoTracking()
        .Include(i => i.Translations)
        .SingleOrDefaultAsync(i => i.Id == id);


    /// <summary>The first thing wrong with the request, or null.</summary>
    private async Task<string?> InvalidAsync(ReleaseScheduleItemUpsertDto dto)
    {
        if (dto.Translations is null || dto.Translations.Count == 0)
            return "At least one language is required.";
        if (dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Title)))
            return "A title is required.";
        if (dto.Status == ContentStatus.Scheduled)
            return "An item cannot be scheduled.";
        if (!Enum.IsDefined(dto.TimingMode))
            return "The timing mode is not valid.";
        if (dto.TimingMode == ReleaseTimingMode.Link)
        {
            var link = dto.TimingUrl?.Trim();
            if (string.IsNullOrEmpty(link))
                return "A link is required for the link mode.";
            if (link.Length > TimingUrlMaxLength || !ContentSupport.IsAllowedLink(link))
                return "The link must start with http://, https:// or /.";
        }
        if (!await db.ReleaseScheduleGroups.AnyAsync(g => g.Id == dto.GroupId))
            return "The group does not exist.";
        if (dto.PeriodicityId is { } periodicityId
            && !await db.ReleaseSchedulePeriodicities.AnyAsync(p => p.Id == periodicityId))
            return "The periodicity does not exist.";
        return null;
    }

    private static void Apply(ReleaseScheduleItem entity, ReleaseScheduleItemUpsertDto dto)
    {
        entity.GroupId = dto.GroupId;
        entity.PeriodicityId = dto.PeriodicityId;
        entity.TimingMode = dto.TimingMode;
        // The CHECK in 0022 allows a link only in the link mode.
        entity.TimingUrl = dto.TimingMode == ReleaseTimingMode.Link ? dto.TimingUrl!.Trim() : null;
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        entity.ShowAz = dto.ShowAz;
        entity.ShowEn = dto.ShowEn;

        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new ReleaseScheduleItemTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Title = tr.Title.Trim();
            existing.Timing = string.IsNullOrWhiteSpace(tr.Timing) ? null : tr.Timing.Trim();
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(ReleaseScheduleItem i) => new
    {
        i.Id,
        i.GroupId,
        i.PeriodicityId,
        i.TimingMode,
        i.TimingUrl,
        i.SortOrder,
        Status = i.Status.ToString().ToLowerInvariant(),
        i.ShowAz,
        i.ShowEn,
        i.CreatedAt,
        i.UpdatedAt,
        Translations = i.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Timing }),
    };
}
