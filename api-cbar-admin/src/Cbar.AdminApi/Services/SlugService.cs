using Cbar.Domain;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Services;

/// <summary>
/// Slug generation that respects the <c>(locale, slug)</c> UNIQUE index every
/// translation table carries. Titles repeat routinely (recurring announcements,
/// section names), so a bare <see cref="Slug.From"/> would throw a unique-index
/// violation on the second one.
/// </summary>
public static class UniqueSlug
{
    /// <param name="slugsInLocale">
    /// Slugs already taken in the target locale, excluding the row being updated.
    /// Include soft-deleted rows — they keep their slug and still occupy the index.
    /// </param>
    public static async Task<string> ForAsync(IQueryable<string> slugsInLocale, string title)
    {
        var baseSlug = Slug.From(title);
        if (string.IsNullOrEmpty(baseSlug))
            baseSlug = "n";   // title was punctuation-only; keep the URL well-formed

        var taken = await slugsInLocale
            .Where(s => s == baseSlug || s.StartsWith(baseSlug + "-"))
            .ToListAsync();

        if (!taken.Contains(baseSlug))
            return baseSlug;
        for (var n = 2; ; n++)
        {
            var candidate = $"{baseSlug}-{n}";
            if (!taken.Contains(candidate))
                return candidate;
        }
    }
}
