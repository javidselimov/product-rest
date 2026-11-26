using System.Globalization;
using System.Linq.Expressions;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Cbar.WebApi.Time;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// Events (spec 034). Unlike press releases there is no publication embargo: an upcoming event is
/// public, and only the status decides what is shown.
/// </summary>
[ApiController]
public class EventsController(CbarDbContext db) : ControllerBase
{
    /// <summary>Longest accepted search term; longer is a 400 rather than a silent cut.</summary>
    private const int MaxQueryLength = 200;
    private const int MaxPage = 100_000;
    /// <summary>"Show more" on the site asks for one growing page, so this is above the other lists.</summary>
    private const int MaxPageSize = 500;
    private const string Upcoming = "upcoming";
    private const string Past = "past";
    /// <summary>`sort` value: start date descending across past and upcoming, later time first (spec 059).</summary>
    private const string Newest = "newest";
    private const string TimeFormat = "HH:mm";

    private record EventRow(
        int Id, string Title, string Slug, short? Type, int? CategoryId, string? CategoryName,
        DateOnly StartsOn, DateOnly? EndsOn, TimeOnly? StartTime, string? Location, string? PageSlug);

    private record EventCategoryItem(int Id, string Name);

    private record EventListItem(
        int Id, string Title, string Slug, short? Type, EventCategoryItem? Category,
        DateOnly StartsOn, DateOnly? EndsOn, string? StartTime, string? Location, bool Upcoming, string? PageSlug);

