using System.Security.Claims;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Infrastructure;

namespace Cbar.AdminApi.Authorization;

/// <summary>
/// Permission checks that depend on the data, made inside an action: a page subtree delete,
/// deleting someone else's media (spec 008 US3). The attribute has already let the request in.
/// </summary>
public sealed class PermissionChecker(
    IHttpContextAccessor httpContextAccessor,
    PermissionMatrix matrix,
    IServiceScopeFactory scopes,
    ProblemDetailsFactory problemDetails,
    ILogger<PermissionChecker> logger)
{
    public async Task<bool> HasAsync(string code)
    {
        var role = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
        return (await matrix.ForRoleAsync(role)).Contains(code);
    }

    /// <summary>
    /// Audits the refusal and returns the 403 to answer with — the same body as an attribute's
    /// refusal: no <c>title</c>, no <c>message</c>. Call it before changing any entity: the audit
    /// row is saved through its own scope, so the caller's tracked changes are never flushed with
    /// it, but they would still be saved by a later SaveChanges of the caller.
    /// </summary>
    public async Task<ObjectResult> DenyAsync(string code, string entityType, long entityId)
    {
        var http = httpContextAccessor.HttpContext!;
        await AuthzAudit.WriteDeniedAsync(scopes, http, code, entityType, entityId, logger);

        var pd = problemDetails.CreateProblemDetails(http, StatusCodes.Status403Forbidden);
        return new ObjectResult(pd) { StatusCode = StatusCodes.Status403Forbidden, ContentTypes = { "application/problem+json" } };
    }
}

/// <summary>Writes <c>authz.denied</c> audit rows (spec 008 FR-004, research R4).</summary>
internal static class AuthzAudit
{
    /// <summary>
    /// One audit row through a scope of its own, so it never saves anything the request had
    /// tracked. A failure to audit is logged and swallowed: the refusal must stay a 403.
    /// </summary>
    public static async Task WriteDeniedAsync(
        IServiceScopeFactory scopes, HttpContext http, string permission, string entityType, long entityId, ILogger logger)
    {
        var path = http.Request.Path.Value;
        logger.LogWarning("Permission {Permission} refused for user {UserId} on {Method} {Path}",
            permission, http.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? http.User.FindFirstValue("sub"),
            http.Request.Method, path);
        try
        {
            await using var scope = scopes.CreateAsyncScope();
            var audit = scope.ServiceProvider.GetRequiredService<AuditService>();
            var db = scope.ServiceProvider.GetRequiredService<CbarDbContext>();
            audit.Log("authz.denied", entityType, entityId,
                after: new { permission, method = http.Request.Method, path });
            await db.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Could not audit the refusal of {Permission} on {Path}", permission, path);
        }
    }

    /// <summary>
    /// The audited target of a request: the first path segment after <c>/api/v1/</c> in snake
    /// case (<c>currency-rates</c> → <c>currency_rates</c>) and the <c>{id}</c> route value, else 0.
    /// </summary>
    public static (string EntityType, long EntityId) TargetOf(HttpContext http)
    {
        const string prefix = "/api/v1/";
        var path = http.Request.Path.Value ?? "";
        var resource = path.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? path[prefix.Length..].Split('/', 2)[0].Replace('-', '_')
            : path.Trim('/');
        var id = http.Request.RouteValues.TryGetValue("id", out var raw) && long.TryParse(raw?.ToString(), out var parsed)
            ? parsed
            : 0;
        return (resource, id);
    }
}
