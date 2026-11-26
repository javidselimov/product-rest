using System.Globalization;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

/// <summary>
/// The yield curve as the legacy admin kept it (<c>product-host/admin/controllers/YieldCurveController.php</c>):
/// three independent date-keyed datasets — curve points, Nelson–Siegel parameters and the seven
/// standard-tenor yields — each imported from its own .xlsx and deleted by date on its own. Unlike
/// the legacy importer, every check runs before anything is written and the write is one
/// transaction, so a bad file never leaves a date half-replaced. Files are not kept.
/// </summary>
[ApiController]
[RequirePermission(Permissions.YieldCurves.Read)]
[Route("api/v1/yield-curves")]
public class YieldCurvesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const int ImportMaxBytes = 5 * 1024 * 1024;
    private const int MaxPoints = 5000;

    // Columns, A = 1.
    private const int ColA = 1, ColB = 2, ColC = 3, ColD = 4;
    private static readonly HashSet<int> PointColumns = [ColB, ColC];
    private static readonly HashSet<int> ParameterColumns = [ColA, ColB, ColC, ColD];
    private static readonly HashSet<int> PeriodColumns = [ColC];

    /// <summary>Rows of <c>C2:C8</c>, in tenor order: 3 months, 6 months, 9 months, 1–4 years.</summary>
    private const int FirstPeriodRow = 2, LastPeriodRow = 8;

    // --- Curve points (legacy YCYields) -----------------------------------------------------

    [HttpGet("yields")]
    public async Task<IActionResult> ListDates([FromQuery] PagingQuery paging)
    {
        var query = db.YcYields.AsNoTracking()
            .GroupBy(y => y.CurveDate)
            .Select(g => new { CurveDate = g.Key, PointsCount = g.Count(), UpdatedAt = g.Max(y => y.CreatedAt) });

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(x => x.CurveDate)
            .Skip(w.Skip).Take(w.PageSize)
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("yields/{date:datetime}")]
    public async Task<IActionResult> GetPoints(DateOnly date)
    {
        var points = await db.YcYields.AsNoTracking()
            .Where(y => y.CurveDate == date)
            .OrderBy(y => y.Period)
            .Select(y => new { y.Period, y.Yield })
            .ToListAsync();

        return points.Count == 0 ? NotFound() : Ok(new { curveDate = date, points });
    }

    /// <summary>Column <c>B</c> the tenor in days, <c>C</c> the yield, from row 2 on; a date's points are replaced as a whole.</summary>
    [HttpPost("yields/import")]
    [RequirePermission(Permissions.YieldCurves.Create)]
    [RequestSizeLimit(ImportMaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = ImportMaxBytes)]
    public async Task<IActionResult> ImportPoints([FromForm] string? date, IFormFile? file, [FromForm] bool overwrite = false)
    {
        var upload = await ReadUploadAsync(date, file);
        if (upload.Problem is not null)
            return upload.Problem;
        using var buffer = upload.Buffer!;

        IReadOnlyList<XlsxRow> rows;
        try
        {
            rows = XlsxSheetReader.Read(buffer, 2, int.MaxValue, PointColumns);
        }
        catch (XlsxReadException e)
        {
            return ImportProblem(StatusCodes.Status400BadRequest, e.Message, e.Code);
        }

        var userId = CurrentUserId();
        var points = new List<YcYield>();
        var seen = new HashSet<int>();
        foreach (var row in rows)
        {
            if (IsBlank(row[ColB]) && IsBlank(row[ColC]))
                continue;
            if (points.Count == MaxPoints)
                return ImportProblem(StatusCodes.Status400BadRequest,
                    $"The file has more than {MaxPoints} points.", "too_many_rows");

            var period = ToPeriod(row[ColB]);
            if (period is null)
                return InvalidValue(row.Row, ColB, "the tenor is not a whole number of days between 1 and 32767");
            var yield = ToNumber(row[ColC], 4, 10_000m);
            if (yield is null)
                return InvalidValue(row.Row, ColC, "the yield is missing or not a number below 10000");
            if (!seen.Add(period.Value))
                return ImportProblem(StatusCodes.Status400BadRequest,
                    $"Row {row.Row}: the tenor {period} appears more than once.", "duplicate_period",
                    new Dictionary<string, object?> { ["row"] = row.Row, ["column"] = "B" });

            points.Add(new YcYield { CurveDate = upload.Date, Period = period.Value, Yield = yield.Value, CreatedBy = userId });
        }

        if (points.Count == 0)
            return ImportProblem(StatusCodes.Status400BadRequest, "The file has no points in columns B and C.", "no_rows");

        var existing = await db.YcYields.CountAsync(y => y.CurveDate == upload.Date);
        if (existing > 0 && !overwrite)
            return DateExists(upload.Date, existing);

        await using var tx = await db.Database.BeginTransactionAsync();
        await db.YcYields.Where(y => y.CurveDate == upload.Date).ExecuteDeleteAsync();
        db.YcYields.AddRange(points);
        audit.Log("yield_curves.import_yields", "yield_curve_yields", DateKey(upload.Date),
            before: existing == 0 ? null : new { count = existing },
            after: new { upload.FileName, count = points.Count });
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(new { curveDate = upload.Date, imported = points.Count });
    }

    [HttpDelete("yields/{date:datetime}")]
    [RequirePermission(Permissions.YieldCurves.Delete)]
    public async Task<IActionResult> DeletePoints(DateOnly date)
    {
        await using var tx = await db.Database.BeginTransactionAsync();
        var deleted = await db.YcYields.Where(y => y.CurveDate == date).ExecuteDeleteAsync();
        if (deleted == 0)
            return NotFound();

        audit.Log("yield_curves.delete_yields", "yield_curve_yields", DateKey(date), before: new { date, count = deleted });
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }

    // --- Nelson–Siegel parameters (legacy YCParams) -----------------------------------------

    [HttpGet("parameters")]
    public async Task<IActionResult> ListParameters([FromQuery] PagingQuery paging)
    {
        var query = db.YcParameters.AsNoTracking();

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CurveDate)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(p => new { p.CurveDate, p.Beta0, p.Beta1, p.Beta2, p.Lambda, p.UpdatedAt })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    /// <summary>Row 2: <c>A</c> β₀, <c>B</c> β₁, <c>C</c> β₂, <c>D</c> λ.</summary>
    [HttpPost("parameters/import")]
    [RequirePermission(Permissions.YieldCurves.Create)]
    [RequestSizeLimit(ImportMaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = ImportMaxBytes)]
    public async Task<IActionResult> ImportParameters([FromForm] string? date, IFormFile? file, [FromForm] bool overwrite = false)
    {
        var upload = await ReadUploadAsync(date, file);
        if (upload.Problem is not null)
            return upload.Problem;
        using var buffer = upload.Buffer!;

        IReadOnlyList<XlsxRow> rows;
        try
        {
            rows = XlsxSheetReader.Read(buffer, 2, 2, ParameterColumns);
        }
        catch (XlsxReadException e)
        {
            return ImportProblem(StatusCodes.Status400BadRequest, e.Message, e.Code);
        }

        var row = rows.FirstOrDefault();
        if (row is null || ParameterColumns.All(c => IsBlank(row[c])))
            return ImportProblem(StatusCodes.Status400BadRequest, "Row 2 of the file has no parameters in A–D.", "no_rows");

        var values = new decimal[4];
        string[] names = ["β₀", "β₁", "β₂", "λ"];
        for (var i = 0; i < 4; i++)
        {
            var value = ToNumber(row[ColA + i], 6, 1_000_000m);
            if (value is null)
                return InvalidValue(row.Row, ColA + i, $"{names[i]} is missing or not a number below 1000000");
            values[i] = value.Value;
        }

        var entity = await db.YcParameters.SingleOrDefaultAsync(p => p.CurveDate == upload.Date);
        if (entity is not null && !overwrite)
            return DateExists(upload.Date, 1);

        var before = entity is null ? null : new { entity.Beta0, entity.Beta1, entity.Beta2, entity.Lambda };
        if (entity is null)
        {
            entity = new YcParameters { CurveDate = upload.Date, CreatedBy = CurrentUserId() };
            db.YcParameters.Add(entity);
        }
        (entity.Beta0, entity.Beta1, entity.Beta2, entity.Lambda) = (values[0], values[1], values[2], values[3]);

        audit.Log("yield_curves.import_parameters", "yield_curve_parameters", DateKey(upload.Date), before,
            after: new { upload.FileName, entity.Beta0, entity.Beta1, entity.Beta2, entity.Lambda });
        await db.SaveChangesAsync();

        return Ok(new { entity.CurveDate, entity.Beta0, entity.Beta1, entity.Beta2, entity.Lambda, entity.UpdatedAt });
    }

    [HttpDelete("parameters/{date:datetime}")]
    [RequirePermission(Permissions.YieldCurves.Delete)]
    public async Task<IActionResult> DeleteParameters(DateOnly date)
    {
        var entity = await db.YcParameters.SingleOrDefaultAsync(p => p.CurveDate == date);
        if (entity is null)
            return NotFound();

        db.YcParameters.Remove(entity);
        audit.Log("yield_curves.delete_parameters", "yield_curve_parameters", DateKey(date),
            before: new { date, entity.Beta0, entity.Beta1, entity.Beta2, entity.Lambda });
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --- Standard-tenor yields (legacy YCPeriods) -------------------------------------------

    [HttpGet("periods")]
    public async Task<IActionResult> ListPeriods([FromQuery] PagingQuery paging)
    {
        var query = db.YcPeriods.AsNoTracking();

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CurveDate)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(p => new
            {
                p.CurveDate, p.ThreeMonth, p.SixMonth, p.NineMonth,
                p.OneYear, p.TwoYear, p.ThreeYear, p.FourYear, p.UpdatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    /// <summary><c>C2:C8</c>; column <c>B</c>'s labels are not checked, data in <c>C9</c> or below is refused.</summary>
    [HttpPost("periods/import")]
    [RequirePermission(Permissions.YieldCurves.Create)]
    [RequestSizeLimit(ImportMaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = ImportMaxBytes)]
    public async Task<IActionResult> ImportPeriods([FromForm] string? date, IFormFile? file, [FromForm] bool overwrite = false)
    {
        var upload = await ReadUploadAsync(date, file);
        if (upload.Problem is not null)
            return upload.Problem;
        using var buffer = upload.Buffer!;

        IReadOnlyList<XlsxRow> rows;
        try
        {
            rows = XlsxSheetReader.Read(buffer, FirstPeriodRow, int.MaxValue, PeriodColumns);
        }
        catch (XlsxReadException e)
        {
            return ImportProblem(StatusCodes.Status400BadRequest, e.Message, e.Code);
        }

        var filled = rows.Where(r => !IsBlank(r[ColC])).ToList();
        if (filled.Count == 0)
            return ImportProblem(StatusCodes.Status400BadRequest, "The file has no yields in C2:C8.", "no_rows");
        if (filled.FirstOrDefault(r => r.Row > LastPeriodRow) is { } extra)
            return ImportProblem(StatusCodes.Status400BadRequest,
                $"Row {extra.Row}: only C2:C8 may hold data — is this the yield curve file?", "too_many_rows",
                new Dictionary<string, object?> { ["row"] = extra.Row, ["column"] = "C" });

        var byRow = filled.ToDictionary(r => r.Row);
        var values = new decimal[LastPeriodRow - FirstPeriodRow + 1];
        for (var r = FirstPeriodRow; r <= LastPeriodRow; r++)
        {
            var value = ToNumber(byRow.GetValueOrDefault(r)?[ColC], 4, 10_000m);
            if (value is null)
                return InvalidValue(r, ColC, "the yield is missing or not a number below 10000");
            values[r - FirstPeriodRow] = value.Value;
        }

        var entity = await db.YcPeriods.SingleOrDefaultAsync(p => p.CurveDate == upload.Date);
        if (entity is not null && !overwrite)
            return DateExists(upload.Date, 1);

        var before = entity is null ? null : PeriodsDto(entity);
        if (entity is null)
        {
            entity = new YcPeriods { CurveDate = upload.Date, CreatedBy = CurrentUserId() };
            db.YcPeriods.Add(entity);
        }
        entity.ThreeMonth = values[0];
        entity.SixMonth = values[1];
        entity.NineMonth = values[2];
        entity.OneYear = values[3];
        entity.TwoYear = values[4];
        entity.ThreeYear = values[5];
        entity.FourYear = values[6];

        audit.Log("yield_curves.import_periods", "yield_curve_periods", DateKey(upload.Date), before,
            after: new { upload.FileName, periods = PeriodsDto(entity) });
        await db.SaveChangesAsync();

        return Ok(new
        {
            entity.CurveDate, entity.ThreeMonth, entity.SixMonth, entity.NineMonth,
            entity.OneYear, entity.TwoYear, entity.ThreeYear, entity.FourYear, entity.UpdatedAt,
        });
    }

    [HttpDelete("periods/{date:datetime}")]
    [RequirePermission(Permissions.YieldCurves.Delete)]
    public async Task<IActionResult> DeletePeriods(DateOnly date)
    {
        var entity = await db.YcPeriods.SingleOrDefaultAsync(p => p.CurveDate == date);
        if (entity is null)
            return NotFound();

        db.YcPeriods.Remove(entity);
        audit.Log("yield_curves.delete_periods", "yield_curve_periods", DateKey(date),
            before: new { date, periods = PeriodsDto(entity) });
        await db.SaveChangesAsync();
        return NoContent();
    }

    // --- Shared -----------------------------------------------------------------------------

    private sealed record Upload(DateOnly Date, string FileName, MemoryStream? Buffer, ObjectResult? Problem);

    /// <summary>The form's date and .xlsx, checked like the rate bulletin import; the file in memory, positioned at 0.</summary>
    private async Task<Upload> ReadUploadAsync(string? date, IFormFile? file)
    {
        // A string, not DateOnly: a bad date is `date_required`, not a binding failure.
        if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var curveDate))
            return Failed(ImportProblem(StatusCodes.Status400BadRequest, "A date in yyyy-MM-dd format is required.", "date_required"));
        if (file is null || file.Length == 0)
            return Failed(ImportProblem(StatusCodes.Status400BadRequest, "An .xlsx file is required.", "file_required"));

        var fileName = MediaUploadRules.SanitizeFileName(file.FileName);
        if (!string.Equals(Path.GetExtension(fileName), ".xlsx", StringComparison.OrdinalIgnoreCase))
            return Failed(NotXlsx());

        // At most 5 MB, so in memory: the zip reader needs to seek, and reads synchronously.
        var buffer = new MemoryStream((int)file.Length);
        await file.CopyToAsync(buffer, HttpContext.RequestAborted);
        if (!MediaUploadRules.MatchesSignature(".xlsx",
                buffer.GetBuffer().AsSpan(0, (int)Math.Min(buffer.Length, MediaUploadRules.SignatureWindow))))
        {
            await buffer.DisposeAsync();
            return Failed(NotXlsx());
        }
        buffer.Position = 0;
        return new Upload(curveDate, fileName, buffer, null);

        static Upload Failed(ObjectResult problem) => new(default, string.Empty, null, problem);
    }

    private ObjectResult NotXlsx() =>
        ImportProblem(StatusCodes.Status400BadRequest, "Only .xlsx files can be imported.", XlsxSheetReader.NotXlsx);

    private ObjectResult ImportProblem(int status, string message, string code,
        IReadOnlyDictionary<string, object?>? extensions = null) =>
        ErrorProblem(status, message, code, extensions);

    private ObjectResult InvalidValue(int row, int column, string what)
    {
        var name = XlsxSheetReader.ColumnName(column);
        return ImportProblem(StatusCodes.Status400BadRequest, $"Cell {name}{row}: {what}.", "invalid_value",
            new Dictionary<string, object?> { ["row"] = row, ["column"] = name });
    }

    private ObjectResult DateExists(DateOnly date, int count) =>
        ImportProblem(StatusCodes.Status409Conflict,
            $"Data for {date:yyyy-MM-dd} already exists; send overwrite=true to replace it.", "date_exists",
            new Dictionary<string, object?> { ["count"] = count });

    private static bool IsBlank(XlsxCell? cell) => string.IsNullOrWhiteSpace(cell?.Value);

    /// <summary>A numeric cell, rounded like the legacy importer, with absolute value below <paramref name="limit"/>.</summary>
    private static decimal? ToNumber(XlsxCell? cell, int decimals, decimal limit)
    {
        if (cell is not { IsNumeric: true })
            return null;
        var value = XlsxSheetReader.NormalizeNumber(cell.Value, decimals);
        return value is { } v && Math.Abs(v) < limit ? v : null;
    }

    /// <summary>A numeric cell holding a whole number of days, 1–32767.</summary>
    private static int? ToPeriod(XlsxCell? cell)
    {
        if (cell is not { IsNumeric: true }
            || !decimal.TryParse(cell.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var value)
            || value != decimal.Truncate(value) || value is < 1 or > 32767)
            return null;
        return (int)value;
    }

    /// <summary>The audit log's entity id for a date-keyed dataset: <c>yyyyMMdd</c>, as the rate sheets use.</summary>
    private static long DateKey(DateOnly date) => long.Parse(date.ToString("yyyyMMdd", CultureInfo.InvariantCulture));

    private static object PeriodsDto(YcPeriods p) => new
    {
        p.ThreeMonth, p.SixMonth, p.NineMonth, p.OneYear, p.TwoYear, p.ThreeYear, p.FourYear,
    };
}
