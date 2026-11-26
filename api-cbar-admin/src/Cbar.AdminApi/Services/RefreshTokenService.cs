using System.Security.Cryptography;
using System.Text;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Services;

public abstract record RotateResult
{
    public sealed record Success(User User, string RawToken, DateTimeOffset ExpiresAt) : RotateResult;
    public sealed record Failure(string Code) : RotateResult;
}

/// <summary>
/// Refresh tokens for the admin panel (spec 005). The raw value only ever travels in the
/// httpOnly cookie; the database keeps its SHA-256. Each login starts a family, each
/// refresh rotates within it, and presenting an already-rotated token after the grace
/// window revokes the whole family (theft signal).
/// Never log the raw value or its hash.
/// </summary>
public class RefreshTokenService(
    CbarDbContext db,
    IConfiguration config,
    IHttpContextAccessor httpContextAccessor,
    AuditService audit,
    ILogger<RefreshTokenService> logger)
{
    private const string CookiePath = "/api/v1/auth";

    private HttpContext Http => httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException("RefreshTokenService needs an HTTP request.");

    private TimeSpan IdleLifetime => TimeSpan.FromHours(config.GetValue("Jwt:RefreshIdleHours", 8));
    private TimeSpan AbsoluteLifetime => TimeSpan.FromDays(config.GetValue("Jwt:RefreshAbsoluteDays", 7));
    private TimeSpan ReuseGrace => TimeSpan.FromSeconds(config.GetValue("Auth:RefreshReuseGraceSeconds", 30));
    private string CookieName => config["Auth:RefreshCookie:Name"] ?? "cbar_admin_rt";
    private bool CookieSecure => config.GetValue("Auth:RefreshCookie:Secure", true);

    /// <summary>
    /// Starts a new family for a fresh login and prunes the user's dead rows.
    /// Queues the insert — the caller's SaveChangesAsync persists it.
    /// </summary>
    public async Task<(string RawToken, DateTimeOffset ExpiresAt)> IssueAsync(int userId)
    {
        var now = DateTimeOffset.UtcNow;
        var expiredBefore = now.AddDays(-1);
        var revokedBefore = now.AddDays(-7);
        await db.RefreshTokens
            .Where(t => t.UserId == userId && (t.ExpiresAt < expiredBefore || t.RevokedAt < revokedBefore))
            .ExecuteDeleteAsync();

        var raw = NewRawToken();
        var row = NewRow(userId, raw, Guid.NewGuid(), now, now);
        db.RefreshTokens.Add(row);
        return (raw, row.ExpiresAt);
    }

    /// <summary>Validates the presented token and swaps it for a new one in the same family.</summary>
    public async Task<RotateResult> RotateAsync(string rawToken) => await RotateAsync(rawToken, retried: false);

    private async Task<RotateResult> RotateAsync(string rawToken, bool retried)
    {
        var now = DateTimeOffset.UtcNow;
        var hash = Hash(rawToken);
        // The user query filter would otherwise drop tokens of soft-deleted users,
        // which must fail as user_inactive rather than refresh_invalid.
        var row = await db.RefreshTokens.IgnoreQueryFilters()
            .Include(t => t.User).ThenInclude(u => u.Role)
            .SingleOrDefaultAsync(t => t.TokenHash == hash);

        if (row is null)
            return Fail("refresh_invalid", null);

        if (row.ReplacedById is not null)
        {
            // Two tabs racing on the same cookie land here too; only a late replay is theft.
            if (row.RevokedAt is { } rotatedAt && now - rotatedAt <= ReuseGrace)
                return Fail("refresh_stale", row.UserId);

            await RevokeFamilyByIdAsync(row.FamilyId, now);
            audit.Log("auth.refresh_reuse", "user", row.UserId, after: new { familyId = row.FamilyId },
                actorId: row.UserId);
            await db.SaveChangesAsync();
            return Fail("refresh_reused", row.UserId);
        }

        if (row.RevokedAt is not null || row.ExpiresAt <= now)
            return Fail("refresh_expired", row.UserId);

        var user = row.User;
        if (!user.IsActive || user.DeletedAt is not null || user.LockedUntil > now)
        {
            await RevokeFamilyByIdAsync(row.FamilyId, now);
            return Fail("user_inactive", row.UserId);
        }

        var raw = NewRawToken();
        var next = NewRow(user.Id, raw, row.FamilyId, row.FamilyCreatedAt, now);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.RefreshTokens.Add(next);
        await db.SaveChangesAsync();

        // Guarded update: of two concurrent rotations of the same row only one wins.
        var rotated = await db.RefreshTokens
            .Where(t => t.Id == row.Id && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAt, now)
                .SetProperty(t => t.ReplacedById, (long?)next.Id));

        if (rotated == 0)
        {
            await tx.RollbackAsync();
            db.ChangeTracker.Clear();
            // Re-read the row as the winner left it; it now takes the stale/expired path.
            return retried ? Fail("refresh_stale", row.UserId) : await RotateAsync(rawToken, retried: true);
        }

        await tx.CommitAsync();
        logger.LogDebug("Refresh rotated for user {UserId}", user.Id);
        return new RotateResult.Success(user, raw, next.ExpiresAt);
    }

    /// <summary>Revokes the family of the presented token. Returns its user id, if the token was known.</summary>
    public async Task<int?> RevokeFamilyAsync(string rawToken)
    {
        var hash = Hash(rawToken);
        var row = await db.RefreshTokens.AsNoTracking()
            .SingleOrDefaultAsync(t => t.TokenHash == hash);
        if (row is null)
            return null;

        await RevokeFamilyByIdAsync(row.FamilyId, DateTimeOffset.UtcNow);
        return row.UserId;
    }

    /// <summary>Ends every session of a user — deactivation, password reset, deletion.</summary>
    public Task RevokeAllForUserAsync(int userId)
    {
        var now = DateTimeOffset.UtcNow;
        return db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));
    }

    public string? ReadCookie() =>
        Http.Request.Cookies.TryGetValue(CookieName, out var value) && !string.IsNullOrEmpty(value)
            ? value
            : null;

    public void WriteCookie(string rawToken, DateTimeOffset expiresAt)
    {
        var options = CookieOptions();
        options.MaxAge = expiresAt - DateTimeOffset.UtcNow;
        Http.Response.Cookies.Append(CookieName, rawToken, options);
    }

    public void ClearCookie() => Http.Response.Cookies.Delete(CookieName, CookieOptions());

    /// <summary>
    /// CSRF guard for the cookie-authenticated endpoints, on top of SameSite=Strict:
    /// a browser request from a foreign page carries its Origin. No Origin (curl,
    /// same-origin GET) is allowed — the cookie itself is still required.
    /// </summary>
    public bool IsOriginAllowed()
    {
        var origin = Http.Request.Headers.Origin.ToString();
        if (string.IsNullOrEmpty(origin))
            return true;
        var allowed = config.GetSection("Cors:Origins").Get<string[]>() ?? [];
        return allowed.Contains(origin, StringComparer.OrdinalIgnoreCase);
    }

    private CookieOptions CookieOptions() => new()
    {
        HttpOnly = true,
        Secure = CookieSecure,
        SameSite = SameSiteMode.Strict,
        Path = CookiePath,
        IsEssential = true,
    };

    private RefreshToken NewRow(int userId, string raw, Guid familyId, DateTimeOffset familyCreatedAt,
        DateTimeOffset now)
    {
        var idle = now + IdleLifetime;
        var absolute = familyCreatedAt + AbsoluteLifetime;
        return new RefreshToken
        {
            UserId = userId,
            TokenHash = Hash(raw),
            FamilyId = familyId,
            FamilyCreatedAt = familyCreatedAt,
            ExpiresAt = idle < absolute ? idle : absolute,
            Ip = Http.Connection.RemoteIpAddress,
            UserAgent = ClientUserAgent.From(Http),
        };
    }

    private Task RevokeFamilyByIdAsync(Guid familyId, DateTimeOffset now) =>
        db.RefreshTokens
            .Where(t => t.FamilyId == familyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));

    private RotateResult Fail(string code, int? userId)
    {
        logger.LogWarning("Refresh rejected ({Code}) for user {UserId} from {Ip}",
            code, userId, Http.Connection.RemoteIpAddress);
        return new RotateResult.Failure(code);
    }

    private static string NewRawToken() => Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    private static string Hash(string raw) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));

    private static string Base64UrlEncode(byte[] bytes) =>
        Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
