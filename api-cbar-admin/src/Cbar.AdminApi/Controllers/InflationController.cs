using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record InflationUpsertDto(short Year, short Month, string ParameterCode, decimal Value);

public record InflationSettingsDto(decimal CurrentInflation, string TargetInflation, DateOnly NextUpdateDate);

[ApiController]
[RequirePermission(Permissions.Inflation.Read)]
[Route("api/v1/inflation")]
public class InflationController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] short? year = null)
    {
        var query = db.MonthlyInflationParameters.AsNoTracking();
        if (year is not null)
            query = query.Where(p => p.Year == year);

        var items = await query
            .OrderByDescending(p => p.Year).ThenByDescending(p => p.Month).ThenBy(p => p.ParameterCode)
            .Select(p => new { p.Id, p.Year, p.Month, p.ParameterCode, p.Value, p.UpdatedAt })
            .ToListAsync();

        return Ok(items);
    }

    [HttpPost]
    [RequirePermission(Permissions.Inflation.Create)]
    public async Task<IActionResult> Upsert(InflationUpsertDto dto)
    {
        if (dto.Month is < 1 or > 12)
            return BadRequestProblem("Month must be between 1 and 12.");
        if (string.IsNullOrWhiteSpace(dto.ParameterCode))
            return BadRequestProblem("Parameter code is required.");

        var entity = await db.MonthlyInflationParameters.SingleOrDefaultAsync(p =>
            p.Year == dto.Year && p.Month == dto.Month && p.ParameterCode == dto.ParameterCode);

        if (entity is null)
        {
            entity = new MonthlyInflationParameter
            {
                Year = dto.Year,
                Month = dto.Month,
                ParameterCode = dto.ParameterCode,
                Value = dto.Value,
            };
            await using var tx = await db.Database.BeginTransactionAsync();
            db.MonthlyInflationParameters.Add(entity);
            await db.SaveChangesAsync();
            audit.Log("inflation.create", "monthly_inflation_parameter", entity.Id, after: dto);
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        else
        {
            var before = new { entity.Year, entity.Month, entity.ParameterCode, entity.Value };
            entity.Value = dto.Value;
            audit.Log("inflation.update", "monthly_inflation_parameter", entity.Id, before, dto);
            await db.SaveChangesAsync();
        }

        return Ok(new { entity.Id, entity.Year, entity.Month, entity.ParameterCode, entity.Value });
    }

    /// <summary>Homepage summary (legacy "Aylıq inflyasiya parametrləri"); null until first saved.</summary>
    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var item = await db.InflationSettings.AsNoTracking()
            .Select(s => new { s.CurrentInflation, s.TargetInflation, s.NextUpdateDate, s.UpdatedAt })
            .SingleOrDefaultAsync();

        return Ok(item);
    }

    [HttpPut("settings")]
    [RequirePermission(Permissions.Inflation.Update)]
    public async Task<IActionResult> SaveSettings(InflationSettingsDto dto)
    {
        var target = dto.TargetInflation?.Trim();
        if (string.IsNullOrEmpty(target))
            return BadRequestProblem("Target inflation is required.");
        if (target.Length > 255)
            return BadRequestProblem("Target inflation must be at most 255 characters.");
        if (dto.CurrentInflation is <= -10000 or >= 10000)
            return BadRequestProblem("Current inflation is out of range.");

        var entity = await db.InflationSettings.SingleOrDefaultAsync();
        if (entity is null)
        {
            entity = new InflationSetting
            {
                CurrentInflation = dto.CurrentInflation,
                TargetInflation = target,
                NextUpdateDate = dto.NextUpdateDate,
            };
            db.InflationSettings.Add(entity);
            audit.Log("inflation.settings.create", "inflation_settings", entity.Id, after: dto);
        }
        else
        {
            var before = new { entity.CurrentInflation, entity.TargetInflation, entity.NextUpdateDate };
            entity.CurrentInflation = dto.CurrentInflation;
            entity.TargetInflation = target;
            entity.NextUpdateDate = dto.NextUpdateDate;
            audit.Log("inflation.settings.update", "inflation_settings", entity.Id, before, dto);
        }

        await db.SaveChangesAsync();
        return Ok(new { entity.CurrentInflation, entity.TargetInflation, entity.NextUpdateDate, entity.UpdatedAt });
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Inflation.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MonthlyInflationParameters.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        db.MonthlyInflationParameters.Remove(entity);
        audit.Log("inflation.delete", "monthly_inflation_parameter", id,
            before: new { entity.Year, entity.Month, entity.ParameterCode, entity.Value });
        await db.SaveChangesAsync();
        return NoContent();
    }
}
