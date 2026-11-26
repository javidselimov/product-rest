using System.Text.RegularExpressions;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public partial class SearchController(CbarDbContext db) : ControllerBase
{
    private const int MaxResults = 30;
    private const int PerType = 12;
    private const string CsrPageSlugAz = "korporativ-sosial-mesuliyyet";
    private const string CsrPageSlugEn = "corporate-social-responsibility";

    public record SearchResult(string Title, string Url, string Type, string Snippet);

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex TagRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();

    /// <summary>
    /// Unified site search across pages, press releases, laws, money marks and
    /// staff for a locale. Title matches rank above content matches. Empty query
    /// returns an empty result set.
    /// </summary>
    [HttpGet("api/v1/search")]
    public async Task<IActionResult> Search(
        [FromQuery] string q = "",
        [FromQuery] string locale = "az")
    {
        q = q?.Trim() ?? "";
        if (q.Length == 0)
            return Ok(new { results = Array.Empty<SearchResult>() });

        // Escape LIKE wildcards so a query of "%" doesn't match every row and a
        // literal "50%" or "100_" searches for exactly that.
        var like = $"%{q.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_")}%";
        var results = new List<(int rank, SearchResult result)>();

        // --- Pages (title + content; published / active / visible / locale-shown) ---
        var pages = await db.PageTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Page.Status == ContentStatus.Published
                && t.Page.Active && t.Page.Visible
                && (locale == "en" ? t.Page.ShowEn : t.Page.ShowAz)
                && (EF.Functions.ILike(t.Title, like) || EF.Functions.ILike(t.Content!, like)))
            .Select(t => new { t.Title, t.Slug, t.Content })
            .Take(PerType)
            .ToListAsync();
        foreach (var p in pages)
        {
            var titleHit = p.Title.Contains(q, StringComparison.OrdinalIgnoreCase);
            results.Add((titleHit ? 0 : 1, new SearchResult(
                p.Title,
                $"/{locale}/{p.Slug}",
                "page",
                Snippet(p.Title, p.Content, q))));
        }

        // --- Press releases (title; published, not in the future) ---
        var now = DateTimeOffset.UtcNow;
        var press = await db.PressReleaseTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.PressRelease.Status == ContentStatus.Published
                && t.PressRelease.PublishedAt <= now
                && EF.Functions.ILike(t.Title, like))
            .OrderByDescending(t => t.PressRelease.PublishedAt)
            .Select(t => new { t.Title, t.Slug })
            .Take(PerType)
            .ToListAsync();
        foreach (var pr in press)
            results.Add((0, new SearchResult(
                pr.Title, $"/{locale}/press-releases/{pr.Slug}", "press-release", pr.Title)));

        // --- Events (title; published). One linked to a CMS page is found as that page. ---
        var events = await db.EventTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Event.Status == ContentStatus.Published
                && t.Event.DeletedAt == null
                && t.Event.PageId == null
                && EF.Functions.ILike(t.Title, like))
            .OrderByDescending(t => t.Event.StartsOn)
            .Select(t => new { t.Title, t.Slug })
            .Take(PerType)
            .ToListAsync();
        foreach (var ev in events)
            results.Add((0, new SearchResult(
                ev.Title, $"/{locale}/media/events/{ev.Slug}", "event", ev.Title)));

        // --- CSR projects (titles + summary; published). They have no address: the result opens their page. ---
        var csrProjects = await db.CsrProjectTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Project.Status == ContentStatus.Published
                && t.Project.DeletedAt == null
                && (locale == "en" ? t.Project.ShowEn : t.Project.ShowAz)
                && (EF.Functions.ILike(t.CardTitle, like) || EF.Functions.ILike(t.Title, like) || EF.Functions.ILike(t.Summary, like)))
            .OrderBy(t => t.Project.SortOrder)
            .Select(t => new { t.CardTitle, t.Summary })
            .Take(PerType)
            .ToListAsync();
        var csrPage = locale == "en" ? CsrPageSlugEn : CsrPageSlugAz;
        foreach (var project in csrProjects)
            results.Add((0, new SearchResult(
                project.CardTitle, $"/{locale}/media/{csrPage}", "csr-project", project.Summary)));

        // --- Laws (title; published) ---
        var laws = await db.Set<LawTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Law.Status == ContentStatus.Published
                && (t.Law.PublishedAt == null || t.Law.PublishedAt <= now)
                && EF.Functions.ILike(t.Title, like))
            .OrderByDescending(t => t.Law.PublishedAt)
            .Select(t => new { t.Title, t.Slug })
            .Take(PerType)
            .ToListAsync();
        foreach (var l in laws)
            results.Add((0, new SearchResult(
                l.Title, $"/{locale}/laws/{l.Slug}", "law", l.Title)));

        // --- Money marks (title; published) -> national-currency detail ---
        var marks = await db.Set<MoneyMarkTranslation>().AsNoTracking()
            .Where(t => t.Locale == locale
                && t.MoneyMark.Status == ContentStatus.Published
                && EF.Functions.ILike(t.Title, like))
            .Select(t => new { t.Title, t.Slug })
            .Take(PerType)
            .ToListAsync();
        foreach (var m in marks)
            results.Add((0, new SearchResult(
                m.Title, $"/{locale}/national-currency/{m.Slug}", "money-mark", m.Title)));

        // --- Organization staff (full name; active) ---
        var staff = await db.OrganizationStaff.AsNoTracking()
            .Where(s => s.IsActive
                && s.Translations.Any(t => t.Locale == locale
                    && EF.Functions.ILike(t.FullName, like)))
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
            .Select(s => new
            {
                s.Id,
                FullName = s.Translations.Where(t => t.Locale == locale).Select(t => t.FullName).FirstOrDefault(),
                Position = s.Translations.Where(t => t.Locale == locale).Select(t => t.Position).FirstOrDefault(),
            })
            .Take(PerType)
            .ToListAsync();
        foreach (var s in staff)
            results.Add((0, new SearchResult(
                s.FullName ?? "",
                $"/{locale}/organization/staff/detail/{s.Id}",
                "staff",
                string.IsNullOrWhiteSpace(s.Position) ? (s.FullName ?? "") : s.Position!)));

        var ordered = results
            .OrderBy(r => r.rank)
            .Select(r => r.result)
            .Take(MaxResults)
            .ToList();

        return Ok(new { results = ordered });
    }

    /// <summary>Strips tags and builds a +/-80 char snippet around the first match, else the title.</summary>
    private static string Snippet(string title, string? content, string q)
    {
        if (string.IsNullOrWhiteSpace(content))
            return title;

        var text = WhitespaceRegex().Replace(TagRegex().Replace(content, " "), " ").Trim();
        var idx = text.IndexOf(q, StringComparison.OrdinalIgnoreCase);
        if (idx < 0)
            return title;

        var start = Math.Max(0, idx - 80);
        var len = Math.Min(text.Length - start, q.Length + 160);
        var snippet = text.Substring(start, len).Trim();
        if (start > 0) snippet = "…" + snippet;
        if (start + len < text.Length) snippet += "…";
        return snippet;
    }
}
