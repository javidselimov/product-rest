using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FincertDirectionTranslationDto(string? Title, string? Body);
public record FincertDirectionUpsertDto(ContentStatus Status, Dictionary<string, FincertDirectionTranslationDto> Translations);
public record FincertOrderDto(List<int> Ids);

/// <summary>
/// FinCERT activity directions (spec 053), the numbered accordions of the FinCERT page. A language is stored only when
/// its title and body are both filled, so the site never shows half a direction; a language the editor left empty (an
/// untouched editor saves <c>&lt;p&gt;&lt;/p&gt;</c>) is not stored.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Fincert.Read)]
[Route("api/v1/fincert/directions")]
public class FincertDirectionsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "fincert_direction";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        CancellationToken ct = default)
    {
        var query = db.FincertDirections.AsNoTracking();
        if (status is not null)
            query = query.Where(d => d.Status == status);
        if (LikePattern.TooLong(search) is { } tooLong)
            return BadRequestProblem(tooLong);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = LikePattern.Contains(search);
            query = query.Where(d => d.Translations.Any(t => EF.Functions.ILike(t.Title, pattern, LikePattern.Escape)));
        }

        var w = paging.Resolve(20);
        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(d => new
            {
                d.Id,
                // Position among all non-deleted directions, as the panel numbers them (the site numbers the visible ones).
                Number = db.FincertDirections.Count(o => o.SortOrder < d.SortOrder || (o.SortOrder == d.SortOrder && o.Id < d.Id)) + 1,
                d.SortOrder,
                d.Status,
                Title = d.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? d.Translations.Select(t => t.Title).FirstOrDefault(),
                Locales = d.Translations.Select(t => t.Locale).ToList(),
                d.UpdatedAt,
            })
            .AsSplitQuery()
            .ToListAsync(ct);

        var items = rows.Select(r => new
        {
            r.Id,
            r.Number,
            r.SortOrder,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.Title,
            Locales = ContentSupport.Locales.Where(r.Locales.Contains).ToList(),
            // Stored languages are complete by construction (see the class summary).
            IncompleteLocales = Array.Empty<string>(),
            r.UpdatedAt,
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var detail = await DetailAsync(id, ct);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost]
    [RequirePermission(Permissions.Fincert.Create)]
    public async Task<IActionResult> Create(FincertDirectionUpsertDto dto, CancellationToken ct)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var maxOrder = await db.FincertDirections.MaxAsync(d => (int?)d.SortOrder, ct) ?? 0;
        var entity = new FincertDirection { SortOrder = maxOrder + 1, CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        db.FincertDirections.Add(entity);
        await db.SaveChangesAsync(ct);
        audit.Log("fincert.direction_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id, ct));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Fincert.Update)]
    public async Task<IActionResult> Update(int id, FincertDirectionUpsertDto dto, CancellationToken ct)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.FincertDirections.Include(d => d.Translations).SingleOrDefaultAsync(d => d.Id == id, ct);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id, ct);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("fincert.direction_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync(ct);
        return Ok(await DetailAsync(id, ct));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Fincert.Delete)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.FincertDirections.SingleOrDefaultAsync(d => d.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("fincert.direction_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("order")]
    [RequirePermission(Permissions.Fincert.Update)]
    public async Task<IActionResult> Reorder([FromBody] FincertOrderDto dto, CancellationToken ct)
    {
        var directions = await db.FincertDirections.OrderBy(d => d.SortOrder).ThenBy(d => d.Id).ToListAsync(ct);
        if (ContentSupport.InvalidOrder(dto.Ids, directions.Select(d => d.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = directions.Select(d => d.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            directions.Single(d => d.Id == dto.Ids[i]).SortOrder = i + 1;

        // The whole list changes, not one direction: entity id 0.
        audit.Log("fincert.direction_reorder", AuditEntity, 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    private static bool Filled(FincertDirectionTranslationDto t) => !string.IsNullOrWhiteSpace(t.Title) && !ContentSupport.IsBlankHtml(t.Body);

    private static bool Started(FincertDirectionTranslationDto t) => !string.IsNullOrWhiteSpace(t.Title) || !ContentSupport.IsBlankHtml(t.Body);

    private static string? Invalid(FincertDirectionUpsertDto dto)
    {
        if (dto.Status == ContentStatus.Scheduled)
            return "İstiqamət planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.";
        if (dto.Translations.Keys.Any(k => !ContentSupport.Locales.Contains(k)))
            return "Yalnız az və en dilləri qəbul olunur.";

        // A language with only a title or only a body would show an empty or untitled accordion on the site.
        foreach (var (locale, tr) in dto.Translations)
            if (Started(tr) && !Filled(tr))
                return $"«{locale}» dilində başlıq və mətn birlikdə doldurulmalıdır.";
        if (!dto.Translations.Values.Any(Filled))
            return "Ən azı bir dildə başlıq və mətn yazılmalıdır.";
        if (dto.Translations.Values.Any(t => t.Title?.Trim().Length > FincertSupport.MaxTitleLength))
            return $"Başlıq ən çox {FincertSupport.MaxTitleLength} simvol ola bilər.";
        return null;
    }

    private static void Apply(FincertDirection entity, FincertDirectionUpsertDto dto)
    {
        entity.Status = dto.Status;

        var filled = dto.Translations.Where(t => Filled(t.Value)).ToDictionary();
        foreach (var (locale, tr) in filled)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FincertDirectionTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Title = tr.Title!.Trim();
            existing.Body = tr.Body!;
        }
        entity.Translations.RemoveAll(t => !filled.ContainsKey(t.Locale));
    }

    private async Task<object?> DetailAsync(int id, CancellationToken ct)
    {
        var d = await db.FincertDirections.AsNoTracking().Include(x => x.Translations).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (d is null)
            return null;
        return new
        {
            d.Id,
            d.SortOrder,
            Status = d.Status.ToString().ToLowerInvariant(),
            d.CreatedAt,
            d.UpdatedAt,
            Translations = d.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Body }),
        };
    }
}