    /// <summary>Published events for a locale, split on the Baku day when <paramref name="when"/> is given.</summary>
    [HttpGet("api/v1/events")]
    public async Task<IActionResult> GetList(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? when = null,
        [FromQuery] string? q = null,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery] short? type = null,
        [FromQuery] int? categoryId = null,
        [FromQuery] string? sort = null)
    {
        page = Math.Clamp(page, 1, MaxPage);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var term = q?.Trim();
        if (term?.Length > MaxQueryLength || when is not (null or Upcoming or Past) || sort is not (null or Newest))
            return BadRequest();

        var today = BakuClock.Today();
        var query = PublicTranslations(locale);
        if (when == Upcoming)
            query = query.Where(t => (t.Event.EndsOn ?? t.Event.StartsOn) >= today);
        if (when == Past)
            query = query.Where(t => (t.Event.EndsOn ?? t.Event.StartsOn) < today);
        if (!string.IsNullOrEmpty(term))
            query = query.Where(t => EF.Functions.ILike(t.Title, $"%{EscapeLike(term)}%", @"\"));
        if (from is { } first)
            query = query.Where(t => (t.Event.EndsOn ?? t.Event.StartsOn) >= first);
        if (to is { } last)
            query = query.Where(t => t.Event.StartsOn <= last);
        if (type is not null)
            query = query.Where(t => t.Event.Type == type);
        if (categoryId is not null)
            query = query.Where(t => t.Event.CategoryId == categoryId);

        var total = await query.CountAsync();
        var rows = await Ordered(query, when, sort)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(ToRow(locale))
            .ToListAsync();

        return Ok(new { items = rows.Select(r => ToListItem(r, today)), total, page, pageSize });
    }

    /// <summary>
    /// List order. Without <paramref name="sort"/>: upcoming and unfiltered oldest first, past newest
    /// first, both with the earlier time first (spec 034, unchanged). <c>newest</c>: newest day first and, within a day, the later
    /// time first (spec 059). Events without a time come last in every order, and the title breaks ties.
    /// </summary>
    internal static IOrderedQueryable<EventTranslation> Ordered(IQueryable<EventTranslation> query, string? when, string? sort)
    {
        if (sort == Newest)
            return query
                .OrderByDescending(t => t.Event.StartsOn)
                .ThenBy(t => t.Event.StartTime == null)
                .ThenByDescending(t => t.Event.StartTime)
                .ThenBy(t => t.Title);

        var byDate = when == Past
            ? query.OrderByDescending(t => t.Event.StartsOn)
            : query.OrderBy(t => t.Event.StartsOn);
        return byDate
            .ThenBy(t => t.Event.StartTime == null)
            .ThenBy(t => t.Event.StartTime)
            .ThenBy(t => t.Title);
    }

    /// <summary>Single published event by locale-scoped slug, with its gallery and press release.</summary>
    [HttpGet("api/v1/events/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string locale = "az")
    {
        var translation = PublicTranslations(locale).Where(t => t.Slug == slug);
        var row = await translation.Select(ToRow(locale)).FirstOrDefaultAsync();
        if (row is null)
            return NotFound();

        var extra = await translation
            .Select(t => new { t.Content, t.Event.GalleryId, t.Event.PressReleaseId })
            .FirstAsync();

        var gallery = await db.Galleries.AsNoTracking()
            .Where(g => g.Id == extra.GalleryId && g.IsActive)
            .Select(g => new
            {
                title = g.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                images = g.Images
                    .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
                    .Select(i => new { mediaId = i.MediaId, url = $"/media/{i.MediaId}" })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        var now = DateTimeOffset.UtcNow;
        var pressRelease = await db.PressReleaseTranslations.AsNoTracking()
            .Where(t => t.PressReleaseId == extra.PressReleaseId
                && t.Locale == locale
                && t.PressRelease.Status == ContentStatus.Published
                && t.PressRelease.PublishedAt <= now)
            .Select(t => new { title = t.Title, slug = t.Slug })
            .FirstOrDefaultAsync();

        var item = ToListItem(row, BakuClock.Today());
        return Ok(new
        {
            id = item.Id,
            title = item.Title,
            slug = item.Slug,
            type = item.Type,
            category = item.Category,
            startsOn = item.StartsOn,
            endsOn = item.EndsOn,
            startTime = item.StartTime,
            location = item.Location,
            upcoming = item.Upcoming,
            pageSlug = item.PageSlug,
            content = extra.Content,
            gallery,
            pressRelease,
        });
    }

    /// <summary>Active categories named in the locale; one without events is still a filter tab.</summary>
    [HttpGet("api/v1/event-categories")]
    public async Task<IActionResult> GetCategories([FromQuery] string locale = "az")
    {
        var items = await db.EventCategoryTranslations.AsNoTracking()
            .Where(t => t.Locale == locale && t.Category.IsActive)
            .OrderBy(t => t.Category.SortOrder).ThenBy(t => t.Name)
            .Select(t => new { id = t.CategoryId, name = t.Name })
            .ToListAsync();

        return Ok(new { items });
    }

    private IQueryable<EventTranslation> PublicTranslations(string locale) =>
        db.EventTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Event.Status == ContentStatus.Published
                && t.Event.DeletedAt == null);

    /// <summary><c>Visible</c> is not checked: it only hides a page from the menu.</summary>
    private static Expression<Func<EventTranslation, EventRow>> ToRow(string locale) => t => new EventRow(
        t.EventId,
        t.Title,
        t.Slug,
        t.Event.Type,
        t.Event.CategoryId,
        t.Event.Category!.Translations.Where(c => c.Locale == locale).Select(c => c.Name).FirstOrDefault(),
        t.Event.StartsOn,
        t.Event.EndsOn,
        t.Event.StartTime,
        t.Location,
        t.Event.Page != null
            && t.Event.Page.Status == ContentStatus.Published
            && t.Event.Page.Active
            && (locale == "en" ? t.Event.Page.ShowEn : t.Event.Page.ShowAz)
            ? t.Event.Page.Translations.Where(p => p.Locale == locale).Select(p => p.Slug).FirstOrDefault()
            : null);

    private static EventListItem ToListItem(EventRow r, DateOnly today) => new(
        r.Id,
        r.Title,
        r.Slug,
        r.Type,
        r.CategoryName is null ? null : new EventCategoryItem(r.CategoryId!.Value, r.CategoryName),
        r.StartsOn,
        r.EndsOn,
        r.StartTime?.ToString(TimeFormat, CultureInfo.InvariantCulture),
        r.Location,
        (r.EndsOn ?? r.StartsOn) >= today,
        r.PageSlug);

    private static string EscapeLike(string value) =>
        value.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_");
}
