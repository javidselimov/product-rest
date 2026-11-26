using System.Globalization;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Time;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record AzirUpsertDto(
    DateOnly ValueDate, string Term, decimal Rate,
    decimal? DealVolume = null, int? DealCount = null,
    decimal? MinRate = null, decimal? MaxRate = null,
    bool IsReservePlan = false);

[ApiController]
[RequirePermission(Permissions.Azir.Read)]
[Route("api/v1/azir")]
public class AzirController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const int ImportMaxBytes = 5 * 1024 * 1024;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] DateOnly? from = null, [FromQuery] DateOnly? to = null,
        [FromQuery] string? term = null)
    {
        var query = db.AzirIndexValues.AsNoTracking();
        if (from is not null)
            query = query.Where(a => a.ValueDate >= from);
        if (to is not null)
            query = query.Where(a => a.ValueDate <= to);
        if (!string.IsNullOrWhiteSpace(term))
            query = query.Where(a => a.Term == term);

        var w = paging.Resolve(50);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.ValueDate).ThenBy(a => a.Term)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(a => new
            {
                a.Id, a.ValueDate, a.Term, a.Rate,
                // A value saved without details has no details row: nulls and not reserve plan.
                dealVolume = a.Details == null ? null : a.Details.DealVolume,
                dealCount = a.Details == null ? null : a.Details.DealCount,
                minRate = a.Details == null ? null : a.Details.MinRate,
                maxRate = a.Details == null ? null : a.Details.MaxRate,
                isReservePlan = a.Details != null && a.Details.IsReservePlan,
                a.UpdatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpPost]
    [RequirePermission(Permissions.Azir.Create)]
    public async Task<IActionResult> Upsert(AzirUpsertDto dto)
    {
        var errors = Validate(dto);
        if (errors.Count > 0)
            return FieldValidationProblem(errors);

        var entity = await db.AzirIndexValues
            .Include(a => a.Details)
            .SingleOrDefaultAsync(a => a.ValueDate == dto.ValueDate && a.Term == dto.Term);

        if (entity is null)
        {
            entity = new AzirIndexValue { ValueDate = dto.ValueDate, Term = dto.Term, Rate = dto.Rate };
            ApplyDetails(entity, dto);
            await using var tx = await db.Database.BeginTransactionAsync();
            db.AzirIndexValues.Add(entity);
            await db.SaveChangesAsync();
            audit.Log("azir.create", "azir_index_value", entity.Id, after: dto);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        else
        {
            var before = Snapshot(entity);
            entity.Rate = dto.Rate;
            ApplyDetails(entity, dto);
            // Marks the value modified even when only its details changed, so updatedAt moves.
            entity.UpdatedAt = DateTimeOffset.UtcNow;
            audit.Log("azir.update", "azir_index_value", entity.Id, before, dto);
            await db.SaveChangesAsync();
        }

        return Ok(new
        {
            entity.Id, entity.ValueDate, entity.Term, entity.Rate,
            entity.Details!.DealVolume, entity.Details.DealCount,
            entity.Details.MinRate, entity.Details.MaxRate, entity.Details.IsReservePlan,
        });
    }

    /// <summary>
    /// One day of the bank's "AZIR Website" workbook (spec 058). <see cref="AzirSheetReader"/> checks the
    /// whole file first; each tenor is then written like <see cref="Upsert"/>, in one transaction. Other
    /// tenors of the date are left untouched. A date that already has any of the file's tenors needs
    /// <paramref name="overwrite"/>. The file is not kept.
    /// </summary>
    [HttpPost("import")]
    [RequirePermission(Permissions.Azir.Create)]
    [RequestSizeLimit(ImportMaxBytes)]
    [RequestFormLimits(MultipartBodyLengthLimit = ImportMaxBytes)]
    public async Task<IActionResult> Import(IFormFile? file, [FromForm] bool overwrite = false)
    {
        var upload = await ReadUploadAsync(file);
        if (upload.Problem is not null)
            return upload.Problem;
        using var buffer = upload.Buffer!;

        AzirSheet sheet;
        try
        {
            sheet = AzirSheetReader.Read(buffer, BakuClock.Today());
        }
        catch (XlsxReadException e)
        {
            return ErrorProblem(StatusCodes.Status400BadRequest, e.Message, e.Code);
        }
        catch (AzirSheetException e)
        {
            return ErrorProblem(StatusCodes.Status400BadRequest, e.Message, e.Code, SheetProblemDetails(e));
        }

        var terms = sheet.Terms.Select(t => t.Term).ToList();
        var existing = await db.AzirIndexValues
            .Include(a => a.Details)
            .Where(a => a.ValueDate == sheet.ValueDate && terms.Contains(a.Term))
            .ToDictionaryAsync(a => a.Term);

        if (existing.Count > 0 && !overwrite)
        {
            return ErrorProblem(StatusCodes.Status409Conflict,
                $"AZIR values for {DateText(sheet.ValueDate)} already exist; send overwrite=true to replace them.", "date_exists",
                new Dictionary<string, object?>
                {
                    ["valueDate"] = DateText(sheet.ValueDate),
                    ["count"] = existing.Count,
                    ["terms"] = terms.Where(existing.ContainsKey).ToList(),
                });
        }

        var before = existing.Count == 0 ? null : existing.Values.Select(Snapshot).ToList();

        await using var tx = await db.Database.BeginTransactionAsync();
        var values = sheet.Terms.Select(term => WriteTerm(sheet.ValueDate, term, existing)).ToList();
        audit.Log("azir.import", "azir_index_value", DateKey(sheet.ValueDate), before,
            after: new { upload.FileName, sheet.Terms, sheet.Skipped });
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(new
        {
            valueDate = sheet.ValueDate,
            values,
            skipped = sheet.Skipped.Select(s => new { row = s.Row, name = s.Name, reason = s.Reason }),
            volumeConverted = sheet.VolumeConverted,
        });
    }

    [HttpDelete("{id:long}")]
    [RequirePermission(Permissions.Azir.Delete)]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await db.AzirIndexValues
            .Include(a => a.Details)
            .SingleOrDefaultAsync(a => a.Id == id);
        if (entity is null)
            return NotFound();

        // Removed explicitly: the database FK (and its cascade) exists only where the migration
        // role may reference azir_index_values (0008-azir-index-value-details.sql).
        if (entity.Details is not null)
            db.AzirIndexValueDetails.Remove(entity.Details);
        db.AzirIndexValues.Remove(entity);
        audit.Log("azir.delete", "azir_index_value", id, before: Snapshot(entity));
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Field rules of spec 021 (data-model §3). The database CHECKs repeat the ranges; these give
    /// the panel a message per field. Keys are the camelCase body names.
    /// </summary>
    private static Dictionary<string, string[]> Validate(AzirUpsertDto dto)
    {
        var errors = new Dictionary<string, string[]>();
        void Add(string field, string message) => errors.TryAdd(field, [message]);

        if (string.IsNullOrWhiteSpace(dto.Term))
            Add("term", "Term is required.");
        else if (dto.Term.Length > 10)
            Add("term", "Term must be at most 10 characters.");

        if (dto.Rate is < 0 or >= 10000)
            Add("rate", "Rate must be zero or positive and below 10000.");
        else if (decimal.Round(dto.Rate, 4) != dto.Rate)
            Add("rate", "Rate must have at most 4 decimals.");

        if (dto.DealVolume is < 0 or >= 10_000_000_000m)
            Add("dealVolume", "Deal volume must be zero or positive and below 10000000000.");
        else if (dto.DealVolume is { } volume && decimal.Round(volume, 2) != volume)
            Add("dealVolume", "Deal volume must have at most 2 decimals.");

        if (dto.DealCount is < 0)
            Add("dealCount", "Deal count must be zero or positive.");

        CheckRate("minRate", "Minimum rate", dto.MinRate);
        CheckRate("maxRate", "Maximum rate", dto.MaxRate);
        if (dto.MinRate is { } min && dto.MaxRate is { } max && min > max)
            Add("minRate", "Minimum rate must not exceed maximum rate.");

        return errors;

        void CheckRate(string field, string label, decimal? value)
        {
            if (value is < 0 or >= 10000)
                Add(field, $"{label} must be zero or positive and below 10000.");
            else if (value is { } v && decimal.Round(v, 4) != v)
                Add(field, $"{label} must have at most 4 decimals.");
        }
    }

    /// <summary>A full replacement: omitted fields become null / not reserve plan.</summary>
    private static void ApplyDetails(AzirIndexValue entity, AzirUpsertDto dto)
    {
        entity.Details ??= new AzirIndexValueDetail();
        entity.Details.DealVolume = dto.DealVolume;
        entity.Details.DealCount = dto.DealCount;
        entity.Details.MinRate = dto.MinRate;
        entity.Details.MaxRate = dto.MaxRate;
        entity.Details.IsReservePlan = dto.IsReservePlan;
    }

    /// <summary>
    /// Stages one imported tenor like <see cref="Upsert"/> (a full replacement of rate and details) and
    /// returns its result item, with the replaced value as <c>previous</c>.
    /// </summary>
    private object WriteTerm(DateOnly valueDate, AzirSheetTerm term, Dictionary<string, AzirIndexValue> existing)
    {
        object? previous = null;
        if (existing.TryGetValue(term.Term, out var entity))
        {
            previous = Fields(entity);
            entity.Rate = term.Rate;
            entity.UpdatedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            entity = new AzirIndexValue { ValueDate = valueDate, Term = term.Term, Rate = term.Rate };
            db.AzirIndexValues.Add(entity);
        }

        ApplyDetails(entity, new AzirUpsertDto(valueDate, term.Term, term.Rate, term.DealVolume, term.DealCount,
            term.MinRate, term.MaxRate, term.IsReservePlan));

        return new
        {
            term = term.Term, rate = term.Rate,
            dealVolume = term.DealVolume, dealCount = term.DealCount,
            minRate = term.MinRate, maxRate = term.MaxRate, isReservePlan = term.IsReservePlan,
            previous,
        };
    }

    /// <summary>A stored value as the import result's <c>previous</c>.</summary>
    private static object Fields(AzirIndexValue entity) => new
    {
        rate = entity.Rate,
        dealVolume = entity.Details?.DealVolume,
        dealCount = entity.Details?.DealCount,
        minRate = entity.Details?.MinRate,
        maxRate = entity.Details?.MaxRate,
        isReservePlan = entity.Details?.IsReservePlan ?? false,
    };

    private sealed record Upload(string FileName, MemoryStream? Buffer, ObjectResult? Problem);

    /// <summary>The .xlsx checked like the yield curve and rate bulletin imports; in memory, positioned at 0.</summary>
    private async Task<Upload> ReadUploadAsync(IFormFile? file)
    {
        if (file is null || file.Length == 0)
            return Failed(ErrorProblem(StatusCodes.Status400BadRequest, "An .xlsx file is required.", "file_required"));

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
        return new Upload(fileName, buffer, null);

        static Upload Failed(ObjectResult problem) => new(string.Empty, null, problem);
    }

    private ObjectResult NotXlsx() =>
        ErrorProblem(StatusCodes.Status400BadRequest, "Only .xlsx files can be imported.", XlsxSheetReader.NotXlsx);

    private static Dictionary<string, object?>? SheetProblemDetails(AzirSheetException e)
    {
        var details = new Dictionary<string, object?>();
        if (e.Row is { } row)
            details["row"] = row;
        if (e.Column is { } column)
            details["column"] = column;
        if (e.ValueDate is { } date)
            details["valueDate"] = DateText(date);
        return details.Count == 0 ? null : details;
    }

    private static string DateText(DateOnly date) => date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    /// <summary>The audit log's entity id for a date-keyed import: <c>yyyyMMdd</c>, as the rate sheets use.</summary>
    private static long DateKey(DateOnly date) => long.Parse(date.ToString("yyyyMMdd", CultureInfo.InvariantCulture), CultureInfo.InvariantCulture);

    private static object Snapshot(AzirIndexValue entity) => new
    {
        entity.ValueDate, entity.Term, entity.Rate,
        DealVolume = entity.Details?.DealVolume,
        DealCount = entity.Details?.DealCount,
        MinRate = entity.Details?.MinRate,
        MaxRate = entity.Details?.MaxRate,
        IsReservePlan = entity.Details?.IsReservePlan ?? false,
    };
}
