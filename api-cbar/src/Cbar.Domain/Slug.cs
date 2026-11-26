using System.Text;
using System.Text.RegularExpressions;

namespace Cbar.Domain;

public static partial class Slug
{
    private static readonly Dictionary<char, string> AzMap = new()
    {
        ['ə'] = "e", ['Ə'] = "e", ['ı'] = "i", ['İ'] = "i", ['ö'] = "o", ['Ö'] = "o",
        ['ü'] = "u", ['Ü'] = "u", ['ş'] = "s", ['Ş'] = "s", ['ç'] = "c", ['Ç'] = "c",
        ['ğ'] = "g", ['Ğ'] = "g",
    };

    /// <summary>Transliterates Azerbaijani characters and produces a URL-safe slug.</summary>
    public static string From(string title, int maxLength = 200)
    {
        var sb = new StringBuilder(title.Length);
        foreach (var ch in title)
            sb.Append(AzMap.TryGetValue(ch, out var mapped) ? mapped : char.ToLowerInvariant(ch));

        var slug = NonAlphanumeric().Replace(sb.ToString(), "-").Trim('-');
        slug = Dashes().Replace(slug, "-");
        return slug.Length <= maxLength ? slug : slug[..maxLength].TrimEnd('-');
    }

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex NonAlphanumeric();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex Dashes();
}
