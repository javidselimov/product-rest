using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;

namespace Cbar.AdminApi.Authorization;

/// <summary>
/// Audits every permission refusal of an authenticated caller as <c>authz.denied</c> (spec 008
/// FR-004), then lets the default handler answer. A 401 (no, expired or revoked token) passes
/// through untouched: it is not a refusal of a known user.
/// </summary>
public sealed class AuditingAuthorizationResultHandler(
    IServiceScopeFactory scopes, ILogger<AuditingAuthorizationResultHandler> logger)
    : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler inner = new();

    public async Task HandleAsync(
        RequestDelegate next, HttpContext context, AuthorizationPolicy policy, PolicyAuthorizationResult authorizeResult)
    {
        if (authorizeResult.Forbidden && context.User.Identity?.IsAuthenticated == true)
        {
            var failed = authorizeResult.AuthorizationFailure?.FailedRequirements.OfType<PermissionRequirement>().FirstOrDefault()
                ?? policy.Requirements.OfType<PermissionRequirement>().FirstOrDefault();
            if (failed is not null)
            {
                var (entityType, entityId) = AuthzAudit.TargetOf(context);
                await AuthzAudit.WriteDeniedAsync(scopes, context, string.Join('|', failed.AnyOf), entityType, entityId, logger);
            }
        }

        await inner.HandleAsync(next, context, policy, authorizeResult);
    }
}
