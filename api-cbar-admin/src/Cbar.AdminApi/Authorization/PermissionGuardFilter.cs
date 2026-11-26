using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Filters;

namespace Cbar.AdminApi.Authorization;

/// <summary>
/// Default-deny (spec 008 FR-001, research R3): an action behind <c>[Authorize]</c> that names no
/// permission is refused to everyone but admin, so a new endpoint without a
/// <see cref="RequirePermissionAttribute"/> fails closed instead of open. Actions with no
/// authorization metadata at all (the anonymous auth endpoints) are left alone.
/// <c>scripts/permission-inventory.mjs</c> finds such actions before a deploy does.
/// </summary>
public sealed class PermissionGuardFilter(PermissionChecker checker, ILogger<PermissionGuardFilter> logger)
    : IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var metadata = context.ActionDescriptor.EndpointMetadata;
        if (!metadata.OfType<IAuthorizeData>().Any())
            return;
        if (metadata.Any(m => m is RequirePermissionAttribute or AnyAuthenticatedUserAttribute or IAllowAnonymous))
            return;
        if (context.HttpContext.User.FindFirstValue(ClaimTypes.Role) == PermissionMatrix.AdminRole)
            return;

        logger.LogWarning("Action {Action} has no permission binding", context.ActionDescriptor.DisplayName);
        var (entityType, entityId) = AuthzAudit.TargetOf(context.HttpContext);
        context.Result = await checker.DenyAsync("unbound", entityType, entityId);
    }
}
