using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class LawsController(CbarDbContext db) : ControllerBase
{
    /// <summary>Paged list of published laws for a locale, newest first.</summary>
    [HttpGet("api/v1/laws")]
    public async Task<IActionResult> GetList(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? categoryId = null,
        [FromQuery] short? type = null)
    {
        // Clamped, not just floored: (page-1)*pageSize on a huge page overflows int
        // and Postgres rejects the resulting negative OFFSET.
        page = Math.Clamp(page, 1, 100_000);
        pageSize = Math.Clamp(pageSize, 1, 100);

        // published_at acts as an embargo when set; laws without a date stay visible.
        var now = DateTimeOffset.UtcNow;
        var query = db.Set<LawTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Law.Status == ContentStatus.Published
                && (t.Law.PublishedAt == null || t.Law.PublishedAt <= now)
                && (categoryId == null || t.Law.CategoryId == categoryId)
                && (type == null || t.Law.Type == type));

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.Law.PublishedAt)
            .ThenBy(t => t.LawId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                id = t.LawId,
                title = t.Title,
                slug = t.Slug,
                publishedAt = t.Law.PublishedAt,
                categoryName = t.Law.Category.Translations
                    .Where(ct => ct.Locale == locale)
                    .Select(ct => ct.Name)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Single published law by locale-scoped slug, with downloadable assets.</summary>
    [HttpGet("api/v1/laws/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string locale = "az")
    {
        var now = DateTimeOffset.UtcNow;
        var item = await db.Set<LawTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Slug == slug
                && t.Law.Status == ContentStatus.Published
                && (t.Law.PublishedAt == null || t.Law.PublishedAt <= now))
            .Select(t => new
            {
                id = t.LawId,
                title = t.Title,
                slug = t.Slug,
                description = t.Description,
                publishedAt = t.Law.PublishedAt,
                categoryName = t.Law.Category.Translations
                    .Where(ct => ct.Locale == locale)
                    .Select(ct => ct.Name)
                    .FirstOrDefault(),
                assets = t.Law.Assets
                    .OrderBy(a => a.SortOrder)
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

    /// <summary>Active law categories for a locale, ordered by sort order.</summary>
    [HttpGet("api/v1/law-categories")]
    public async Task<IActionResult> GetCategories([FromQuery] string locale = "az")
    {
        var items = await db.LawCategories.AsNoTracking()
            .Where(c => c.IsActive && c.Translations.Any(t => t.Locale == locale))
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
            .Select(c => new
            {
                id = c.Id,
                name = c.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }
}
