using System.Text.RegularExpressions;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Rules shared by the content sections that keep a translated, ordered list (FAQ — spec 051, FinCERT — spec 053): the
/// supported locales, what counts as an empty rich-text field, and the "exactly this set" check of the reorder endpoints.
/// Messages are Azerbaijani: the panel shows <c>message</c> to the editor as it is.
/// </summary>
public static partial class ContentSupport
{
    public static readonly string[] Locales = ["az", "en"];

    /// <summary>
    /// A rich-text field is empty when it has no text and no embedded content: the editor saves an untouched field as
    /// <c>&lt;p&gt;&lt;/p&gt;</c>, which must not count as a filled language.
    /// </summary>
    public static bool IsBlankHtml(string? html)
    {
        if (string.IsNullOrWhiteSpace(html))
            return true;
        if (EmbeddedContent().IsMatch(html))
            return false;
        var text = Tags().Replace(html, " ").Replace("&nbsp;", " ");
        return string.IsNullOrWhiteSpace(text);
    }

    /// <summary>Null when <paramref name="ids"/> is exactly <paramref name="current"/> in some order, else the editor's message.</summary>
    public static string? InvalidOrder(IReadOnlyCollection<int> ids, IReadOnlyCollection<int> current) =>
        ids.Count == current.Count && ids.Distinct().Count() == ids.Count && ids.ToHashSet().SetEquals(current)
            ? null
            : "Sıra siyahısı bütün elementləri bir dəfə saxlamalıdır. Səhifəni yeniləyib yenidən cəhd edin.";

    /// <summary>
    /// The link rule wherever an editor types a link (image popups, release schedule, homepage strategy documents):
    /// an absolute <c>http(s)://</c> URL or a site path. A protocol-relative <c>//host</c> is refused, since it would leave
    /// the site while looking like a path, and so is any other scheme, e.g. <c>javascript:</c>.
    /// </summary>
    public static bool IsAllowedLink(string link) =>
        link.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
        || link.StartsWith("https://", StringComparison.OrdinalIgnoreCase)
        || (link.StartsWith('/') && !link.StartsWith("//"));

    [GeneratedRegex(@"<(img|table|iframe|video|audio)\b", RegexOptions.IgnoreCase)]
    private static partial Regex EmbeddedContent();

    [GeneratedRegex(@"<[^>]+>")]
    private static partial Regex Tags();
}
