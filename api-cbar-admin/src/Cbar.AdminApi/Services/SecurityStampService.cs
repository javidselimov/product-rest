using System.Security.Claims;
using Cbar.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Access token revocation (spec 020). Every access token carries the user's security
/// stamp in the <see cref="ClaimType"/> claim, and every protected request compares it with
/// the one in <c>admin_user_security_stamps</c>. Deactivation, deletion, a password reset
/// and a role change rotate the stamp, so tokens issued before them stop working at once.
/// No cache: one query per request (research R6).
/// Never log the token, the claim value or the stamp.
/// </summary>
public class SecurityStampService(CbarDbContext db, ILogger<SecurityStampService> logger)
{
    public const string ClaimType = "sst";

    /// <summary>
    /// The user's current stamp, creating the row on first use (login, refresh). Rows are
    /// lazy, with no backfill; ON CONFLICT lets two concurrent first logins both succeed.
    /// </summary>
    public async Task<Guid> GetOrCreateAsync(int userId)
    {
        await db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO admin_user_security_stamps (user_id, stamp, changed_at) VALUES ({userId}, {Guid.NewGuid()}, now()) ON CONFLICT (user_id) DO NOTHING");

        return await db.UserSecurityStamps.AsNoTracking()
            .Where(s => s.UserId == userId)
            .Select(s => s.Stamp)
            .SingleAsync();
    }

    /// <summary>
    /// Gives the user a new stamp, invalidating every access token issued so far. One upsert,
    /// so a user without a row yet gets one. Call it in the same transaction as the user
    /// change that causes it: ExecuteSql enlists in EF's current transaction, so a rolled-back
    /// change leaves the stamp — and the user's tokens — as they were.
    /// </summary>
    public Task RotateAsync(int userId) =>
        db.Database.ExecuteSqlInterpolatedAsync(
            $"INSERT INTO admin_user_security_stamps (user_id, stamp, changed_at) VALUES ({userId}, {Guid.NewGuid()}, now()) ON CONFLICT (user_id) DO UPDATE SET stamp = excluded.stamp, changed_at = excluded.changed_at");

    /// <summary>
    /// Checks a token whose signature and lifetime are already valid. Returns null to accept,
    /// otherwise the rejection reason (data-model §4). The lock (<c>LockedUntil</c>) is not
    /// checked here; refresh already refuses a locked account.
    /// </summary>
    public async Task<string?> ValidateAsync(ClaimsPrincipal principal)
    {
        var sub = principal.FindFirstValue(ClaimTypes.NameIdentifier) ?? principal.FindFirstValue("sub");
        if (!int.TryParse(sub, out var userId))
            return Reject(null, "user_missing");

        if (!Guid.TryParse(principal.FindFirstValue(ClaimType), out var stamp))
            return Reject(userId, "stamp_missing");

        // One query: soft-deleted users are read too, so their rejection is logged as
        // user_deleted rather than user_missing. A missing stamp row reads as null.
        var row = await db.Users.IgnoreQueryFilters().AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.IsActive,
                u.DeletedAt,
                Stamp = db.UserSecurityStamps
                    .Where(s => s.UserId == u.Id)
                    .Select(s => (Guid?)s.Stamp)
                    .FirstOrDefault(),
            })
            .SingleOrDefaultAsync();

        if (row is null)
            return Reject(userId, "user_missing");
        if (row.DeletedAt is not null)
            return Reject(userId, "user_deleted");
        if (!row.IsActive)
            return Reject(userId, "user_inactive");
        if (row.Stamp != stamp)
            return Reject(userId, "stamp_mismatch");
        return null;
    }

    // A stale stamp is expected right after a deploy or a role change, so it stays at
    // Information; a token of a missing, deleted or inactive user is worth a Warning (R8).
    private string Reject(int? userId, string reason)
    {
        var level = reason is "stamp_missing" or "stamp_mismatch" ? LogLevel.Information : LogLevel.Warning;
        logger.Log(level, "Access token rejected for user {UserId}: {Reason}", userId, reason);
        return reason;
    }
}
