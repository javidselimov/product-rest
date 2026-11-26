namespace Cbar.WebApi.Controllers;

/// <summary>
/// Where a homepage strategy card goes and which cover it shows (spec 057), after the SQL projection. A plain function so
/// it is tested without a database.
/// </summary>
internal static class StrategyDocLinks
{
    /// <summary>
    /// The locale's url (an absolute URL or a site path, as stored), else <c>/&lt;slug&gt;</c> of the linked page in the locale,
    /// else null and the card is left out. <paramref name="pageSlug"/> is only set when the site shows the page in the locale.
    /// </summary>
    public static string? Href(string? url, string? pageSlug) =>
        !string.IsNullOrWhiteSpace(url) ? url.Trim()
        : !string.IsNullOrWhiteSpace(pageSlug) ? $"/{pageSlug}"
        : null;

    /// <summary>The locale's cover, else the other locale's; ids are only set when the media row exists.</summary>
    public static string? Cover(long? ownMediaId, long? otherMediaId) =>
        (ownMediaId ?? otherMediaId) is { } id ? $"/media/{id}" : null;
}
