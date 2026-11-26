using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record WorkingPaperTranslationDto(
    string? Title,
    List<string>? Authors = null,
    string? Abstract = null,
    List<string>? Keywords = null,
    long? MediaId = null);

public record WorkingPaperUpsertDto(
    short Number,
    short Year,
    string? PaperLanguage,
    ContentStatus Status,
    Dictionary<string, WorkingPaperTranslationDto>? Translations,
    List<string>? JelCodes = null,
    int? LegacyPageId = null);

/// <summary>
/// Working papers of the "Nəşrlər və tədqiqatlar" section (spec 054). One row per paper, a translation per locale;
/// the number is unique within its year among papers that are not deleted. Lists (authors, keywords, JEL codes) are
/// stored as text[] and normalised: trimmed, blank and repeated items dropped. The field rules live in
/// <see cref="WorkingPaperRules"/>; this controller adds the checks that need the table.
/// </summary>
[ApiController]
[RequirePermission(Permissions.WorkingPapers.Read)]
[Route("api/v1/working-papers")]
public class WorkingPapersController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "working_paper";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null,
        [FromQuery] short? year = null, [FromQuery] ContentStatus? status = null,
        CancellationToken ct = default)
    {
        var query = db.WorkingPapers.AsNoTracking();
        if (year is not null)
            query = query.Where(p => p.Year == year);
        if (status is not null)
            query = query.Where(p => p.Status == status);
        if (LikePattern.TooLong(search) is { } tooLong)
            return BadRequestProblem(tooLong);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = LikePattern.Contains(search);
            query = query.Where(p => p.Translations.Any(t => t.Title != null && EF.Functions.ILike(t.Title, pattern, LikePattern.Escape)));
        }

        var w = paging.Resolve(20);
        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Number).ThenBy(p => p.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(p => new
            {
                p.Id,
                p.Number,
                p.Year,
                TitleAz = p.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault(),
                TitleEn = p.Translations.Where(t => t.Locale == "en").Select(t => t.Title).FirstOrDefault(),
                p.Status,
                Locales = p.Translations.Where(t => t.Title != null && t.Title.Trim() != "")
                    .OrderBy(t => t.Locale == "az" ? 0 : 1).ThenBy(t => t.Locale).Select(t => t.Locale).ToList(),
                p.UpdatedAt,
            })
            .ToListAsync(ct);

        var items = rows.Select(r => new
        {
            r.Id,
            r.Number,
            r.Year,
            Code = Code(r.Number, r.Year),
            Title = string.IsNullOrWhiteSpace(r.TitleAz) ? r.TitleEn : r.TitleAz,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.Locales,
            r.UpdatedAt,
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var item = await DetailAsync(id, ct);
        return item is null ? NotFound() : Ok(item);
    }

    [HttpPost]
    [RequirePermission(Permissions.WorkingPapers.Create)]
    public async Task<IActionResult> Create(WorkingPaperUpsertDto dto, CancellationToken ct)
    {
        var errors = await ValidateAsync(dto, ct);
        if (errors.Count > 0)
            return FieldValidationProblem(errors);
        if (await TakenAsync(dto, exceptId: null, ct) is { } conflict)
            return ConflictProblem(conflict);

        var entity = new WorkingPaper { CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        db.WorkingPapers.Add(entity);
        await db.SaveChangesAsync(ct);
        audit.Log("working_papers.create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id, ct));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.WorkingPapers.Update)]
    public async Task<IActionResult> Update(int id, WorkingPaperUpsertDto dto, CancellationToken ct)
    {
        var entity = await db.WorkingPapers.Include(p => p.Translations).SingleOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound();

        var errors = await ValidateAsync(dto, ct);
        if (errors.Count > 0)
            return FieldValidationProblem(errors);
        if (await TakenAsync(dto, exceptId: id, ct) is { } conflict)
            return ConflictProblem(conflict);

        var before = await DetailAsync(id, ct);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("working_papers.update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync(ct);
        return Ok(await DetailAsync(id, ct));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.WorkingPapers.Delete)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.WorkingPapers.SingleOrDefaultAsync(p => p.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete; the number becomes free in its year
        entity.UpdatedBy = CurrentUserId();
        audit.Log("working_papers.delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// A friendly 409 before the insert. The partial unique indexes (0038) still guard a race, and
    /// <c>DbExceptionHandler</c> maps their violation to 409 as well.
    /// </summary>
    private async Task<string?> TakenAsync(WorkingPaperUpsertDto dto, int? exceptId, CancellationToken ct)
    {
        if (await db.WorkingPapers.AnyAsync(p => p.Number == dto.Number && p.Year == dto.Year && (exceptId == null || p.Id != exceptId), ct))
            return $"{Code(dto.Number, dto.Year)} nömrəli məqalə artıq var.";
        if (dto.LegacyPageId is { } legacy
            && await db.WorkingPapers.AnyAsync(p => p.LegacyPageId == legacy && (exceptId == null || p.Id != exceptId), ct))
            return $"Köhnə səhifə {legacy} artıq başqa məqaləyə bağlıdır.";
        return null;
    }

    /// <summary>
    /// The media FK is conditional (0038), so the referenced files are checked here, in one query for every locale.
    /// MediaAssets' query filter hides deleted files, so a deleted id counts as unknown.
    /// </summary>
    private async Task<Dictionary<string, string[]>> ValidateAsync(WorkingPaperUpsertDto dto, CancellationToken ct)
    {
        var mediaIds = WorkingPaperRules.MediaIds(dto);
        var mimeTypes = mediaIds.Count == 0
            ? []
            : await db.MediaAssets.AsNoTracking()
                .Where(m => mediaIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m.MimeType, ct);
        return WorkingPaperRules.Validate(dto, DateTime.UtcNow.Year, mimeTypes);
    }

    private static void Apply(WorkingPaper entity, WorkingPaperUpsertDto dto)
    {
        entity.Number = dto.Number;
        entity.Year = dto.Year;
        entity.PaperLanguage = dto.PaperLanguage!;
        entity.JelCodes = WorkingPaperRules.Normalize(dto.JelCodes, upper: true);
        // Set by the migration seed; a client that omits it (the panel's form has no such field) keeps the stored value.
        entity.LegacyPageId = dto.LegacyPageId ?? entity.LegacyPageId;
        entity.Status = dto.Status;

        var translations = dto.Translations ?? [];
        foreach (var (locale, tr) in translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new WorkingPaperTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Title = string.IsNullOrWhiteSpace(tr.Title) ? null : tr.Title.Trim();
            existing.Authors = WorkingPaperRules.Normalize(tr.Authors);
            existing.Abstract = string.IsNullOrWhiteSpace(tr.Abstract) ? null : tr.Abstract.Trim();
            existing.Keywords = WorkingPaperRules.Normalize(tr.Keywords);
            existing.MediaId = tr.MediaId;
        }
        // A locale left out of the request loses its translation (the PUT carries the whole paper).
        entity.Translations.RemoveAll(t => !translations.ContainsKey(t.Locale));
    }

    private static string Code(short number, short year) => $"{number:00}/{year}";

    private async Task<object?> DetailAsync(int id, CancellationToken ct)
    {
        var p = await db.WorkingPapers.AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new
            {
                x.Id,
                x.Number,
                x.Year,
                x.PaperLanguage,
                x.JelCodes,
                x.LegacyPageId,
                x.Status,
                x.CreatedAt,
                x.UpdatedAt,
                Translations = x.Translations.Select(t => new
                {
                    t.Locale,
                    t.Title,
                    t.Authors,
                    t.Abstract,
                    t.Keywords,
                    t.MediaId,
                    // The media query filter hides deleted files, so a deleted PDF shows as no media.
                    Media = db.MediaAssets.Where(m => m.Id == t.MediaId)
                        .Select(m => new { m.Id, m.OriginalName, m.MimeType, m.SizeBytes })
                        .FirstOrDefault(),
                }).ToList(),
            })
            .SingleOrDefaultAsync(ct);
        if (p is null)
            return null;

        return new
        {
            p.Id,
            p.Number,
            p.Year,
            Code = Code(p.Number, p.Year),
            p.PaperLanguage,
            p.JelCodes,
            p.LegacyPageId,
            Status = p.Status.ToString().ToLowerInvariant(),
            p.CreatedAt,
            p.UpdatedAt,
            Translations = p.Translations.ToDictionary(t => t.Locale, t => new
            {
                Title = t.Title ?? "",
                t.Authors,
                t.Abstract,
                t.Keywords,
                t.MediaId,
                t.Media,
            }),
        };
    }
}
