using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// Memoranda of Understanding (spec 045). One response carries every row of the table on the
/// "Cooperation with central banks" page: a memorandum has no address of its own, and the site
/// renders and reorders the rows on the server.
/// </summary>
[ApiController]
public class MemorandumsController(CbarDbContext db) : ControllerBase
{
    /// <summary>Published memorandums visible in a locale: newest year first, then the editor's order.</summary>
    [HttpGet("api/v1/memorandums")]
    public async Task<IActionResult> GetList([FromQuery] string locale = "az")
    {
        var items = await db.MemorandumTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Memorandum.Status == ContentStatus.Published
                && t.Memorandum.DeletedAt == null
                && (locale == "en" ? t.Memorandum.ShowEn : t.Memorandum.ShowAz))
            .OrderByDescending(t => t.Memorandum.SignedYear)
            .ThenBy(t => t.Memorandum.SortOrder)
            .ThenBy(t => t.MemorandumId)
            .Select(t => new
            {
                Id = t.MemorandumId,
                t.Organization,
                t.Country,
                Year = t.Memorandum.SignedYear,
            })
            .ToListAsync();

        return Ok(new { items });
    }
}
