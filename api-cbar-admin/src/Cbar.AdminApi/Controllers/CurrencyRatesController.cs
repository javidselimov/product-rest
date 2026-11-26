using System.Globalization;
using System.Security.Claims;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record CurrencyRateItemDto(string CurrencyCode, decimal Rate);
public record CurrencyRateSheetDto(DateOnly Date, List<CurrencyRateItemDto> Rates);

[ApiController]
[RequirePermission(Permissions.CurrencyRates.Read)]
[Route("api/v1/currency-rates")]
public class CurrencyRatesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateOnly? date = null)
    {
        var rateDate = date;
        if (rateDate is null)
        {
            if (!await db.CurrencyRates.AsNoTracking().AnyAsync())
                return Ok(new { date = (DateOnly?)null, rates = Array.Empty<object>() });
            rateDate = await db.CurrencyRates.AsNoTracking().MaxAsync(r => r.RateDate);
        }

        var rates = await db.CurrencyRates.AsNoTracking()
            .Where(r => r.RateDate == rateDate)
            .OrderBy(r => r.Currency.SortOrder).ThenBy(r => r.CurrencyCode)
            .Select(r => new
            {
                r.CurrencyCode,
                r.Currency.Nominal,
                NameAz = r.Currency.Translations
                    .Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault(),
                r.Rate,
            })
            .ToListAsync();

        return Ok(new { date = rateDate, rates });
    }

    [HttpGet("dates")]
    public async Task<IActionResult> Dates([FromQuery] PagingQuery paging)
    {
        var query = db.CurrencyRates.AsNoTracking()
            .GroupBy(r => r.RateDate)
            .Select(g => new { Date = g.Key, Count = g.Count() });

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.Date)
            .Skip(w.Skip).Take(w.PageSize)
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpPut]
    [RequirePermission(Permissions.CurrencyRates.Prepare)]
    public async Task<IActionResult> Upsert(CurrencyRateSheetDto dto)
    {
        if (dto.Rates.Count == 0)
            return BadRequestProblem("At least one rate is required.");
        var duplicate = dto.Rates.GroupBy(r => r.CurrencyCode).FirstOrDefault(g => g.Count() > 1);
        if (duplicate is not null)
            return BadRequestProblem($"Duplicate currency code '{duplicate.Key}' in payload.");

        var codes = dto.Rates.Select(r => r.CurrencyCode).ToList();
        var known = await db.Currencies.AsNoTracking()
            .Where(c => codes.Contains(c.Code))
            .Select(c => c.Code)
            .ToListAsync();
        var unknown = codes.Except(known).ToList();
        if (unknown.Count > 0)
            return BadRequestProblem($"Unknown currency codes: {string.Join(", ", unknown)}.");

        audit.Log("currency_rates.upsert", "currency_rate_sheet",
            long.Parse(dto.Date.ToString("yyyyMMdd")), after: dto);
        await MergeRatesAsync(dto.Date, dto.Rates);

        return NoContent();
    }

    /// <summary>
    /// The official rate bulletin (.xlsx) for a date (spec 025), read like the legacy importer
    /// (<see cref="RateBulletinReader"/>). Every check runs before anything is written; the write
    /// is <see cref="Upsert"/>'s merge. The file is not kept.
    /// </summary>
    [HttpPost("import")]
    [RequirePermission(Permissions.CurrencyRates.Prepare)]
    [RequestSizeLimit(ImportMaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = ImportMaxBytes)]
    public async Task<IActionResult> Import([FromForm] string? date, IFormFile? file, [FromForm] bool overwrite = false)
    {
        // A string, not DateOnly: a bad date is `date_required`, not a binding failure.
        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var rateDate))
            return ErrorProblem(StatusCodes.Status400BadRequest, "A date in yyyy-MM-dd format is required.", "date_required");
        if (file is null || file.Length == 0)
            return ErrorProblem(StatusCodes.Status400BadRequest, "An .xlsx file is required.", "file_required");

        var fileName = MediaUploadRules.SanitizeFileName(file.FileName);
        if (!string.Equals(Path.GetExtension(fileName), ".xlsx", StringComparison.OrdinalIgnoreCase))
            return ErrorProblem(StatusCodes.Status400BadRequest, "Only .xlsx files can be imported.", RateBulletinReader.NotXlsx);

        // At most 5 MB, so in memory: the zip reader needs to seek, and reads synchronously.
        using var buffer = new MemoryStream((int)file.Length);
        await file.CopyToAsync(buffer, HttpContext.RequestAborted);
        // Inline, not a local: a span may not live in an async method across an await.
        if (!MediaUploadRules.MatchesSignature(".xlsx",
                buffer.GetBuffer().AsSpan(0, (int)Math.Min(buffer.Length, MediaUploadRules.SignatureWindow))))
            return ErrorProblem(StatusCodes.Status400BadRequest, "Only .xlsx files can be imported.", RateBulletinReader.NotXlsx);
        buffer.Position = 0;

        IReadOnlyList<BulletinRow> rows;
        try
        {
            rows = RateBulletinReader.Read(buffer);
        }
        catch (RateBulletinException e)
        {
            return ErrorProblem(StatusCodes.Status400BadRequest, e.Message, e.Code);
        }

        var known = (await db.Currencies.AsNoTracking().Select(c => c.Code).ToListAsync())
            .ToHashSet(StringComparer.Ordinal);

        var rates = new List<CurrencyRateItemDto>();
        var skipped = new List<string>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        foreach (var row in rows)
        {
            // The legacy site kept XDR in its `sdr` column, and its XML feed publishes Code="SDR".
            var code = row.Code == "XDR" ? "SDR" : row.Code;
            if (!known.Contains(code))
            {
                if (!skipped.Contains(code))
                    skipped.Add(code);
                continue;
            }
            if (!seen.Add(code))
                return ImportRowProblem("duplicate_code", $"Row {row.Row}: currency {code} appears more than once.", row.Row, code);

            var rate = row.IsNumeric ? RateBulletinReader.NormalizeRate(row.RawValue) : null;
            if (rate is null || rate <= 0)
                return ImportRowProblem("invalid_rate", $"Row {row.Row}: the rate for {code} is missing or not a positive number.", row.Row, code);
            rates.Add(new CurrencyRateItemDto(code, rate.Value));
        }

        if (rates.Count == 0)
            return ErrorProblem(StatusCodes.Status400BadRequest, "No known currency code was found in B7:G100.", "no_rates",
                new Dictionary<string, object?> { ["skipped"] = skipped });

        var existing = await db.CurrencyRates.AsNoTracking()
            .Where(r => r.RateDate == rateDate)
            .OrderBy(r => r.CurrencyCode)
            .Select(r => new { r.CurrencyCode, r.Rate })
            .ToListAsync();
        if (existing.Count > 0 && !overwrite)
            return ErrorProblem(StatusCodes.Status409Conflict,
                $"Rates for {rateDate:yyyy-MM-dd} already exist; send overwrite=true to import over them.", "sheet_exists",
                new Dictionary<string, object?> { ["count"] = existing.Count });

        audit.Log("currency_rates.import", "currency_rate_sheet",
            long.Parse(rateDate.ToString("yyyyMMdd")),
            before: existing.Count == 0 ? null : new { rates = existing },
            after: new { fileName, rates });
        await MergeRatesAsync(rateDate, rates);

        return Ok(new { date = rateDate, imported = rates.Count, skipped, rates });
    }

    private const int ImportMaxBytes = 5 * 1024 * 1024;

    private ObjectResult ImportRowProblem(string code, string message, int row, string currency) =>
        ErrorProblem(StatusCodes.Status400BadRequest, message, code,
            new Dictionary<string, object?> { ["row"] = row, ["currency"] = currency });

    /// <summary>
    /// Inserts or overwrites each rate for <paramref name="date"/>; the date's other rates are left
    /// untouched. One transaction, which also saves any audit entry the caller queued.
    /// </summary>
    private async Task MergeRatesAsync(DateOnly date, IReadOnlyList<CurrencyRateItemDto> rates)
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var userId = int.TryParse(sub, out var uid) ? uid : (int?)null;

        var codes = rates.Select(r => r.CurrencyCode).ToList();
        var existing = await db.CurrencyRates
            .Where(r => r.RateDate == date && codes.Contains(r.CurrencyCode))
            .ToDictionaryAsync(r => r.CurrencyCode);

        await using var tx = await db.Database.BeginTransactionAsync();
        foreach (var item in rates)
        {
            if (existing.TryGetValue(item.CurrencyCode, out var rate))
                rate.Rate = item.Rate;
            else
                db.CurrencyRates.Add(new CurrencyRate
                {
                    RateDate = date,
                    CurrencyCode = item.CurrencyCode,
                    Rate = item.Rate,
                    CreatedBy = userId,
                });
        }
        await db.SaveChangesAsync();
        await tx.CommitAsync();
    }

    [HttpDelete]
    [RequirePermission(Permissions.CurrencyRates.Prepare)]
    public async Task<IActionResult> Delete([FromQuery] DateOnly date)
    {
        var rates = await db.CurrencyRates.Where(r => r.RateDate == date).ToListAsync();
        if (rates.Count == 0)
            return NotFound();

        db.CurrencyRates.RemoveRange(rates);
        audit.Log("currency_rates.delete", "currency_rate_sheet",
            long.Parse(date.ToString("yyyyMMdd")),
            before: new { date, rates = rates.Select(r => new { r.CurrencyCode, r.Rate }) });
        await db.SaveChangesAsync();
        return NoContent();
    }
}
