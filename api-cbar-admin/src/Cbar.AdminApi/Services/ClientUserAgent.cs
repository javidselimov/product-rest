namespace Cbar.AdminApi.Services;

/// <summary>
/// The client's User-Agent, cut to the column it is stored in. Audit entries are
/// saved in the caller's transaction, so an over-long header would otherwise fail
/// the save it describes — login included. The cut never splits a surrogate pair,
/// so what is stored is always valid text.
/// </summary>
public static class ClientUserAgent
{
    /// <summary><c>audit_log.user_agent</c> and <c>admin_refresh_tokens.user_agent</c> are <c>varchar(500)</c>.</summary>
    public const int MaxLength = 500;

    public static string? From(HttpContext? http)
    {
        if (http is null) return null;
        var ua = http.Request.Headers.UserAgent.ToString();
        if (ua.Length <= MaxLength) return ua;
        var cut = char.IsHighSurrogate(ua[MaxLength - 1]) ? MaxLength - 1 : MaxLength;
        return ua[..cut];
    }
}
