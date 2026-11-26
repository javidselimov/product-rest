using System.Threading.RateLimiting;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Brute-force limits for <c>POST /auth/login</c> (spec 012). Two layers: the account
/// lock (<see cref="MaxFailedLogins"/> wrong passwords less than <see cref="FailureWindow"/>
/// apart lock the account for <see cref="LockDuration"/>) lives in the database, so it
/// holds across pods; the per-username attempt limit lives here, in memory, so it is per
/// pod. The limit is keyed by the username in the request body, which the rate-limiting
/// middleware cannot see — login calls <see cref="TryAcquire"/> itself, before touching
/// the database. A per-IP limit waits for forwarded headers (review #5).
/// </summary>
public sealed class LoginProtection : IDisposable
{
    public const int MaxFailedLogins = 5;
    public static readonly TimeSpan FailureWindow = TimeSpan.FromMinutes(10);
    public static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(15);
    /// <summary>
    /// How far into the past the last failure is written to <c>locked_until</c> while a
    /// series is open, so it is never mistaken for a lock (see <c>AuthController</c>).
    /// </summary>
    public static readonly TimeSpan FailureMarkerOffset = TimeSpan.FromDays(1);

    public const int AttemptsPerUsername = 10;
    public static readonly TimeSpan AttemptWindow = TimeSpan.FromSeconds(120);
    private const int Segments = 12;
    private const int MaxKeyLength = 256;

    private readonly PartitionedRateLimiter<string> _limiter =
        PartitionedRateLimiter.Create<string, string>(key =>
            RateLimitPartition.GetSlidingWindowLimiter(key, _ => new SlidingWindowRateLimiterOptions
            {
                PermitLimit = AttemptsPerUsername,
                Window = AttemptWindow,
                SegmentsPerWindow = Segments,
                QueueLimit = 0,
                AutoReplenishment = true,
            }));

    /// <summary>
    /// Usernames are citext, so "Admin", " admin " and "admin" must share one window —
    /// otherwise changing the case would reset the limit.
    /// </summary>
    public static string NormalizeKey(string? username)
    {
        var key = (username ?? "").Trim().ToLowerInvariant();
        return key.Length > MaxKeyLength ? key[..MaxKeyLength] : key;
    }

    public bool TryAcquire(string? username, out TimeSpan retryAfter)
    {
        using var lease = _limiter.AttemptAcquire(NormalizeKey(username));
        if (lease.IsAcquired)
        {
            retryAfter = TimeSpan.Zero;
            return true;
        }

        retryAfter = lease.TryGetMetadata(MetadataName.RetryAfter, out var ra)
            ? ra
            : AttemptWindow / Segments;
        return false;
    }

    public void Dispose() => _limiter.Dispose();
}
