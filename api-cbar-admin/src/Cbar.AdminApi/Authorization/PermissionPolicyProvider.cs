using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

namespace Cbar.AdminApi.Authorization;

/// <summary>A policy's permission codes; met when the caller holds any one of them.</summary>
public sealed record PermissionRequirement(IReadOnlyList<string> AnyOf) : IAuthorizationRequirement;

/// <summary>
/// Builds the <c>perm:&lt;code&gt;|&lt;code&gt;</c> policies of <see cref="RequirePermissionAttribute"/> on
/// demand; every other policy name goes to the default provider.
/// </summary>
/// <remarks>
/// The policy names no authentication scheme on purpose: the default scheme has already run in
/// UseAuthentication, and naming it again would re-validate the token — and repeat spec 020's
/// security-stamp query — once more per request.
/// </remarks>
public sealed class PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : IAuthorizationPolicyProvider
{
    public const string Prefix = "perm:";

    private readonly DefaultAuthorizationPolicyProvider fallback = new(options);

    public Task<AuthorizationPolicy> GetDefaultPolicyAsync() => fallback.GetDefaultPolicyAsync();

    public Task<AuthorizationPolicy?> GetFallbackPolicyAsync() => fallback.GetFallbackPolicyAsync();

    public Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
    {
        if (!policyName.StartsWith(Prefix, StringComparison.Ordinal))
            return fallback.GetPolicyAsync(policyName);

        var codes = policyName[Prefix.Length..].Split('|', StringSplitOptions.RemoveEmptyEntries);
        var policy = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser()
            .AddRequirements(new PermissionRequirement(codes))
            .Build();
        return Task.FromResult<AuthorizationPolicy?>(policy);
    }
}

/// <summary>
/// Succeeds when the caller's role holds one of the requirement's codes. Otherwise it does
/// nothing, the result is Forbidden, and <see cref="AuditingAuthorizationResultHandler"/>
/// audits it and answers 403.
/// </summary>
public sealed class PermissionHandler(PermissionMatrix matrix, ILogger<PermissionHandler> logger)
    : AuthorizationHandler<PermissionRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context, PermissionRequirement requirement)
    {
        if (context.User.Identity?.IsAuthenticated != true)
            return;

        var role = context.User.FindFirstValue(ClaimTypes.Role);
        var granted = await matrix.ForRoleAsync(role);
        if (requirement.AnyOf.Any(granted.Contains))
        {
            context.Succeed(requirement);
            return;
        }

        logger.LogDebug("Role {Role} lacks {Permissions}", role, string.Join('|', requirement.AnyOf));
    }
}
