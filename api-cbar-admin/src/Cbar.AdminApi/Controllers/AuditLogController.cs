using System.Text.Json;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

/// <summary>
/// Read side of <c>audit_log</c> (spec 008 US4): who changed what, and every refused attempt
/// (<c>authz.denied</c>). Filters combine with AND; <c>action</c> is a prefix.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Audit.Read)]
[Route("api/v1/audit-log")]
public class AuditLogController(CbarDbContext db) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? action,
        [FromQuery] int? actorId,
        [FromQuery] string? entityType,
        [FromQuery] long? entityId,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] PagingQuery paging)
    {
        // Ignore the users soft-delete filter: a deleted actor's name still belongs in the log.
        var query = db.AuditLog.IgnoreQueryFilters().AsNoTracking();
        if (!string.IsNullOrEmpty(action))
            query = query.Where(a => a.Action.StartsWith(action));
        if (actorId is not null)
            query = query.Where(a => a.ActorId == actorId);
        if (!string.IsNullOrEmpty(entityType))
            query = query.Where(a => a.EntityType == entityType);
        if (entityId is not null)
            query = query.Where(a => a.EntityId == entityId);
        // Npgsql writes only UTC offsets to timestamptz, so a +04:00 bound is converted first.
        if (from is not null)
        {
            var fromUtc = from.Value.ToUniversalTime();
            query = query.Where(a => a.CreatedAt >= fromUtc);
        }
        if (to is not null)
        {
            var toUtc = to.Value.ToUniversalTime();
            query = query.Where(a => a.CreatedAt < toUtc);
        }

        var w = paging.Resolve(50);
        var total = await query.CountAsync();
        var rows = await query
            .OrderByDescending(a => a.CreatedAt).ThenByDescending(a => a.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(a => new
            {
                a.Id,
                a.Action,
                a.ActorId,
                ActorUsername = a.Actor != null ? a.Actor.Username : null,
                a.EntityType,
                a.EntityId,
                a.Before,
                a.After,
                a.Ip,
                a.UserAgent,
                a.CreatedAt,
            })
            .ToListAsync();

        var items = rows.Select(a => new
        {
            a.Id,
            a.Action,
            a.ActorId,
            a.ActorUsername,
            a.EntityType,
            a.EntityId,
            Before = Json(a.Before),
            After = Json(a.After),
            Ip = a.Ip?.ToString(),
            a.UserAgent,
            a.CreatedAt,
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    private static JsonElement? Json(string? raw) =>
        raw is null ? null : JsonSerializer.Deserialize<JsonElement>(raw);
}
