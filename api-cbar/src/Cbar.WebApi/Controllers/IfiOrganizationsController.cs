using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// International financial institutions (spec 044). One response carries every accordion card of the
/// cooperation page: an organization has no address of its own, and the site renders it on the server.
/// </summary>
[ApiController]
public class IfiOrganizationsController(CbarDbContext db) : ControllerBase
{
    /// <summary>Published organizations visible in a locale, in the editor's order.</summary>
    [HttpGet("api/v1/ifi-organizations")]
    public async Task<IActionResult> GetList([FromQuery] string locale = "az")
    {
        var rows = await db.IfiOrganizationTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Organization.Status == ContentStatus.Published
                && t.Organization.DeletedAt == null
                && (locale == "en" ? t.Organization.ShowEn : t.Organization.ShowAz))
            .OrderBy(t => t.Organization.SortOrder).ThenBy(t => t.OrganizationId)
            .Select(t => new
            {
                Id = t.OrganizationId,
                t.Name,
                t.Organization.LogoMediaId,
                t.Organization.MemberSince,
                t.Organization.WebsiteUrl,
                t.Mission,
                t.MembershipIntro,
                t.Content,
                // A date without a name in this locale is left out rather than shown blank.
                Memberships = t.Organization.Memberships
                    .OrderBy(m => m.SortOrder).ThenBy(m => m.Id)
                    .SelectMany(m => m.Translations.Where(mt => mt.Locale == locale)
                        .Select(mt => new { m.JoinedOn, mt.Name }))
                    .ToList(),
            })
            .AsSplitQuery()
            .ToListAsync();

        var items = rows.Select(r => new
        {
            r.Id,
            r.Name,
            Logo = r.LogoMediaId is { } logo ? MediaPath(logo) : null,
            r.MemberSince,
            r.WebsiteUrl,
            r.Mission,
            r.MembershipIntro,
            r.Content,
            r.Memberships,
        });

        return Ok(new { items });
    }

    private static string MediaPath(long id) => $"/media/{id}";
}
