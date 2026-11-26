using System.Globalization;
using System.Text.RegularExpressions;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// Working papers of the "Nəşrlər və tədqiqatlar" section (spec 054). The list carries every paper of the
/// locale with no paging and no search: there are a few papers a year, and the site filters them, folding
/// Azerbaijani letters (İ/ı) that Postgres does not fold. A paper is addressed by its number and year
/// (<c>02-2025</c>), the same in both locales.
/// </summary>
[ApiController]
public partial class WorkingPapersController(CbarDbContext db) : ControllerBase
{
    /// <summary>
    /// The <c>WorkingPaperListItem</c> schema. <see cref="WorkingPaperDetail"/> extends it, as the spec's
    /// <c>WorkingPaper</c> is <c>allOf: WorkingPaperListItem</c>, so a new list field reaches both responses.
    /// </summary>
    internal record WorkingPaperListItem(
        int Id, short Number, short Year, string Language, string Title, List<string> Authors, List<string> Keywords)
    {
        public string Title { get; } = Title.Trim();

        /// <summary><c>NN/YYYY</c>, as the site shows it.</summary>
        public string Code => FormatCode(Number, Year);

        /// <summary><c>NN-YYYY</c>, the address key of the item route.</summary>
        public string Key => FormatKey(Number, Year);
    }

    /// <summary>The <c>WorkingPaper</c> schema: a list item with its abstract, JEL codes and the locale's PDF.</summary>
    internal sealed record WorkingPaperDetail(
        int Id, short Number, short Year, string Language, string Title, List<string> Authors, List<string> Keywords,
        string? Abstract, List<string> JelCodes, WorkingPaperFile? File)
        : WorkingPaperListItem(Id, Number, Year, Language, Title, Authors, Keywords)
    {
        public string? Abstract { get; } = string.IsNullOrWhiteSpace(Abstract) ? null : Abstract.Trim();
    }

    /// <summary>The <c>AssetFile</c> schema.</summary>
    internal sealed record WorkingPaperFile(long MediaId, string OriginalName, string MimeType, long SizeBytes)
    {
        public string Url => $"/media/{MediaId}";
    }

    /// <summary>Published papers with a title in the locale, newest year first, then highest number.</summary>
    [HttpGet("api/v1/working-papers")]
    public async Task<IActionResult> GetList([FromQuery] string locale = "az", CancellationToken cancellationToken = default)
    {
        locale = NormalizeLocale(locale);
        var items = await Visible(locale)
            .OrderByDescending(t => t.Paper.Year).ThenByDescending(t => t.Paper.Number).ThenBy(t => t.PaperId)
            .Select(t => new WorkingPaperListItem(
                t.Paper.Id, t.Paper.Number, t.Paper.Year, t.Paper.PaperLanguage, t.Title!, t.Authors, t.Keywords))
            .ToListAsync(cancellationToken);
        return Ok(new { items });
    }

    /// <summary>One paper in the locale; 404 for a malformed key or a paper not visible in the locale.</summary>
    [HttpGet("api/v1/working-papers/{key}")]
    public async Task<IActionResult> GetItem(
        string key, [FromQuery] string locale = "az", CancellationToken cancellationToken = default)
    {
        locale = NormalizeLocale(locale);
        if (!TryParseKey(key, out var number, out var year))
            return NotFound();

        var row = await Visible(locale)
            .Where(t => t.Paper.Number == number && t.Paper.Year == year)
            .Select(t => new
            {
                Paper = new WorkingPaperDetail(
                    t.Paper.Id, t.Paper.Number, t.Paper.Year, t.Paper.PaperLanguage, t.Title!, t.Authors, t.Keywords,
                    t.Abstract, t.Paper.JelCodes, null),
                t.MediaId,
            })
            .FirstOrDefaultAsync(cancellationToken);
        if (row is null)
            return NotFound();

        // The media query filter hides deleted files, so a deleted PDF leaves the paper without a card.
        var file = row.MediaId is { } mediaId
            ? await db.MediaAssets.AsNoTracking()
                .Where(m => m.Id == mediaId)
                .Select(m => new WorkingPaperFile(m.Id, m.OriginalName, m.MimeType, m.SizeBytes))
                .FirstOrDefaultAsync(cancellationToken)
            : null;

        return Ok(row.Paper with { File = file });
    }

    /// <summary>
    /// Reads a <c>NN-YYYY</c> key. Only ASCII digits match: <c>\d</c> would also accept other Unicode digits
    /// (<c>٠٢-٢٠٢٥</c>), which <see cref="short.Parse(string, IFormatProvider)"/> rejects with an exception.
    /// The pattern ends in <c>\z</c>, not <c>$</c>, which also matches before a trailing line break.
    /// </summary>
    internal static bool TryParseKey(string key, out short number, out short year)
    {
        var match = KeyPattern().Match(key);
        if (!match.Success)
        {
            number = year = 0;
            return false;
        }

        number = short.Parse(match.Groups[1].ValueSpan, CultureInfo.InvariantCulture);
        year = short.Parse(match.Groups[2].ValueSpan, CultureInfo.InvariantCulture);
        return true;
    }

    internal static string FormatCode(short number, short year) => $"{number:00}/{year}";

    internal static string FormatKey(short number, short year) => $"{number:00}-{year}";

    /// <summary>Translations of published, not deleted papers that have a title in the locale.</summary>
    private IQueryable<WorkingPaperTranslation> Visible(string locale) =>
        db.WorkingPaperTranslations.AsNoTracking()
            .Where(t => t.Locale == locale
                && t.Title != null && t.Title.Trim() != ""
                && t.Paper.Status == ContentStatus.Published
                && t.Paper.DeletedAt == null);

    private static string NormalizeLocale(string locale) => locale == "en" ? "en" : "az";

    [GeneratedRegex(@"\A([0-9]{2})-([0-9]{4})\z")]
    private static partial Regex KeyPattern();
}
