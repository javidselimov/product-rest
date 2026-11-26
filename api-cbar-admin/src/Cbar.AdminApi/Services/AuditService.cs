using System.Security.Claims;
using System.Text.Json;
using Cbar.Domain;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Services;

public class AuditService(CbarDbContext db, IHttpContextAccessor httpContextAccessor)
{
    /// <summary>Queues an audit entry; saved with the caller's SaveChangesAsync.</summary>
    /// <param name="actorId">Overrides the actor taken from the bearer token — for the
    /// anonymous auth endpoints (login/refresh/logout), where there is no bearer.</param>
    public void Log(string action, string entityType, long entityId, object? before = null, object? after = null,
        int? actorId = null)
    {
        var http = httpContextAccessor.HttpContext;
        var sub = http?.User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? http?.User.FindFirstValue("sub");

        db.AuditLog.Add(new AuditLogEntry
        {
            ActorId = actorId ?? (int.TryParse(sub, out var id) ? id : null),
            Action = action,
            EntityType = entityType,
            EntityId = entityId,
            Before = before is null ? null : JsonSerializer.Serialize(before),
            After = after is null ? null : JsonSerializer.Serialize(after),
            Ip = http?.Connection.RemoteIpAddress,
            UserAgent = ClientUserAgent.From(http),
        });
        // TODO(Phase 2 hardening): mirror to QRadar via CEF/syslog emitter.
    }
}
