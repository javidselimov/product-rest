using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class MeasController(CbarDbContext db) : ControllerBase
{
    /// <summary>Paged list of published MEAS documents, newest registration date first.</summary>
    [HttpGet("api/v1/meas")]
    public async Task<IActionResult> GetList(
        [FromQuery] string locale = "az",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] int? emitentId = null,
        [FromQuery] int? infoTypeId = null)
    {
        // Clamped, not just floored: (page-1)*pageSize on a huge page overflows int
        // and Postgres rejects the resulting negative OFFSET.
        page = Math.Clamp(page, 1, 100_000);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = db.MeasDocuments.AsNoTracking()
            .Where(d => d.Status == ContentStatus.Published
                && (emitentId == null || d.EmitentId == emitentId)
                && (infoTypeId == null || d.InfoTypeId == infoTypeId));

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.RegDate).ThenByDescending(d => d.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(d => new
            {
                id = d.Id,
                regDate = d.RegDate,
                dqn = d.Dqn,
                emitentName = d.Emitent.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
                infoTypeName = d.InfoType.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
                fileUrl = d.MediaId == null ? null : $"/media/{d.MediaId}",
            })
            .ToListAsync();

        return Ok(new { items, total, page, pageSize });
    }

    /// <summary>Active MEAS emitents for a locale.</summary>
    [HttpGet("api/v1/meas-emitents")]
    public async Task<IActionResult> GetEmitents([FromQuery] string locale = "az")
    {
        var items = await db.MeasEmitents.AsNoTracking()
            .Where(e => e.IsActive && e.Translations.Any(t => t.Locale == locale))
            .OrderBy(e => e.Id)
            .Select(e => new
            {
                id = e.Id,
                name = e.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Active MEAS info types for a locale.</summary>
    [HttpGet("api/v1/meas-info-types")]
    public async Task<IActionResult> GetInfoTypes([FromQuery] string locale = "az")
    {
        var items = await db.MeasInfoTypes.AsNoTracking()
            .Where(it => it.IsActive && it.Translations.Any(t => t.Locale == locale))
            .OrderBy(it => it.Id)
            .Select(it => new
            {
                id = it.Id,
                name = it.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(items);
    }
}
