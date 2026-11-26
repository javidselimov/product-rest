namespace Cbar.AdminApi.Validation;

/// <summary>
/// Builds <c>ILIKE</c> patterns from text the editor typed, so <c>%</c>, <c>_</c> and <c>\</c> match themselves instead
/// of acting as wildcards. Use with the same escape character: <c>EF.Functions.ILike(column, pattern, LikePattern.Escape)</c>.
/// </summary>
public static class LikePattern
{
    public const string Escape = "\\";

    /// <summary>Longest search text a list endpoint accepts; longer input is refused with a 400.</summary>
    public const int MaxSearchLength = 200;

    /// <summary>A pattern that matches <paramref name="text"/> anywhere in the value (<c>%text%</c>), metacharacters escaped.</summary>
    public static string Contains(string text) =>
        $"%{text.Replace(Escape, Escape + Escape).Replace("%", Escape + "%").Replace("_", Escape + "_")}%";

    /// <summary>The editor's message when <paramref name="search"/> is longer than <see cref="MaxSearchLength"/>, else null.</summary>
    public static string? TooLong(string? search) =>
        search?.Length > MaxSearchLength ? $"Axtarış mətni ən çox {MaxSearchLength} simvol ola bilər." : null;
}
