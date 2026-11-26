using System.Text.RegularExpressions;

namespace Cbar.AdminApi.Validation;

/// <summary>A bulletin the reader refuses; <see cref="Code"/> is the problem's <c>code</c>.</summary>
public sealed class RateBulletinException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

/// <summary>
/// One line of the bulletin whose column <c>B</c> is a three-letter code (trimmed, upper-cased).
/// <paramref name="RawValue"/> is column <c>G</c> as stored in the file; <paramref name="IsNumeric"/>
/// is false when that cell is text, a boolean, an error or missing.
/// </summary>
public sealed record BulletinRow(int Row, string Code, string? RawValue, bool IsNumeric);

/// <summary>
/// Reads the official rate bulletin (.xlsx) the way the legacy importer did (spec 025,
/// <c>product-host/admin/behaviors/UploadCurrencyBehavior.php</c>): the active sheet's
/// <c>B7:G100</c>, column <c>B</c> the code, column <c>G</c> the rate. Every other cell — the
/// title, the nominal in <c>A</c>, the bulletin's own date in <c>C2</c>, the signature — is ignored.
/// The workbook itself is read by <see cref="XlsxSheetReader"/>. Pure functions, nothing is stored.
/// </summary>
public static partial class RateBulletinReader
{
    public const int FirstRow = 7;
    public const int LastRow = 100;

    public const long MaxPartBytes = XlsxSheetReader.MaxPartBytes;

    public const string NotXlsx = XlsxSheetReader.NotXlsx;
    public const string FileTooLarge = XlsxSheetReader.FileTooLarge;

    private const int CodeColumn = 2;   // B
    private const int RateColumn = 7;   // G
    private static readonly HashSet<int> Columns = [CodeColumn, RateColumn];

    [GeneratedRegex("^[A-Z]{3}$")]
    private static partial Regex CodePattern();

    /// <summary>The bulletin's code lines in sheet order. Throws <see cref="RateBulletinException"/>.</summary>
    public static IReadOnlyList<BulletinRow> Read(Stream xlsx)
    {
        IReadOnlyList<XlsxRow> rows;
        try
        {
            rows = XlsxSheetReader.Read(xlsx, FirstRow, LastRow, Columns);
        }
        catch (XlsxReadException e)
        {
            throw new RateBulletinException(e.Code, e.Message);
        }

        var lines = new List<BulletinRow>();
        foreach (var row in rows)
        {
            var normalized = row[CodeColumn]?.Value?.Trim().ToUpperInvariant();
            if (normalized is null || !CodePattern().IsMatch(normalized))
                continue;
            var rate = row[RateColumn];
            lines.Add(new BulletinRow(row.Row, normalized, rate?.Value, rate?.IsNumeric ?? false));
        }
        return lines;
    }

    /// <summary>A rate as the legacy importer stored it: <see cref="XlsxSheetReader.NormalizeNumber"/> to 4 decimals.</summary>
    public static decimal? NormalizeRate(string? raw) => XlsxSheetReader.NormalizeNumber(raw, 4);
}
