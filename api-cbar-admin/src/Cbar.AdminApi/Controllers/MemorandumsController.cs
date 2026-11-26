using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record MemorandumTranslationDto(string Organization, string Country);
public record MemorandumUpsertDto(
    short SignedYear,
    int SortOrder,
    ContentStatus Status,
    bool ShowAz,
    bool ShowEn,
    Dictionary<string, MemorandumTranslationDto> Translations);

/// <summary>
/// Memoranda of Understanding (spec 045): the rows of the table on the page
/// "Mərkəzi banklarla əməkdaşlıq". A row is an organization, a country and a year of signing.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Memorandums.Read)]
[Route("api/v1/memorandums")]
public class MemorandumsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "memorandum";
    private const short MinYear = 1991;
    private const int MaxOrganizationLength = 500;
    private const int MaxCountryLength = 100;

    /// <summary>Newest year first, then the editor's order: what the site shows by default.</summary>
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null)
    {
        var query = db.Memorandums.AsNoTracking();
        if (status is not null)
            query = query.Where(m => m.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(m => m.Translations.Any(t =>
                EF.Functions.ILike(t.Organization, $"%{search}%") || EF.Functions.ILike(t.Country, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(m => m.SignedYear).ThenBy(m => m.SortOrder).ThenBy(m => m.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(m => new
            {
                m.Id,
                Status = m.Status.ToString().ToLowerInvariant(),
                m.SortOrder,
                m.ShowAz,
                m.ShowEn,
                // The az row when there is one, else any locale's; both cells come from the same row.
                Organization = m.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).ThenBy(t => t.Id)
                    .Select(t => t.Organization).FirstOrDefault(),
                Country = m.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).ThenBy(t => t.Id)
                    .Select(t => t.Country).FirstOrDefault(),
                m.SignedYear,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await LoadAsync(id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Memorandums.Create)]
    public async Task<IActionResult> Create(MemorandumUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new Memorandum { CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Memorandums.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("memorandums.create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto((await LoadAsync(entity.Id))!));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Memorandums.Update)]
    public async Task<IActionResult> Update(int id, MemorandumUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.Memorandums
            .Include(m => m.Translations)
            .SingleOrDefaultAsync(m => m.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("memorandums.update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto((await LoadAsync(id))!));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Memorandums.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Memorandums.SingleOrDefaultAsync(m => m.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("memorandums.delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<Memorandum?> LoadAsync(int id) => db.Memorandums.AsNoTracking()
        .Include(m => m.Translations)
        .SingleOrDefaultAsync(m => m.Id == id);

    /// <summary>The first thing wrong with the request, or null.</summary>
    private static string? Invalid(MemorandumUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return "At least one language is required.";
        if (dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Organization) || string.IsNullOrWhiteSpace(t.Country)))
            return "An organization and a country are required.";
        if (dto.Translations.Values.Any(t => t.Organization.Trim().Length > MaxOrganizationLength || t.Country.Trim().Length > MaxCountryLength))
            return "An organization or a country is too long.";
        if (dto.Status == ContentStatus.Scheduled)
            return "A memorandum cannot be scheduled.";
        // A memorandum signed late in the year may be entered ahead of time, hence next year.
        var maxYear = DateTime.UtcNow.Year + 1;
        if (dto.SignedYear < MinYear || dto.SignedYear > maxYear)
            return $"The year must be between {MinYear} and {maxYear}.";
        return null;
    }

    private static void Apply(Memorandum entity, MemorandumUpsertDto dto)
    {
        entity.SignedYear = dto.SignedYear;
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        entity.ShowAz = dto.ShowAz;
        entity.ShowEn = dto.ShowEn;

        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new MemorandumTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Organization = tr.Organization.Trim();
            existing.Country = tr.Country.Trim();
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(Memorandum m) => new
    {
        m.Id,
        m.SignedYear,
        m.SortOrder,
        Status = m.Status.ToString().ToLowerInvariant(),
        m.ShowAz,
        m.ShowEn,
        m.CreatedAt,
        m.UpdatedAt,
        Translations = m.Translations.ToDictionary(t => t.Locale, t => new { t.Organization, t.Country }),
    };
}
