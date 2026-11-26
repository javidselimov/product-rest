using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class PagesController(CbarDbContext db) : ControllerBase
{
    public record PageNode(
        int Id, string Title, string Slug, string? NavUrl, bool ShowInSideNav, bool? ShowInDropdownNav, string? MenuGroup, List<PageNode> Children);

    /// <summary>
    /// Recursive tree of published pages for a locale, ordered by sort order. ShowInSideNav is data,
    /// not a filter: a page left out of the left menu stays in the tree (spec 041). ShowInDropdownNav (null = follow
    /// ShowInSideNav) and the locale's MenuGroup label are data too (spec 054).
    /// </summary>
    [HttpGet("api/v1/pages/tree")]
    public async Task<IActionResult> GetTree([FromQuery] string locale = "az")
    {
        var pages = await db.Pages
            .Where(p => p.Status == ContentStatus.Published
                && p.Active && p.Visible
                && (locale == "en" ? p.ShowEn : p.ShowAz))
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .Select(p => new PageRow(
                p.Id,
                p.ParentId,
                p.NavUrl,
                p.Details == null || p.Details.ShowInSideNav,
                p.NavDetails == null ? null : p.NavDetails.ShowInDropdownNav,
                p.TranslationDetails.Where(d => d.Locale == locale).Select(d => d.MenuGroup).FirstOrDefault(),
                p.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                p.Translations.Where(t => t.Locale == locale).Select(t => t.Slug).FirstOrDefault()))
            .ToListAsync();

        return Ok(BuildTree(pages));
    }

    /// <summary>A visible page in one locale, as read for <see cref="BuildTree"/>; Title/Slug are null when untranslated.</summary>
    internal record PageRow(
        int Id, int? ParentId, string? NavUrl, bool ShowInSideNav, bool? ShowInDropdownNav, string? MenuGroup,
        string? Title, string? Slug);

    /// <summary>
    /// Nests the rows, kept in their given order. A page without a translation in the locale is skipped, and a
    /// page whose parent is not among the translated rows (unpublished, hidden, untranslated) becomes a root.
    /// </summary>
    internal static List<PageNode> BuildTree(IReadOnlyCollection<PageRow> rows)
    {
        var translated = rows.Where(p => p.Title != null && p.Slug != null).ToList();
        var byParent = translated.ToLookup(p => p.ParentId);
        var ids = translated.Select(p => p.Id).ToHashSet();

        PageNode Node(PageRow p) =>
            new(p.Id, p.Title!, p.Slug!, p.NavUrl, p.ShowInSideNav, p.ShowInDropdownNav, p.MenuGroup,
                byParent[p.Id].Select(Node).ToList());

        return translated
            .Where(p => p.ParentId is null || !ids.Contains(p.ParentId.Value))
            .Select(Node)
            .ToList();
    }

    /// <summary>Single published page by locale-scoped slug.</summary>
    [HttpGet("api/v1/pages/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug, [FromQuery] string locale = "az")
    {
        var item = await db.PageTranslations
            .Where(t => t.Locale == locale
                && t.Slug == slug
                && t.Page.Status == ContentStatus.Published
                && t.Page.Active
                && (locale == "en" ? t.Page.ShowEn : t.Page.ShowAz))
            .Select(t => new
            {
                id = t.PageId,
                title = t.Title,
                slug = t.Slug,
                content = t.Content,
                assets = t.Page.Assets
                    .OrderBy(a => a.SortOrder)
                    .Select(a => new
                    {
                        mediaId = a.MediaId,
                        title = a.Translations.Where(x => x.Locale == locale).Select(x => x.Title).FirstOrDefault()
                            ?? a.Translations.OrderBy(x => x.Locale).Select(x => x.Title).FirstOrDefault()
                            ?? a.Media.OriginalName,
                        mimeType = a.Media.MimeType,
                        sizeBytes = a.Media.SizeBytes,
                        group = a.GroupLabel,
                    })
                    .ToList(),
            })
            .FirstOrDefaultAsync();

        if (item is null)
            return NotFound();

        return Ok(new
        {
            item.id,
            item.title,
            item.slug,
            item.content,
            assets = item.assets
                .Select(a => new { a.mediaId, a.title, a.mimeType, a.sizeBytes, a.group, url = $"/media/{a.mediaId}" }),
        });
    }
}
