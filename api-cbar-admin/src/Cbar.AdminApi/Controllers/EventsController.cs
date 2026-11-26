using System.Globalization;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record EventTranslationDto(string Title, string? Location, string? Content);
/// <param name="Type">1 decision, 2 press conference, 3 conference, 4 seminar, or null.</param>
/// <param name="StartTime">HH:mm, Asia/Baku time.</param>
public record EventUpsertDto(
    short? Type,
    int? CategoryId,
    ContentStatus Status,
    DateOnly StartsOn,
    DateOnly? EndsOn,
    string? StartTime,
    int? GalleryId,
    int? PressReleaseId,
    int? PageId,
    Dictionary<string, EventTranslationDto> Translations);

/// <summary>Events (spec 034).</summary>
[ApiController]
[RequirePermission(Permissions.Events.Read)]
[Route("api/v1/events")]
public class EventsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const short FirstType = 1;
    private const short LastType = 4;
    private const string TimeFormat = "HH:mm";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        [FromQuery] short? type = null, [FromQuery] int? categoryId = null)
    {
        var query = db.Events.AsNoTracking();
        if (status is not null)
            query = query.Where(e => e.Status == status);
        if (type is not null)
            query = query.Where(e => e.Type == type);
        if (categoryId is not null)
            query = query.Where(e => e.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(e => e.Translations.Any(t => EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.StartsOn).ThenByDescending(e => e.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(e => new
            {
                e.Id,
                e.Type,
                Status = e.Status.ToString().ToLowerInvariant(),
                e.StartsOn,
                e.EndsOn,
                Title = e.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? e.Translations.Select(t => t.Title).FirstOrDefault(),
                CategoryName = e.Category!.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                               ?? e.Category!.Translations.Select(t => t.Name).FirstOrDefault(),
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
    [RequirePermission(Permissions.Events.Create)]
    public async Task<IActionResult> Create(EventUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new Event();
        Apply(entity, dto);
        await ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Events.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("events.create", "event", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto((await LoadAsync(entity.Id))!));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Events.Update)]
    public async Task<IActionResult> Update(int id, EventUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.Events
            .Include(e => e.Translations)
            .SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto((await LoadAsync(id))!);
        Apply(entity, dto);
        await ApplyTranslations(entity, dto);

        audit.Log("events.update", "event", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto((await LoadAsync(id))!));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Events.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Events.SingleOrDefaultAsync(e => e.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("events.delete", "event", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<Event?> LoadAsync(int id) => db.Events.AsNoTracking()
        .Include(e => e.Translations)
        .Include(e => e.Category).ThenInclude(c => c!.Translations)
        .Include(e => e.Gallery).ThenInclude(g => g!.Translations)
        .Include(e => e.PressRelease).ThenInclude(p => p!.Translations)
        .Include(e => e.Page).ThenInclude(p => p!.Translations)
        .AsSplitQuery()
        .SingleOrDefaultAsync(e => e.Id == id);

    /// <summary>The first thing wrong with the request, or null. The FKs are conditional (0018), so ids are checked here.</summary>
    private async Task<string?> InvalidAsync(EventUpsertDto dto)
    {
        if (dto.Translations.Count == 0 || dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Title)))
            return "A title is required.";
        if (dto.Type is < FirstType or > LastType)
            return "Type must be 1 (decision), 2 (press conference), 3 (conference) or 4 (seminar).";
        if (dto.Status == ContentStatus.Scheduled)
            return "An event cannot be scheduled.";
        if (dto.EndsOn < dto.StartsOn)
            return "The end date cannot be before the start date.";
        if (dto.StartTime is not null && ParseTime(dto.StartTime) is null)
            return "The start time must be HH:mm.";
        if (dto.CategoryId is { } categoryId && !await db.EventCategories.AnyAsync(c => c.Id == categoryId))
            return "The category does not exist.";
        if (dto.GalleryId is { } galleryId && !await db.Galleries.AnyAsync(g => g.Id == galleryId))
            return "The gallery does not exist.";
        if (dto.PressReleaseId is { } pressReleaseId && !await db.PressReleases.AnyAsync(p => p.Id == pressReleaseId))
            return "The press release does not exist.";
        if (dto.PageId is { } pageId && !await db.Pages.AnyAsync(p => p.Id == pageId))
            return "The page does not exist.";
        return null;
    }

    private static TimeOnly? ParseTime(string value) =>
        TimeOnly.TryParseExact(value, TimeFormat, CultureInfo.InvariantCulture, DateTimeStyles.None, out var time) ? time : null;

    private static void Apply(Event entity, EventUpsertDto dto)
    {
        entity.Type = dto.Type;
        entity.CategoryId = dto.CategoryId;
        entity.Status = dto.Status;
        entity.StartsOn = dto.StartsOn;
        entity.EndsOn = dto.EndsOn;
        entity.StartTime = dto.StartTime is null ? null : ParseTime(dto.StartTime);
        entity.GalleryId = dto.GalleryId;
        entity.PressReleaseId = dto.PressReleaseId;
        entity.PageId = dto.PageId;
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value;

    private async Task ApplyTranslations(Event entity, EventUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new EventTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlug.ForAsync(
                        db.EventTranslations.Where(t => t.Locale == locale).Select(t => t.Slug),
                        tr.Title),
                    Location = Blank(tr.Location),
                    Content = tr.Content,
                });
            }
            else
            {
                if (existing.Title != tr.Title)
                    existing.Slug = await UniqueSlug.ForAsync(
                        db.EventTranslations.Where(t => t.Locale == locale && t.Id != existing.Id).Select(t => t.Slug),
                        tr.Title);
                existing.Title = tr.Title;
                existing.Location = Blank(tr.Location);
                existing.Content = tr.Content;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object? Link<T>(int? id, IEnumerable<T>? translations, Func<T, string> locale, Func<T, string> title) =>
        id is null || translations is null
            ? null
            : new
            {
                Id = id,
                Title = translations.Where(t => locale(t) == "az").Select(title).FirstOrDefault()
                        ?? translations.Select(title).FirstOrDefault(),
            };

    private static object ToDetailDto(Event e) => new
    {
        e.Id,
        e.Type,
        e.CategoryId,
        Status = e.Status.ToString().ToLowerInvariant(),
        e.StartsOn,
        e.EndsOn,
        StartTime = e.StartTime?.ToString(TimeFormat, CultureInfo.InvariantCulture),
        e.GalleryId,
        e.PressReleaseId,
        e.PageId,
        Category = Link(e.CategoryId, e.Category?.Translations, t => t.Locale, t => t.Name),
        Gallery = Link(e.GalleryId, e.Gallery?.Translations, t => t.Locale, t => t.Title),
        PressRelease = Link(e.PressReleaseId, e.PressRelease?.Translations, t => t.Locale, t => t.Title),
        Page = Link(e.PageId, e.Page?.Translations, t => t.Locale, t => t.Title),
        Translations = e.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Location, t.Content }),
    };
}
