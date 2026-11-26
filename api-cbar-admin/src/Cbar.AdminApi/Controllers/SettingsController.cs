using System.Security.Claims;
using System.Text.Json;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record SettingUpsertDto(JsonElement Value);

[ApiController]
[RequirePermission(Permissions.Settings.Read)]
[Route("api/v1/settings")]
public class SettingsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.Settings.AsNoTracking()
            .OrderBy(s => s.Key)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDto) });
    }

    [HttpGet("{key}")]
    public async Task<IActionResult> Get(string key)
    {
        var item = await db.Settings.AsNoTracking().SingleOrDefaultAsync(s => s.Key == key);
        return item is null ? NotFound() : Ok(ToDto(item));
    }

    [HttpPut("{key}")]
    [RequirePermission(Permissions.Settings.Update)]
    public async Task<IActionResult> Upsert(string key, SettingUpsertDto dto)
    {
        if (dto.Value.ValueKind == JsonValueKind.Undefined)
            return BadRequestProblem("Value is required.");

        var raw = dto.Value.GetRawText();
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        var updatedBy = int.TryParse(sub, out var uid) ? uid : (int?)null;

        var entity = await db.Settings.SingleOrDefaultAsync(s => s.Key == key);
        // Only known keys may be created; stored ones stay editable (spec 008 FR-020).
        if (entity is null && !KnownSettings.Keys.Contains(key))
            return BadRequestProblem($"Unknown setting key '{key}'.");
        if (entity is null)
        {
            entity = new Setting { Key = key, Value = raw, UpdatedBy = updatedBy };
            db.Settings.Add(entity);
            audit.Log("settings.create", "setting", 0, after: new { key, value = dto.Value });
        }
        else
        {
            var before = new { key, value = JsonSerializer.Deserialize<JsonElement>(entity.Value) };
            entity.Value = raw;
            entity.UpdatedBy = updatedBy;
            audit.Log("settings.update", "setting", 0, before, new { key, value = dto.Value });
        }

        await db.SaveChangesAsync();
        return Ok(ToDto(entity));
    }

    // Removes any stored key, known or not, so a key that can no longer be created can still
    // be cleaned up (spec 008 FR-020).
    [HttpDelete("{key}")]
    [RequirePermission(Permissions.Settings.Delete)]
    public async Task<IActionResult> Delete(string key)
    {
        var entity = await db.Settings.SingleOrDefaultAsync(s => s.Key == key);
        if (entity is null)
            return NotFoundProblem("Setting not found.");

        audit.Log("settings.delete", "setting", 0,
            before: new { key, value = JsonSerializer.Deserialize<JsonElement>(entity.Value) });
        db.Settings.Remove(entity);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static object ToDto(Setting s) => new
    {
        s.Key,
        Value = JsonSerializer.Deserialize<JsonElement>(s.Value),
        s.UpdatedAt,
    };
}
