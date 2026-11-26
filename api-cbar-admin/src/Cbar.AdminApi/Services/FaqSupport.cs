using System.Text.RegularExpressions;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Rules of the three FAQ controllers (spec 051): field lengths and how a YouTube link gives its video id. The locale
/// list, the blank rich-text rule and the reorder check are shared with FinCERT, in <see cref="ContentSupport"/>.
/// </summary>
public static partial class FaqSupport
{
    public const int MaxNameLength = 255;
    public const int MaxQuestionLength = 1000;
    public const int MaxUrlLength = 500;

    /// <summary>Video id of a YouTube link (<c>watch?v=</c>, <c>youtu.be/</c>, <c>embed/</c>, <c>shorts/</c>, <c>live/</c>), or null.</summary>
    public static string? YoutubeId(string? url)
    {
        if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url.Trim(), UriKind.Absolute, out var uri))
            return null;
        var host = uri.Host.StartsWith("www.") ? uri.Host[4..] : uri.Host.StartsWith("m.") ? uri.Host[2..] : uri.Host;

        string? id = null;
        if (host == "youtu.be")
            id = uri.AbsolutePath.Trim('/').Split('/')[0];
        else if (host is "youtube.com" or "youtube-nocookie.com")
        {
            if (uri.AbsolutePath == "/watch")
                id = System.Web.HttpUtility.ParseQueryString(uri.Query)["v"];
            else if (PathId().Match(uri.AbsolutePath) is { Success: true } m)
                id = m.Groups[1].Value;
        }
        return id is not null && VideoId().IsMatch(id) ? id : null;
    }

    [GeneratedRegex(@"^/(?:embed|shorts|live|v)/([^/?]+)")]
    private static partial Regex PathId();

    [GeneratedRegex(@"^[\w-]{6,}$")]
    private static partial Regex VideoId();
}
