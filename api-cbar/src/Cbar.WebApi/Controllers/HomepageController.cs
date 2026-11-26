using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class HomepageController(CbarDbContext db) : ControllerBase
{
    /// <summary>
    /// Single aggregate payload for the homepage: banners, news slider, running lines, links, publications, info lines and
    /// strategy documents.
    /// </summary>
    [HttpGet("api/v1/homepage")]
    public async Task<IActionResult> Get([FromQuery] string locale = "az")
    {
        var now = DateTimeOffset.UtcNow;

        var banners = await db.Banners.AsNoTracking()
            .Where(b => b.IsActive
                && (b.StartsAt == null || b.StartsAt <= now)
                && (b.EndsAt == null || b.EndsAt >= now)
                && b.Translations.Any(t => t.Locale == locale))
            .OrderBy(b => b.SortOrder).ThenBy(b => b.Id)
            .Select(b => new
            {
                title = b.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                link = b.Translations.Where(t => t.Locale == locale).Select(t => t.Link).FirstOrDefault(),
                description = b.Translations.Where(t => t.Locale == locale).Select(t => t.Description).FirstOrDefault(),
                imageUrl = b.MediaId == null ? null : $"/media/{b.MediaId}",
            })
            .ToListAsync();

        var newsSlider = await db.NewsSliderItems.AsNoTracking()
            .Where(s => s.IsActive && s.Translations.Any(t => t.Locale == locale))
            .OrderBy(s => s.SortOrder).ThenByDescending(s => s.NewsDate)
            .Select(s => new
            {
                title = s.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                description = s.Translations.Where(t => t.Locale == locale).Select(t => t.Description).FirstOrDefault(),
                link = s.Translations.Where(t => t.Locale == locale).Select(t => t.Link).FirstOrDefault(),
                imageUrl = s.MediaId == null ? null : $"/media/{s.MediaId}",
                newsDate = s.NewsDate,
            })
            .ToListAsync();

        var runningLines = await db.RunningLines.AsNoTracking()
            .Where(r => r.IsActive
                && (r.StartsAt == null || r.StartsAt <= now)
                && (r.EndsAt == null || r.EndsAt >= now))
            .OrderBy(r => r.Id)
            .SelectMany(r => r.Translations
                .Where(t => t.Locale == locale)
                .Select(t => t.Text))
            .ToListAsync();

        var links = await db.HomepageLinks.AsNoTracking()
            .Where(l => l.IsActive && l.Translations.Any(t => t.Locale == locale))
            .OrderBy(l => l.SortOrder).ThenBy(l => l.Id)
            .Select(l => new
            {
                title = l.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                url = l.Translations.Where(t => t.Locale == locale).Select(t => t.Url).FirstOrDefault(),
            })
            .ToListAsync();

        var publications = await db.HomepagePublications.AsNoTracking()
            .Where(p => p.IsActive && p.Translations.Any(t => t.Locale == locale))
            .OrderBy(p => p.SortOrder).ThenByDescending(p => p.PublishedAt)
            .Select(p => new
            {
                title = p.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                url = p.Translations.Where(t => t.Locale == locale).Select(t => t.Url).FirstOrDefault(),
                imageUrl = p.MediaId == null ? null : $"/media/{p.MediaId}",
                publishedAt = p.PublishedAt,
            })
            .ToListAsync();

        var infoLineRows = await db.InfoLines.AsNoTracking()
            .Where(i => i.IsActive && i.Translations.Any(t => t.Locale == locale))
            .OrderBy(i => i.Alias).ThenBy(i => i.SortOrder).ThenBy(i => i.Id)
            .Select(i => new
            {
                alias = i.Alias,
                title = i.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                value = i.Translations.Where(t => t.Locale == locale).Select(t => t.Value).FirstOrDefault(),
                year = i.Year,
                updatedAt = i.UpdatedAt,
            })
            .ToListAsync();

        var infoLines = infoLineRows
            .GroupBy(i => i.alias)
            .Select(g => new
            {
                alias = g.Key,
                items = g.Select(i => new { i.title, i.value, i.year, i.updatedAt }).ToList(),
            })
            .ToList();

        // Strategy documents (spec 057): published, titled in the locale, with a working link there. The page slug is read
        // only where the site shows the page in the locale (the GetBySlug filter); the query filters hide deleted rows.
        var strategyRows = await db.HomepageStrategyDocs.AsNoTracking()
            .Where(d => d.Status == ContentStatus.Published && d.Translations.Any(t => t.Locale == locale))
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .Select(d => new
            {
                d.Id,
                Own = d.Translations.Where(t => t.Locale == locale)
                    .Select(t => new
                    {
                        t.Title,
                        t.Summary,
                        t.Url,
                        CoverId = t.CoverMedia == null ? (long?)null : t.CoverMedia.Id,
                    })
                    .First(),
                OtherCoverId = d.Translations.Where(t => t.Locale != locale && t.CoverMedia != null)
                    .Select(t => (long?)t.CoverMedia!.Id)
                    .FirstOrDefault(),
                PageSlug = d.Page == null || d.Page.Status != ContentStatus.Published || !d.Page.Active
                    || !(locale == "en" ? d.Page.ShowEn : d.Page.ShowAz)
                    ? null
                    : d.Page.Translations.Where(t => t.Locale == locale).Select(t => t.Slug).FirstOrDefault(),
            })
            .ToListAsync();

        var strategyDocs = strategyRows
            .Select(r => new
            {
                id = r.Id,
                title = r.Own.Title,
                summary = r.Own.Summary,
                coverUrl = StrategyDocLinks.Cover(r.Own.CoverId, r.OtherCoverId),
                href = StrategyDocLinks.Href(r.Own.Url, r.PageSlug),
            })
            .Where(d => d.href is not null)
            .ToList();

        return Ok(new { banners, newsSlider, runningLines, links, publications, infoLines, strategyDocs });
    }
}
