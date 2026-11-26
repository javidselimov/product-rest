using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record MonthlyReportFileDto(long MediaId);
public record MonthlyReportUpsertDto(
    string Series,
    short Year,
    short Month,
    ContentStatus Status,
    Dictionary<string, MonthlyReportFileDto> Translations);

/// <summary>
/// Monthly reports (spec 052): one month of a series on the consumer rights pages — the bank and the
/// insurance complaint index and the infographics — with one file per locale. The site builds the
/// year → month archives from them. A series is addressed by its key, the same in every environment.
/// </summary>
[ApiController]
[RequirePermission(Permissions.MonthlyReports.Read)]
[Route("api/v1/monthly-reports")]
public class MonthlyReportsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "monthly_report";
    private const short MinYear = 2000;
    private const short MonthsInYear = 12;

    /// <summary>For the conflict message, which the panel shows as it is.</summary>
    private static readonly string[] MonthNamesAz =
        ["Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun", "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

    /// <summary>Every series in the site's order, for the panel's tabs and select.</summary>
    [HttpGet("series")]
    public async Task<IActionResult> Series()
    {
        var items = await db.MonthlyReportSeries.AsNoTracking()
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
            .Select(s => new
            {
                s.Key,
                Name = s.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault() ?? s.Key,
                NameEn = s.Translations.Where(t => t.Locale == "en").Select(t => t.Name).FirstOrDefault(),
                s.PeriodMonths,
            })
            .ToListAsync();
        return Ok(items);
    }

    /// <summary>Newest period first; with a series filter the first item is that series' newest month.</summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? series = null, [FromQuery] short? year = null, [FromQuery] ContentStatus? status = null)
    {
        var query = db.MonthlyReports.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(series))
            query = query.Where(r => r.Series.Key == series);
        if (year is not null)
            query = query.Where(r => r.Year == year);
        if (status is not null)
            query = query.Where(r => r.Status == status);

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.Year).ThenByDescending(r => r.Month).ThenBy(r => r.Series.SortOrder).ThenBy(r => r.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(r => new
            {
                r.Id,
                Series = r.Series.Key,
                SeriesName = r.Series.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault() ?? r.Series.Key,
                r.Series.PeriodMonths,
                r.Year,
                r.Month,
                Status = r.Status.ToString().ToLowerInvariant(),
                Locales = r.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).ThenBy(t => t.Locale).Select(t => t.Locale).ToList(),
                // The media query filter hides deleted files, so a deleted file has no match here.
                MissingFile = r.Translations.Any(t => !db.MediaAssets.Any(m => m.Id == t.MediaId)),
                r.UpdatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await DetailAsync(id);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [RequirePermission(Permissions.MonthlyReports.Create)]
    public async Task<IActionResult> Create(MonthlyReportUpsertDto dto)
    {
        var series = await FindSeriesAsync(dto.Series);
        if (await InvalidAsync(dto, series) is { } message)
            return BadRequestProblem(message);
        if (await TakenAsync(series!.Id, dto, exceptId: null))
            return ConflictProblem(ConflictMessage(dto));

        var entity = new MonthlyReport { CreatedBy = CurrentUserId() };
        Apply(entity, series.Id, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MonthlyReports.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("monthly_reports.create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.MonthlyReports.Update)]
    public async Task<IActionResult> Update(int id, MonthlyReportUpsertDto dto)
    {
        var entity = await db.MonthlyReports
            .Include(r => r.Translations)
            .SingleOrDefaultAsync(r => r.Id == id);
        if (entity is null)
            return NotFound();

        var series = await FindSeriesAsync(dto.Series);
        if (await InvalidAsync(dto, series) is { } message)
            return BadRequestProblem(message);
        if (await TakenAsync(series!.Id, dto, exceptId: id))
            return ConflictProblem(ConflictMessage(dto));

        var before = await DetailAsync(id);
        Apply(entity, series.Id, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("monthly_reports.update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await DetailAsync(id));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.MonthlyReports.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MonthlyReports.SingleOrDefaultAsync(r => r.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete; the period becomes free
        entity.UpdatedBy = CurrentUserId();
        audit.Log("monthly_reports.delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<MonthlyReportSeries?> FindSeriesAsync(string? key) =>
        string.IsNullOrWhiteSpace(key)
            ? Task.FromResult<MonthlyReportSeries?>(null)
            : db.MonthlyReportSeries.AsNoTracking().SingleOrDefaultAsync(s => s.Key == key);

    private Task<bool> TakenAsync(short seriesId, MonthlyReportUpsertDto dto, int? exceptId) =>
        db.MonthlyReports.AnyAsync(r => r.SeriesId == seriesId && r.Year == dto.Year && r.Month == dto.Month
            && (exceptId == null || r.Id != exceptId));

    private static string ConflictMessage(MonthlyReportUpsertDto dto) =>
        $"Bu seriyada {MonthNamesAz[dto.Month - 1]} {dto.Year} üçün hesabat artıq var.";

    /// <summary>The first thing wrong with the request, or null.</summary>
    private async Task<string?> InvalidAsync(MonthlyReportUpsertDto dto, MonthlyReportSeries? series)
    {
        if (series is null)
            return "Seriya tapılmadı.";
        // A report may be entered ahead of the new year, hence next year.
        var maxYear = DateTime.UtcNow.Year + 1;
        if (dto.Year < MinYear || dto.Year > maxYear)
            return $"İl {MinYear} ilə {maxYear} arasında olmalıdır.";
        if (dto.Month < 1 || dto.Month > MonthsInYear)
            return $"Ay 1 ilə {MonthsInYear} arasında olmalıdır.";
        if (dto.Status == ContentStatus.Scheduled)
            return "Hesabat planlaşdırıla bilməz.";
        if (dto.Translations.Count == 0)
            return "Ən azı bir dildə fayl seçin.";

        var mediaIds = dto.Translations.Values.Select(t => t.MediaId).Distinct().ToList();
        var found = await db.MediaAssets.CountAsync(m => mediaIds.Contains(m.Id));
        if (found != mediaIds.Count)
            return "Fayl tapılmadı.";
        return null;
    }

    private static void Apply(MonthlyReport entity, short seriesId, MonthlyReportUpsertDto dto)
    {
        entity.SeriesId = seriesId;
        entity.Year = dto.Year;
        entity.Month = dto.Month;
        entity.Status = dto.Status;

        foreach (var (locale, file) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new MonthlyReportTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.MediaId = file.MediaId;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    /// <summary>The report with each locale's file; the file name is null when the file was deleted.</summary>
    private async Task<object?> DetailAsync(int id)
    {
        var r = await db.MonthlyReports.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                Series = x.Series.Key,
                x.Year,
                x.Month,
                x.Status,
                x.CreatedAt,
                x.UpdatedAt,
                Files = x.Translations.Select(t => new
                {
                    t.Locale,
                    t.MediaId,
                    MediaName = db.MediaAssets.Where(m => m.Id == t.MediaId).Select(m => m.OriginalName).FirstOrDefault(),
                }).ToList(),
            })
            .SingleOrDefaultAsync();
        if (r is null)
            return null;

        return new
        {
            r.Id,
            r.Series,
            r.Year,
            r.Month,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.CreatedAt,
            r.UpdatedAt,
            Translations = r.Files.ToDictionary(f => f.Locale, f => new { f.MediaId, f.MediaName }),
        };
    }
}
