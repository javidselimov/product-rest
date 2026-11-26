using System.Text.RegularExpressions;
using Cbar.AdminApi.Validation;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Rules shared by the three FinCERT controllers (spec 053). The reorder check, the locale list and the blank rich-text
/// rule are shared with the FAQ (<see cref="ContentSupport"/>): the panel treats both sections the same way. Messages are
/// Azerbaijani: the panel shows <c>message</c> and <c>errors</c> to the editor as they are.
/// </summary>
public static partial class FincertSupport
{
    public const int MaxEmailLength = 255;
    public const int MaxPhoneLength = 64;
    public const int MaxUrlLength = 500;
    public const int MaxTitleLength = 500;
    public const int MaxNameLength = 255;
    public const int MaxDescriptionLength = 1000;
    public const int MaxBadgeLength = 120;

    public static bool IsWebUrl(string url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    public static bool IsEmail(string value) => Email().IsMatch(value);

    /// <summary>Trimmed text, or null for null and whitespace.</summary>
    public static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex Email();
}
