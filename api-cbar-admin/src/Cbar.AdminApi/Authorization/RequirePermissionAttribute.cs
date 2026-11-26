using Microsoft.AspNetCore.Authorization;

namespace Cbar.AdminApi.Authorization;

/// <summary>
/// Requires one of the given permission codes (spec 008). Several codes mean any one of them
/// suffices. On a controller it applies to every action; on an action it applies on top of the
/// controller's, so a write needs both the module's <c>read</c> and its own code.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class RequirePermissionAttribute : AuthorizeAttribute
{
    public RequirePermissionAttribute(params string[] anyOf)
    {
        if (anyOf.Length == 0)
            throw new ArgumentException("At least one permission is required.", nameof(anyOf));
        AnyOf = anyOf;
        Policy = PermissionPolicyProvider.Prefix + string.Join('|', anyOf);
    }

    public IReadOnlyList<string> AnyOf { get; }
}

/// <summary>
/// Open to every authenticated user, with no permission code — the explicit opt-out from
/// <see cref="PermissionGuardFilter"/>. Only for data about the caller themself
/// (<c>GET /me/permissions</c>).
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
public sealed class AnyAuthenticatedUserAttribute : AuthorizeAttribute
{
}
