using System.Collections.Frozen;
using Cbar.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace Cbar.AdminApi.Authorization;

public record RoleSummary(short Id, string Code, string Name, IReadOnlyList<string> Permissions);

/// <summary>
/// Role → permission codes (spec 008, research R1–R2). The access token carries only the role;
/// this turns it into permissions. Spec 020 keeps the role claim current — a role change
/// rotates the security stamp — so permissions follow a role change on the next request.
/// </summary>
/// <remarks>
/// <c>admin</c> holds every code in <see cref="Permissions.All"/> in code, never from the
/// database, so a missing or forgotten <c>role_permissions</c> row cannot lock an admin out.
/// Other roles come from <c>role_permissions</c>, loaded in one query and kept for five
/// minutes: the matrix changes only through a migration, i.e. a deploy. Codes the database has
/// but the API does not know are dropped, so a stray row can grant nothing.
/// </remarks>
public sealed class PermissionMatrix(IServiceScopeFactory scopes, IMemoryCache cache, ILogger<PermissionMatrix> logger)
{
    public const string AdminRole = "admin";

    private const string CacheKey = "rbac:matrix";
    private static readonly TimeSpan Ttl = TimeSpan.FromMinutes(5);
    private static readonly FrozenSet<string> Catalog = Permissions.All.ToFrozenSet(StringComparer.Ordinal);
    private static readonly FrozenSet<string> None = FrozenSet<string>.Empty;

    /// <summary>The role's codes; empty for a missing or unknown role (it may sign in, but do nothing).</summary>
    public async Task<IReadOnlySet<string>> ForRoleAsync(string? roleCode)
    {
        if (string.IsNullOrEmpty(roleCode))
            return None;
        if (roleCode == AdminRole)
            return Catalog;
        var matrix = await LoadAsync();
        return matrix.TryGetValue(roleCode, out var codes) ? codes : None;
    }

    /// <summary>Every role by id, with its codes sorted ordinally (<c>GET /roles</c>).</summary>
    public async Task<IReadOnlyList<RoleSummary>> RolesAsync()
    {
        List<(short Id, string Code, string Name)> roles;
        await using (var scope = scopes.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<CbarDbContext>();
            roles = (await db.Roles.AsNoTracking()
                    .OrderBy(r => r.Id)
                    .Select(r => new { r.Id, r.Code, r.Name })
                    .ToListAsync())
                .Select(r => (r.Id, r.Code, r.Name))
                .ToList();
        }

        var result = new List<RoleSummary>(roles.Count);
        foreach (var role in roles)
        {
            var codes = await ForRoleAsync(role.Code);
            result.Add(new RoleSummary(role.Id, role.Code, role.Name, codes.Order(StringComparer.Ordinal).ToList()));
        }
        return result;
    }

    /// <summary>
    /// Startup check that every code the API knows is in the <c>permissions</c> table. A gap means
    /// migration 0009 (or a later one) was skipped: those codes then reach no role but admin. Logs,
    /// never throws — admin keeps working either way (spec FR-002).
    /// </summary>
    public async Task VerifyCatalogAsync(ILogger log)
    {
        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CbarDbContext>();
        var stored = (await db.Permissions.AsNoTracking().Select(p => p.Code).ToListAsync())
            .ToHashSet(StringComparer.Ordinal);

        var missing = Permissions.All.Where(c => !stored.Contains(c)).ToList();
        if (missing.Count > 0)
            log.LogError("Permission catalog: {Missing} codes missing in database: {Codes}",
                missing.Count, string.Join(", ", missing));
        log.LogInformation("Permission catalog: {Total} codes, {Missing} missing", Permissions.All.Count, missing.Count);
    }

    private async Task<IReadOnlyDictionary<string, FrozenSet<string>>> LoadAsync()
    {
        if (cache.TryGetValue(CacheKey, out IReadOnlyDictionary<string, FrozenSet<string>>? cached) && cached is not null)
            return cached;

        await using var scope = scopes.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<CbarDbContext>();
        var rows = await db.Roles.AsNoTracking()
            .Select(r => new { r.Code, Codes = r.Permissions.Select(p => p.Code).ToList() })
            .ToListAsync();

        var unknown = new SortedSet<string>(StringComparer.Ordinal);
        var matrix = new Dictionary<string, FrozenSet<string>>(StringComparer.Ordinal);
        foreach (var row in rows)
        {
            unknown.UnionWith(row.Codes.Where(c => !Catalog.Contains(c)));
            matrix[row.Code] = row.Codes.Where(Catalog.Contains).ToFrozenSet(StringComparer.Ordinal);
        }
        if (unknown.Count > 0)
            logger.LogWarning("role_permissions holds codes the API does not know, ignored: {Codes}", string.Join(", ", unknown));

        IReadOnlyDictionary<string, FrozenSet<string>> result = matrix;
        cache.Set(CacheKey, result, Ttl);
        return result;
    }
}
