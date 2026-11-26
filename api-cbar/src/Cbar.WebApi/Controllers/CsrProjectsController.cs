using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// CSR projects (spec 038). One response carries the cards and the dialogs: a project has no address
/// of its own, and the site renders it on the server.
/// </summary>
[ApiController]
public class CsrProjectsController(CbarDbContext db) : ControllerBase
{
    /// <summary>Published projects visible in a locale, in the editor's order.</summary>
    [HttpGet("api/v1/csr-projects")]
    public async Task<IActionResult> GetList([FromQuery] string locale = "az")
    {
        var rows = await db.CsrProjectTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Project.Status == ContentStatus.Published
                && t.Project.DeletedAt == null
                && (locale == "en" ? t.Project.ShowEn : t.Project.ShowAz))
            .OrderBy(t => t.Project.SortOrder).ThenBy(t => t.ProjectId)
            .Select(t => new
            {
                Id = t.ProjectId,
                Category = t.Project.Category.Translations.Where(c => c.Locale == locale).Select(c => c.Name).FirstOrDefault(),
                t.CardTitle,
                t.Summary,
                t.Title,
                t.Content,
                t.Project.CoverMediaId,
                Images = t.Project.Images.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).Select(i => i.MediaId).ToList(),
            })
            .AsSplitQuery()
            .ToListAsync();

        var items = rows.Select(r => new
        {
            r.Id,
            r.Category,
            r.CardTitle,
            r.Summary,
            r.Title,
            r.Content,
            Cover = r.CoverMediaId is { } cover ? MediaPath(cover) : null,
            Images = r.Images.Select(id => new { MediaId = id, Url = MediaPath(id) }),
        });

        return Ok(new { items });
    }

    private static string MediaPath(long id) => $"/media/{id}";
}
