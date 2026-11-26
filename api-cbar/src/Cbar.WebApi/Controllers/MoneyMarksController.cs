using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class MoneyMarksController(CbarDbContext db) : ControllerBase
{
    /// <summary>Published money marks (banknotes / coins) for a locale. type: 1 = banknote, 2 = coin.</summary>
    [HttpGet("api/v1/money-marks")]
    public async Task<IActionResult> GetList(
        [FromQuery] string locale = "az",
        [FromQuery] short? type = null,
        [FromQuery] int? categoryId = null)
    {
        var items = await db.Set<MoneyMarkTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.MoneyMark.Status == ContentStatus.Published
                && (type == null || t.MoneyMark.Type == type)
                && (categoryId == null || t.MoneyMark.CategoryId == categoryId))
            .OrderBy(t => t.MoneyMark.SortOrder).ThenBy(t => t.MoneyMarkId)
            .Select(t => new
            {
                id = t.MoneyMarkId,
                title = t.Title,
                slug = t.Slug,
                categoryName = t.MoneyMark.Category.Translations
                    .Where(ct => ct.Locale == locale)
                    .Select(ct => ct.Name)
                    .FirstOrDefault(),
                frontImageUrl = t.MoneyMark.FrontMediaId == null ? null : $"/media/{t.MoneyMark.FrontMediaId}",
                rearImageUrl = t.MoneyMark.RearMediaId == null ? null : $"/media/{t.MoneyMark.RearMediaId}",
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Single published money mark by locale-scoped slug.</summary>
    [HttpGet("api/v1/money-marks/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string locale = "az")
    {
        var item = await db.Set<MoneyMarkTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Slug == slug
                && t.MoneyMark.Status == ContentStatus.Published)
            .Select(t => new
            {
                id = t.MoneyMarkId,
                title = t.Title,
                slug = t.Slug,
                description = t.Description,
                securityFeatures = t.SecurityFeatures,
                type = t.MoneyMark.Type,
                categoryName = t.MoneyMark.Category.Translations
                    .Where(ct => ct.Locale == locale)
                    .Select(ct => ct.Name)
                    .FirstOrDefault(),
                frontImageUrl = t.MoneyMark.FrontMediaId == null ? null : $"/media/{t.MoneyMark.FrontMediaId}",
                rearImageUrl = t.MoneyMark.RearMediaId == null ? null : $"/media/{t.MoneyMark.RearMediaId}",
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>Active money mark categories for a locale, ordered by sort order.</summary>
    [HttpGet("api/v1/money-mark-categories")]
    public async Task<IActionResult> GetCategories([FromQuery] string locale = "az")
    {
        var items = await db.MoneyMarkCategories.AsNoTracking()
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

    /// <summary>Paged list of published money mark news for a locale, newest first.</summary>
    [HttpGet("api/v1/money-mark-news")]
    public async Task<IActionResult> GetNews(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        // Clamped, not just floored: (page-1)*pageSize on a huge page overflows int
        // and Postgres rejects the resulting negative OFFSET.
        page = Math.Clamp(page, 1, 100_000);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var now = DateTimeOffset.UtcNow;
        var query = db.Set<MoneyMarkNewsTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.News.Status == ContentStatus.Published
                && t.News.PublishedAt <= now);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(t => t.News.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new
            {
                id = t.NewsId,
                title = t.Title,
                slug = t.Slug,
                publishedAt = t.News.PublishedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Single published money mark news item by locale-scoped slug.</summary>
    [HttpGet("api/v1/money-mark-news/{slug}")]
    public async Task<IActionResult> GetNewsBySlug(string slug, [FromQuery] string locale = "az")
    {
        var now = DateTimeOffset.UtcNow;
        var item = await db.Set<MoneyMarkNewsTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Slug == slug
                && t.News.Status == ContentStatus.Published
                && t.News.PublishedAt <= now)
            .Select(t => new
            {
                id = t.NewsId,
                title = t.Title,
                slug = t.Slug,
                content = t.Content,
                publishedAt = t.News.PublishedAt,
            })
            .FirstOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }
}
