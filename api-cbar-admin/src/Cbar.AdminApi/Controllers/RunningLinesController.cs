using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record RunningLineTranslationDto(string Text);
public record RunningLineUpsertDto(
    bool IsActive,
    DateTimeOffset? StartsAt,
    DateTimeOffset? EndsAt,
    Dictionary<string, RunningLineTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.RunningLines.Read)]
[Route("api/v1/running-lines")]
public class RunningLinesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.RunningLines.AsNoTracking()
            .Include(r => r.Translations)
            .OrderByDescending(r => r.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.RunningLines.AsNoTracking()
            .Include(r => r.Translations)
            .SingleOrDefaultAsync(r => r.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.RunningLines.Create)]
    public async Task<IActionResult> Create(RunningLineUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new RunningLine { IsActive = dto.IsActive, StartsAt = dto.StartsAt, EndsAt = dto.EndsAt };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.RunningLines.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("running_lines.create", "running_line", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.RunningLines.Update)]
    public async Task<IActionResult> Update(int id, RunningLineUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.RunningLines
            .Include(r => r.Translations)
            .SingleOrDefaultAsync(r => r.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.IsActive = dto.IsActive;
        entity.StartsAt = dto.StartsAt;
        entity.EndsAt = dto.EndsAt;
        ApplyTranslations(entity, dto);

        audit.Log("running_lines.update", "running_line", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.RunningLines.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.RunningLines.SingleOrDefaultAsync(r => r.Id == id);
        if (entity is null)
            return NotFound();

        db.RunningLines.Remove(entity);   // hard delete
        audit.Log("running_lines.delete", "running_line", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(RunningLine entity, RunningLineUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new RunningLineTranslation { Locale = locale, Text = tr.Text });
            else
                existing.Text = tr.Text;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(RunningLine r) => new
    {
        r.Id,
        r.IsActive,
        r.StartsAt,
        r.EndsAt,
        r.UpdatedAt,
        Translations = r.Translations.ToDictionary(t => t.Locale, t => new { t.Text }),
    };
}
