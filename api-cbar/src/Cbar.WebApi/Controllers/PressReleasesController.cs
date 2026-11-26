using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class PressReleasesController(CbarDbContext db) : ControllerBase
{
    /// <summary>Longest accepted search term; longer is a 400 rather than a silent cut.</summary>
    private const int MaxQueryLength = 200;

    /// <summary>
    /// Day boundaries of the date filter are Baku days. Azerbaijan has no DST, so a fixed
    /// offset is exact and needs no tzdata in the container.
    /// </summary>
    private static readonly TimeSpan BakuOffset = TimeSpan.FromHours(4);

    /// <summary>Paged list of published press releases for a locale, newest first.</summary>
    [HttpGet("api/v1/press-releases")]
    public async Task<IActionResult> GetList(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] short? type = null,
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

        var now = DateTimeOffset.UtcNow;
        var query = db.PressReleaseTranslations
            .Where(t => t.Locale == locale
                && t.PressRelease.Status == ContentStatus.Published
                && t.PressRelease.PublishedAt <= now
                && (type == null || t.PressRelease.Type == type));

        if (!string.IsNullOrEmpty(term))
        {
            var pattern = $"%{EscapeLike(term)}%";
            query = query.Where(t => EF.Functions.ILike(t.Title, pattern, @"\"));
        }
        if (from is { } fromDay)
        {
            var start = StartOfBakuDay(fromDay);
            query = query.Where(t => t.PressRelease.PublishedAt >= start);
        }
        if (to is { } toDay)
        {
            var end = StartOfBakuDay(toDay.AddDays(1));
            query = query.Where(t => t.PressRelease.PublishedAt < end);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.PressRelease.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                id = t.PressReleaseId,
                type = t.PressRelease.Type,
                title = t.Title,
                slug = t.Slug,
                publishedAt = t.PressRelease.PublishedAt,
                imageUrl = t.PressRelease.Assets
                    .OrderBy(a => a.SortOrder).ThenBy(a => a.Id)
                    .Where(a => a.Media.MimeType.StartsWith("image/") && (a.Details!.Locale == null || a.Details.Locale == locale))
                    .Select(a => "/media/" + a.MediaId)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Single published press release by locale-scoped slug.</summary>
    [HttpGet("api/v1/press-releases/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string locale = "az")
    {
        var now = DateTimeOffset.UtcNow;
        var item = await db.PressReleaseTranslations
            .Where(t => t.Locale == locale
                && t.Slug == slug
                && t.PressRelease.Status == ContentStatus.Published
                && t.PressRelease.PublishedAt <= now)
            .Select(t => new
            {
                id = t.PressReleaseId,
                type = t.PressRelease.Type,
                title = t.Title,
                slug = t.Slug,
                content = t.Content,
                publishedAt = t.PressRelease.PublishedAt,
                // The site builds the cover and the photo gallery from this order. A file of the
                // other language is left out (spec 033); no language, or no details row, is both.
                assets = t.PressRelease.Assets
                    .Where(a => a.Details!.Locale == null || a.Details.Locale == locale)
                    .OrderBy(a => a.SortOrder).ThenBy(a => a.Id)
                    .Select(a => new
                    {
                        mediaId = a.MediaId,
                        originalName = a.Media.OriginalName,
                        mimeType = a.Media.MimeType,
                        sizeBytes = a.Media.SizeBytes,
                        url = $"/media/{a.MediaId}",
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    // Npgsql only writes UTC DateTimeOffset values to timestamptz, hence ToUniversalTime().
    private static DateTimeOffset StartOfBakuDay(DateOnly day) =>
        new DateTimeOffset(day.ToDateTime(TimeOnly.MinValue), BakuOffset).ToUniversalTime();

    /// <summary>Makes `%`, `_` and the escape character itself match literally in ILIKE.</summary>
    private static string EscapeLike(string value) =>
        value.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_");
}
