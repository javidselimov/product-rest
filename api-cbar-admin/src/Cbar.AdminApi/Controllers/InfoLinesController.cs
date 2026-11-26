using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record InfoLineTranslationDto(string Title, string? Value);
public record InfoLineUpsertDto(
    string Alias,
    short? Year,
    int SortOrder,
    bool IsActive,
    Dictionary<string, InfoLineTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.InfoLines.Read)]
[Route("api/v1/info-lines")]
public class InfoLinesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? alias = null)
    {
        var query = db.InfoLines.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(alias))
            query = query.Where(l => EF.Functions.ILike(l.Alias, $"%{alias}%"));

        var w = paging.Resolve(50);
        var total = await query.CountAsync();
        var items = await query
            .Include(l => l.Translations)
            .OrderBy(l => l.Alias).ThenByDescending(l => l.Year).ThenBy(l => l.SortOrder)
            .Skip(w.Skip).Take(w.PageSize)
            .ToListAsync();

        return Ok(new
        {
            items = items
                .GroupBy(l => l.Alias)
                .Select(g => new { alias = g.Key, lines = g.Select(ToDetailDto) }),
            total,
            page = w.Page,
            pageSize = w.PageSize,
        });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var line = await db.InfoLines.AsNoTracking()
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        return line is null ? NotFound() : Ok(ToDetailDto(line));
    }

    [HttpPost]
    [RequirePermission(Permissions.InfoLines.Create)]
    public async Task<IActionResult> Create(InfoLineUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Alias))
            return BadRequestProblem("Alias is required.");
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new InfoLine
        {
            Alias = dto.Alias,
            Year = dto.Year,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            CreatedBy = CurrentUserId(),
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.InfoLines.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("info_lines.create", "info_line", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.InfoLines.Update)]
    public async Task<IActionResult> Update(int id, InfoLineUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Alias))
            return BadRequestProblem("Alias is required.");
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.InfoLines
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.Alias = dto.Alias;
        entity.Year = dto.Year;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.UpdatedBy = CurrentUserId();
        ApplyTranslations(entity, dto);

        audit.Log("info_lines.update", "info_line", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.InfoLines.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.InfoLines
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();

        db.InfoLines.Remove(entity);   // hard delete (no deleted_at column)
        audit.Log("info_lines.delete", "info_line", id, before: ToDetailDto(entity));
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(InfoLine entity, InfoLineUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new InfoLineTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Value = tr.Value,
                });
            }
            else
            {
                existing.Title = tr.Title;
                existing.Value = tr.Value;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(InfoLine l) => new
    {
        l.Id,
        l.Alias,
        l.Year,
        l.SortOrder,
        l.IsActive,
        l.UpdatedAt,
        Translations = l.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Value }),
    };
}
