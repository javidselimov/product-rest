using Cbar.Domain;
using Cbar.Domain.Entities;
using Cbar.WebApi.Time;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// The information disclosure schedule (spec 039): one response carries the whole table and the
/// monetary policy decision dates its dialog shows, so the site renders the page from a single call.
/// </summary>
[ApiController]
public class ReleaseScheduleController(CbarDbContext db) : ControllerBase
{
    private const short DecisionType = 1;
    private const short PressConferenceType = 2;

    [HttpGet("api/v1/release-schedule")]
    public async Task<IActionResult> Get([FromQuery] string locale = "az")
    {
        var rows = await db.ReleaseScheduleItemTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Item.Status == ContentStatus.Published
                && t.Item.DeletedAt == null
                && (locale == "en" ? t.Item.ShowEn : t.Item.ShowAz)
                && t.Item.Group.IsActive
                && t.Item.Group.Translations.Any(g => g.Locale == locale))
            .OrderBy(t => t.Item.Group.SortOrder).ThenBy(t => t.Item.GroupId)
            .ThenBy(t => t.Item.SortOrder).ThenBy(t => t.ItemId)
            .Select(t => new
            {
                t.Item.GroupId,
                GroupName = t.Item.Group.Translations.Where(g => g.Locale == locale).Select(g => g.Name).First(),
                Id = t.ItemId,
                t.Title,
                Periodicity = t.Item.Periodicity == null
                    ? null
                    : t.Item.Periodicity.Translations.Where(p => p.Locale == locale).Select(p => p.Name).FirstOrDefault(),
                t.Timing,
                t.Item.TimingMode,
                t.Item.TimingUrl,
            })
            .ToListAsync();

        // Rows arrive in group order, so grouping keeps it.
        var groups = rows
            .GroupBy(r => new { r.GroupId, r.GroupName })
            .Select(g => new
            {
                Id = g.Key.GroupId,
                Name = g.Key.GroupName,
                Items = g.Select(r => new
                {
                    r.Id,
                    r.Title,
                    r.Periodicity,
                    Timing = string.IsNullOrWhiteSpace(r.Timing) ? null : r.Timing,
                    TimingMode = r.TimingMode.ToString().ToLowerInvariant(),
                    TimingUrl = r.TimingMode == ReleaseTimingMode.Link ? r.TimingUrl : null,
                }).ToList(),
            })
            .ToList();

        return Ok(new { groups, decisions = await DecisionsAsync() });
    }

    /// <summary>
    /// Decision dates are events of type 1 (spec 034). Their translations are not needed: the dialog
    /// shows only dates and a chrome label, so both locales get the same dates.
    /// </summary>
    private async Task<object> DecisionsAsync()
    {
        var today = BakuClock.Today();
        var yearStart = new DateOnly(today.Year, 1, 1);
        var yearEnd = new DateOnly(today.Year, 12, 31);
        var published = db.Events.AsNoTracking().Where(e => e.Status == ContentStatus.Published);

        var dates = await published
            .Where(e => e.Type == DecisionType && e.StartsOn >= yearStart && e.StartsOn <= yearEnd)
            .Select(e => e.StartsOn).Distinct().OrderBy(d => d)
            .ToListAsync();
        var next = await published
            .Where(e => e.Type == DecisionType && e.StartsOn >= today)
            .OrderBy(e => e.StartsOn)
            .Select(e => (DateOnly?)e.StartsOn)
            .FirstOrDefaultAsync();

        var candidates = next is { } n && !dates.Contains(n) ? [.. dates, n] : dates;
        var withConference = (await published
                .Where(e => e.Type == PressConferenceType && candidates.Contains(e.StartsOn))
                .Select(e => e.StartsOn).Distinct()
                .ToListAsync())
            .ToHashSet();

        object Date(DateOnly d) => new { Date = d, WithPressConference = withConference.Contains(d) };

        return new
        {
            Year = today.Year,
            Dates = dates.Select(Date).ToList(),
            Next = next is { } nextDate ? Date(nextDate) : null,
        };
    }
}
