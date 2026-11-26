using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class MediaContentController(CbarDbContext db) : ControllerBase
{
    /// <summary>Longest accepted search term; longer is a 400 rather than a silent cut.</summary>
    private const int MaxQueryLength = 200;

    /// <summary>
    /// Day boundaries of the video date filter are Baku days. Azerbaijan has no DST, so a
    /// fixed offset is exact and needs no tzdata in the container.
    /// </summary>
    private static readonly TimeSpan BakuOffset = TimeSpan.FromHours(4);

    /// <summary>Paged list of active galleries for a locale, newest event first.</summary>
    [HttpGet("api/v1/galleries")]
    public async Task<IActionResult> GetGalleries(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? q = null,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null)
    {
        // Clamped, not just floored: (page-1)*pageSize on a huge page overflows int
        // and Postgres rejects the resulting negative OFFSET.
        page = Math.Clamp(page, 1, 100_000);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var term = q?.Trim();
        if (term?.Length > MaxQueryLength)
            return BadRequest();

        var query = db.Galleries.AsNoTracking()
            .Where(g => g.IsActive && g.Translations.Any(t => t.Locale == locale));

        if (!string.IsNullOrEmpty(term))
        {
            var pattern = $"%{EscapeLike(term)}%";
            query = query.Where(g => g.Translations.Any(t => t.Locale == locale
                && EF.Functions.ILike(t.Title, pattern, @"\")));
        }
        // A null EventDate fails both comparisons, so undated galleries drop out once filtered.
        if (from is { } fromDay)
            query = query.Where(g => g.EventDate >= fromDay);
        if (to is { } toDay)
            query = query.Where(g => g.EventDate <= toDay);

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(g => g.SortOrder)
            .ThenByDescending(g => g.EventDate)
            .ThenByDescending(g => g.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => new
            {
                id = g.Id,
                title = g.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                eventDate = g.EventDate,
                imageCount = g.Images.Count,
                coverUrl = g.Images
                    .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
                    .Select(i => $"/media/{i.MediaId}")
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Single active gallery with its ordered images.</summary>
    [HttpGet("api/v1/galleries/{id:int}")]
    public async Task<IActionResult> GetGallery(int id, [FromQuery] string locale = "az")
    {
        var item = await db.Galleries.AsNoTracking()
            .Where(g => g.Id == id && g.IsActive && g.Translations.Any(t => t.Locale == locale))
            .Select(g => new
            {
                id = g.Id,
                title = g.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                eventDate = g.EventDate,
                images = g.Images
                    .OrderBy(i => i.SortOrder).ThenBy(i => i.Id)
                    .Select(i => new { mediaId = i.MediaId, url = $"/media/{i.MediaId}" })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Paged list of active videos for a locale, by sort order then newest first.</summary>
    [HttpGet("api/v1/videos")]
    public async Task<IActionResult> GetVideos(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? q = null,
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null)
    {
        // Clamped, not just floored: (page-1)*pageSize on a huge page overflows int
        // and Postgres rejects the resulting negative OFFSET.
        page = Math.Clamp(page, 1, 100_000);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var term = q?.Trim();
        if (term?.Length > MaxQueryLength)
            return BadRequest();

        var query = db.Videos.AsNoTracking()
            .Where(v => v.IsActive && v.Translations.Any(t => t.Locale == locale));

        if (!string.IsNullOrEmpty(term))
        {
            var pattern = $"%{EscapeLike(term)}%";
            query = query.Where(v => v.Translations.Any(t => t.Locale == locale
                && EF.Functions.ILike(t.Title, pattern, @"\")));
        }
        if (from is { } fromDay)
        {
            var start = StartOfBakuDay(fromDay);
            query = query.Where(v => v.PublishedAt >= start);
        }
        if (to is { } toDay)
        {
            var end = StartOfBakuDay(toDay.AddDays(1));
            query = query.Where(v => v.PublishedAt < end);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderBy(v => v.SortOrder)
            .ThenByDescending(v => v.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(v => new
            {
                id = v.Id,
                title = v.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                youtubeUrl = v.YoutubeUrl,
                publishedAt = v.PublishedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Single active video that has a translation in the locale.</summary>
    [HttpGet("api/v1/videos/{id:int}")]
    public async Task<IActionResult> GetVideo(int id, [FromQuery] string locale = "az")
    {
        var item = await db.Videos.AsNoTracking()
            .Where(v => v.Id == id && v.IsActive && v.Translations.Any(t => t.Locale == locale))
            .Select(v => new
            {
                id = v.Id,
                title = v.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                youtubeUrl = v.YoutubeUrl,
                publishedAt = v.PublishedAt,
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Currently live video streams for a locale.</summary>
    [HttpGet("api/v1/video-streams")]
    public async Task<IActionResult> GetVideoStreams([FromQuery] string locale = "az")
    {
        var items = await db.VideoStreams.AsNoTracking()
            .Where(s => s.IsLive && s.Translations.Any(t => t.Locale == locale))
            .OrderByDescending(s => s.StartsAt)
            .Select(s => new
            {
                id = s.Id,
                title = s.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                streamUrl = s.StreamUrl,
                startsAt = s.StartsAt,
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// The image popup for a locale: at most one element, the active popup activated
    /// last among those that have an image in this locale.
    /// </summary>
    [HttpGet("api/v1/image-popups")]
    public async Task<IActionResult> GetImagePopups([FromQuery] string locale = "az")
    {
        // One translation per (popup, locale), so querying translations yields one
        // row per popup.
        var items = await db.Set<ImagePopupTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Popup.IsActive
                // The MediaAsset query filter turns a soft-deleted asset into a null
                // navigation, so Media != null is what excludes it.
                && t.MediaId != null
                && t.Media != null
                && t.Media.DeletedAt == null)
            // Postgres sorts NULL first under DESC; a popup never activated goes last.
            .OrderBy(t => t.Popup.ActivatedAt == null)
            .ThenByDescending(t => t.Popup.ActivatedAt)
            .ThenByDescending(t => t.PopupId)
            .Take(1)
            .Select(t => new
            {
                id = t.PopupId,
                imageUrl = $"/media/{t.MediaId}",
                link = t.Link,
                altText = t.AltText,
            })
            .ToListAsync();

        return Ok(items);
    }

    // Npgsql only writes UTC DateTimeOffset values to timestamptz, hence ToUniversalTime().
    private static DateTimeOffset StartOfBakuDay(DateOnly day) =>
        new DateTimeOffset(day.ToDateTime(TimeOnly.MinValue), BakuOffset).ToUniversalTime();

    /// <summary>Makes `%`, `_` and the escape character itself match literally in ILIKE.</summary>
    private static string EscapeLike(string value) =>
        value.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_");
}
