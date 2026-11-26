using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// Monthly reports (spec 052): the year → month archives of the consumer rights pages — the bank and
/// the insurance complaint index and the infographics. One response carries every report of the
/// asked series: a report has no address of its own, and the site builds the archive on the server.
/// </summary>
[ApiController]
public class MonthlyReportsController(CbarDbContext db) : ControllerBase
{
    /// <summary>
    /// Published reports with a file in the locale whose media is not deleted, grouped by series in
    /// their own order, newest period first. A series with no such report is left out, so the site
    /// falls back to the page text for it.
    /// </summary>
    [HttpGet("api/v1/monthly-reports")]
    public async Task<IActionResult> GetList([FromQuery] string locale = "az", [FromQuery] string? series = null)
    {
        if (locale != "en")
            locale = "az";
        var keys = (series ?? "").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var reportsQuery = db.MonthlyReportTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Report.Status == ContentStatus.Published
                && t.Report.DeletedAt == null);
        if (keys.Length > 0)
            reportsQuery = reportsQuery.Where(t => keys.Contains(t.Report.Series.Key));

        // The media query filter hides deleted files, so the join keeps only files that still exist.
        var reports = await reportsQuery
            .Join(db.MediaAssets, t => t.MediaId, m => m.Id, (t, m) => new
            {
                t.Report.SeriesId,
                t.Report.Id,
                t.Report.Year,
                t.Report.Month,
                File = new { m.Id, Url = "/media/" + m.Id, m.MimeType, m.SizeBytes },
            })
            .OrderByDescending(r => r.Year).ThenByDescending(r => r.Month).ThenBy(r => r.Id)
            .ToListAsync();

        var seriesIds = reports.Select(r => r.SeriesId).Distinct().ToList();
        var seriesRows = await db.MonthlyReportSeries.AsNoTracking()
            .Where(s => seriesIds.Contains(s.Id))
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
            .Select(s => new
            {
                s.Id,
                s.Key,
                Name = s.Translations.Where(t => t.Locale == locale).Select(t => t.Name).FirstOrDefault()
                    ?? s.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                    ?? s.Key,
                s.PeriodMonths,
            })
            .ToListAsync();

        var result = seriesRows.Select(s => new
        {
            s.Key,
            s.Name,
            s.PeriodMonths,
            Reports = reports.Where(r => r.SeriesId == s.Id)
                .Select(r => new { r.Id, r.Year, r.Month, r.File })
                .ToList(),
        });

        return Ok(new { series = result });
    }
}
