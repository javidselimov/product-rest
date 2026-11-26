using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Cbar.AdminApi.Controllers;

public record LoginRequest(string Username, string Password);
public record LoginResponse(string AccessToken, DateTimeOffset ExpiresAt);

/// <summary>
/// The access token (15 min) goes back in the body and lives in the panel's memory;
/// the refresh token goes into an httpOnly cookie scoped to this controller's path.
/// Contract: specs/005-admin-persistent-session/contracts/auth-api.md.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController(
    CbarDbContext db,
    IConfiguration config,
    RefreshTokenService refreshTokens,
    SecurityStampService stamps,
    AuditService audit,
    LoginProtection loginProtection,
    ILogger<AuthController> logger)
    : CbarControllerBase
{
    // TODO(Phase 2): TOTP 2FA, escalating lockouts, session binding,
    // QRadar CEF emitter — acceptance criteria in reports/02 §2.3.
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        // Before the database and before bcrypt: a flood for one username costs nothing.
        if (!loginProtection.TryAcquire(request.Username, out var retryAfter))
        {
            var safeUsername = request.Username?.Replace("\r", "").Replace("\n", "") ?? string.Empty;
            logger.LogWarning("Login rate limit hit for {Username} from {Ip}",
                safeUsername, HttpContext.Connection.RemoteIpAddress);
            Response.Headers.RetryAfter = Math.Max(1, (int)Math.Ceiling(retryAfter.TotalSeconds)).ToString();
            return ErrorProblem(StatusCodes.Status429TooManyRequests, "Too many login attempts. Try again later.");
        }

        var user = await db.Users
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Username == request.Username && u.IsActive);
        var locked = user?.LockedUntil > DateTimeOffset.UtcNow;

        // Verify even when no user matched (unknown, inactive or soft-deleted) and when the
        // account is locked, discarding the result, so neither the response nor its timing
        // reveals whether the username exists, whether it is locked, or whether the
        // password was right.
        var verified = BCrypt.Net.BCrypt.Verify(request.Password, user?.PasswordHash ?? PasswordHashing.DummyHash);
        if (user is null || locked || !verified)
        {
            // A locked account does not count further failures, so attempts cannot extend the lock.
            if (user is not null && !locked)
                await RecordFailureAsync(user);
            var safeFailureUsername = request.Username?.Replace("\r", "").Replace("\n", "") ?? string.Empty;
            logger.LogWarning("Login failure for {Username} from {Ip}",
                safeFailureUsername, HttpContext.Connection.RemoteIpAddress);
            return ErrorProblem(StatusCodes.Status401Unauthorized, "Invalid credentials.");
        }

        user.FailedLogins = 0;
        user.LockedUntil = null;

        var (refreshToken, refreshExpiresAt) = await refreshTokens.IssueAsync(user.Id);
        audit.Log("auth.login", "user", user.Id, actorId: user.Id);
        await db.SaveChangesAsync();
        var accessToken = await CreateAccessTokenAsync(user);
        refreshTokens.WriteCookie(refreshToken, refreshExpiresAt);

        logger.LogInformation("Login success for {Username}", user.Username);
        return accessToken;
    }

    /// <summary>
    /// Counts a wrong password in one atomic statement, so parallel attempts cannot lose
    /// increments (spec 012 research R2). A failure more than <see cref="LoginProtection.FailureWindow"/>
    /// after the previous one, or after an expired lock, starts a new series at 1. The
    /// series is repeated inside <c>locked_until</c> because SET cannot see its own results.
    /// Plain ADO rather than <c>SqlQuery</c>: EF must not wrap the UPDATE in a subquery,
    /// and columns are read by position so the snake-case convention cannot misname them.
    /// <para>
    /// No column of its own for the last failure: a deployed database's migration role need
    /// not own <c>users</c>, so this feature avoids <c>ALTER TABLE</c>. While a series is open
    /// (1..max-1 failures) the account is unlocked, so <c>locked_until</c> carries the last
    /// failure instead, moved <see cref="LoginProtection.FailureMarkerOffset"/> into the past
    /// so it can never read as a lock — every reader treats only a future value as locked,
    /// and the offset absorbs clock skew between the pod and the database. A real lock is
    /// told apart by <c>failed_logins</c> having reached the maximum.
    /// </para>
    /// </summary>
    private async Task RecordFailureAsync(User user)
    {
        const string sql = """
            UPDATE users SET
                failed_logins = CASE
                    WHEN failed_logins BETWEEN 1 AND @max - 1 AND locked_until >= now() - @offset - @window
                    THEN failed_logins + 1 ELSE 1 END,
                locked_until = CASE
                    WHEN (CASE
                        WHEN failed_logins BETWEEN 1 AND @max - 1 AND locked_until >= now() - @offset - @window
                        THEN failed_logins + 1 ELSE 1 END) >= @max
                    THEN now() + @lock ELSE now() - @offset END
            WHERE id = @id AND (locked_until IS NULL OR locked_until <= now())
            RETURNING failed_logins, locked_until
            """;

        await db.Database.OpenConnectionAsync();
        try
        {
            await using var cmd = db.Database.GetDbConnection().CreateCommand();
            cmd.CommandText = sql;
            AddParameter(cmd, "window", LoginProtection.FailureWindow);
            AddParameter(cmd, "offset", LoginProtection.FailureMarkerOffset);
            AddParameter(cmd, "lock", LoginProtection.LockDuration);
            AddParameter(cmd, "max", LoginProtection.MaxFailedLogins);
            AddParameter(cmd, "id", user.Id);

            await using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync() && reader.GetInt16(0) >= LoginProtection.MaxFailedLogins)
            {
                logger.LogWarning("Account {Username} locked until {LockedUntil} after {FailedLogins} failures from {Ip}",
                    user.Username, reader.GetFieldValue<DateTimeOffset>(1), reader.GetInt16(0),
                    HttpContext.Connection.RemoteIpAddress);
            }
        }
        finally
        {
            await db.Database.CloseConnectionAsync();
        }
    }

    private static void AddParameter(System.Data.Common.DbCommand cmd, string name, object value)
    {
        var parameter = cmd.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        cmd.Parameters.Add(parameter);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<LoginResponse>> Refresh()
    {
        if (!refreshTokens.IsOriginAllowed())
            return Problem403();

        if (refreshTokens.ReadCookie() is not { } presented)
            return Rejected("refresh_missing");

        switch (await refreshTokens.RotateAsync(presented))
        {
            case RotateResult.Success ok:
                var accessToken = await CreateAccessTokenAsync(ok.User);
                refreshTokens.WriteCookie(ok.RawToken, ok.ExpiresAt);
                return accessToken;

            case RotateResult.Failure { Code: "refresh_stale" }:
                // Another tab rotated this cookie a moment ago; the browser already
                // holds the new one, so keep it and let the panel retry.
                return Rejected("refresh_stale");

            case RotateResult.Failure fail:
                refreshTokens.ClearCookie();
                return Rejected(fail.Code);

            default:
                throw new InvalidOperationException("Unknown rotate result.");
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        if (!refreshTokens.IsOriginAllowed())
            return Problem403();

        if (refreshTokens.ReadCookie() is { } presented
            && await refreshTokens.RevokeFamilyAsync(presented) is { } userId)
        {
            audit.Log("auth.logout", "user", userId, actorId: userId);
            await db.SaveChangesAsync();
        }

        refreshTokens.ClearCookie();
        return NoContent();   // idempotent: unknown or missing cookie is still a successful logout
    }

    private async Task<LoginResponse> CreateAccessTokenAsync(User user)
    {
        // Stamp first, role second (spec 020): a role change committed in between rotates
        // the stamp, so the token carries a stale stamp and dies on its first request,
        // rather than an old role with a fresh stamp living for 15 minutes.
        var stamp = await stamps.GetOrCreateAsync(user.Id);
        var role = await db.Users.AsNoTracking()
            .Where(u => u.Id == user.Id)
            .Select(u => u.Role.Code)
            .SingleAsync();

        var jwt = config.GetSection("Jwt");
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(jwt.GetValue("AccessTokenMinutes", 15));
        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims:
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.PreferredUsername, user.Username),
                new Claim(ClaimTypes.Role, role),
                new Claim(SecurityStampService.ClaimType, stamp.ToString()),
            ],
            expires: expiresAt.UtcDateTime,
            signingCredentials: new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["SigningKey"]!)),
                SecurityAlgorithms.HmacSha256));

        return new LoginResponse(new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    private ObjectResult Problem403() =>
        ErrorProblem(StatusCodes.Status403Forbidden, "Origin not allowed.", "origin_forbidden");

    private ObjectResult Rejected(string code) =>
        ErrorProblem(StatusCodes.Status401Unauthorized, "Session expired.", code);
}
