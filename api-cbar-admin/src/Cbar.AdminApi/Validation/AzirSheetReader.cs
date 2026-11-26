using System.Globalization;
using System.Text.RegularExpressions;

namespace Cbar.AdminApi.Validation;

/// <summary>A workbook the AZIR import refuses; <see cref="Code"/> is the problem's <c>code</c>.</summary>
internal sealed class AzirSheetException(
    string code, string message, int? row = null, string? column = null, DateOnly? valueDate = null) : Exception(message)
{
    public string Code { get; } = code;
    public int? Row { get; } = row;
    public string? Column { get; } = column;
    public DateOnly? ValueDate { get; } = valueDate;
}

/// <summary>One tenor of the file, ready to be written. Deal details are only ever set on 1D.</summary>
internal sealed record AzirSheetTerm(
    int Row, string Term, decimal Rate, bool IsReservePlan,
    decimal? DealVolume, int? DealCount, decimal? MinRate, decimal? MaxRate);

/// <summary>A recognised row that is not written: <c>tfai</c> or <c>empty</c>.</summary>
internal sealed record AzirSkippedRow(int Row, string Name, string Reason);

internal sealed record AzirSheet(
    DateOnly ValueDate, IReadOnlyList<AzirSheetTerm> Terms, IReadOnlyList<AzirSkippedRow> Skipped, bool VolumeConverted);

/// <summary>
/// Reads the bank's daily "AZIR Website" workbook (spec 058, data-model §1). The date is <c>B2</c>; the
/// table follows the header row (<c>Ad</c> | <c>Faiz</c> | volume | count) and its rows are matched by
/// name, not position. Rates are fractions in the file (cells formatted as percent) and come out × 100,
/// rounded like the legacy importers. Pure function: nothing is stored, every rule is checked before
/// the controller writes anything.
/// </summary>
internal static class AzirSheetReader
{
    public const string DateMissing = "date_missing";
    public const string DateInFuture = "date_in_future";
    public const string HeaderMissing = "header_missing";
    public const string UnknownIndex = "unknown_index";
    public const string DuplicateIndex = "duplicate_index";
    public const string Missing1D = "missing_1d";
    public const string InvalidValue = "invalid_value";
    public const string AmbiguousVolume = "ambiguous_volume";

    public const string SkippedTfai = "tfai";
    public const string SkippedEmpty = "empty";

    /// <summary>A volume up to this is already in millions of manat (the largest legacy day was 1295.56).</summary>
    public const decimal MlnVolumeMax = 10_000m;

    /// <summary>A volume from this up is in manat and is divided by <see cref="ManatPerMln"/>.</summary>
    public const decimal ManatVolumeMin = 1_000_000m;

    public const decimal ManatPerMln = 1_000_000m;

    // The database bounds (spec 021): numeric(8,4) rates, numeric(12,2) volume.
    private const decimal RateLimit = 10_000m;
    private const decimal VolumeLimit = 10_000_000_000m;
    private const int RateDecimals = 4;
    private const int VolumeDecimals = 2;
    private const decimal Percent = 100m;

    private const int FirstRow = 1;
    private const int LastRow = 200;
    private const int DateRow = 2;
    private const int ColB = 2, ColC = 3, ColD = 4, ColE = 5;
    private static readonly HashSet<int> Columns = [ColB, ColC, ColD, ColE];

    /// <summary>Excel's 1900 date system: serial 1 is 1900-01-01, counted from 1899-12-30 for the leap-year bug.</summary>
    private static readonly DateOnly ExcelEpoch = new(1899, 12, 30);
    private const int MaxExcelSerial = 2_958_465; // 9999-12-31

    private const string Dash = "-";
    private const string MinKey = "LAST MIN RATE";
    private const string MaxKey = "LAST MAX RATE";
    private const string TfaiKey = "AZIR TFAI";
    private const string OneDay = "1D";

    /// <summary>Normalised name → tenor.</summary>
    private static readonly Dictionary<string, string> Tenors = new()
    {
        ["AZIR"] = OneDay,
        ["1D AZIR"] = OneDay,
        ["TF AZIR 30D"] = "30D",
        ["TF AZIR 90D"] = "90D",
        ["TF AZIR 180D"] = "180D",
    };

    private static readonly Regex Spaces = new(@"\s+", RegexOptions.Compiled);

    /// <summary>Throws <see cref="XlsxReadException"/> (not a workbook) or <see cref="AzirSheetException"/>.</summary>
    public static AzirSheet Read(Stream xlsx, DateOnly today)
    {
        var rows = XlsxSheetReader.Read(xlsx, FirstRow, LastRow, Columns);

        var valueDate = ReadDate(rows.FirstOrDefault(r => r.Row == DateRow)?[ColB]);
        if (valueDate > today)
            throw new AzirSheetException(DateInFuture, $"Cell B{DateRow}: the date {valueDate:yyyy-MM-dd} is in the future.",
                DateRow, "B", valueDate);

        var header = rows.FirstOrDefault(r => Normalize(r[ColB]?.Value) == "AD" && Normalize(r[ColC]?.Value) == "FAIZ")
                     ?? throw new AzirSheetException(HeaderMissing, "The sheet has no header row with \"Ad\" in B and \"Faiz\" in C.");

        var seen = new HashSet<string>();
        var tenors = new List<(XlsxRow Row, string Term, bool Reserve)>();
        var skipped = new List<AzirSkippedRow>();
        XlsxRow? minRow = null, maxRow = null;

        foreach (var row in rows.Where(r => r.Row > header.Row))
        {
            var raw = row[ColB]?.Value?.Trim();
            if (string.IsNullOrEmpty(raw) || raw.StartsWith('*'))
                continue;

            var reserve = raw.Contains('*');
            var name = Normalize(raw.Replace("*", string.Empty));
            var key = Tenors.TryGetValue(name, out var term) ? term : name;

            if (key is not (MinKey or MaxKey or TfaiKey) && term is null)
                throw new AzirSheetException(UnknownIndex, $"Cell B{row.Row}: unknown index \"{raw}\".", row.Row, "B");
            if (!seen.Add(key))
                throw new AzirSheetException(DuplicateIndex, $"Cell B{row.Row}: \"{raw}\" appears more than once.", row.Row, "B");

            switch (key)
            {
                case MinKey: minRow = row; break;
                case MaxKey: maxRow = row; break;
                case TfaiKey: skipped.Add(new AzirSkippedRow(row.Row, raw, SkippedTfai)); break;
                default: tenors.Add((row, term!, reserve)); break;
            }
        }

        var oneDay = tenors.FirstOrDefault(t => t.Term == OneDay);
        if (oneDay.Row is null)
            throw new AzirSheetException(Missing1D, "The sheet has no 1D AZIR row.");
        if (ReadPercent(oneDay.Row, ColC) is not { } oneDayRate || oneDayRate == 0)
            throw new AzirSheetException(Missing1D, $"Cell C{oneDay.Row.Row}: the 1D AZIR rate is missing.", oneDay.Row.Row, "C");

        var minRate = ZeroAsNull(minRow is null ? null : ReadPercent(minRow, ColC));
        var maxRate = ZeroAsNull(maxRow is null ? null : ReadPercent(maxRow, ColC));
        if (minRate is { } min && maxRate is { } max && min > max)
            throw Invalid(minRow!.Row, ColC, "the minimum rate is above the maximum rate");

        var (volume, converted) = ReadVolume(oneDay.Row);
        var count = ReadCount(oneDay.Row);

        var terms = new List<AzirSheetTerm>();
        foreach (var (row, term, reserve) in tenors)
        {
            if (term == OneDay)
            {
                terms.Add(new AzirSheetTerm(row.Row, term, oneDayRate, reserve, volume, count, minRate, maxRate));
                continue;
            }

            var rate = ReadPercent(row, ColC);
            if (rate is null or 0)
            {
                skipped.Add(new AzirSkippedRow(row.Row, row[ColB]!.Value!.Trim(), SkippedEmpty));
                continue;
            }
            terms.Add(new AzirSheetTerm(row.Row, term, rate.Value, reserve, null, null, null, null));
        }

        return new AzirSheet(valueDate, terms, skipped.OrderBy(s => s.Row).ToList(), converted);
    }

    /// <summary><c>B2</c>: an Excel date serial, or <c>dd.MM.yyyy</c> text.</summary>
    private static DateOnly ReadDate(XlsxCell? cell)
    {
        if (cell is { IsNumeric: true }
            && decimal.TryParse(cell.Value, NumberStyles.Float, CultureInfo.InvariantCulture, out var serial)
            && serial is >= 1 and <= MaxExcelSerial)
            return ExcelEpoch.AddDays((int)decimal.Truncate(serial));

        if (cell is { IsNumeric: false }
            && DateOnly.TryParseExact(cell.Value?.Trim(), "dd.MM.yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date))
            return date;

        throw new AzirSheetException(DateMissing, $"Cell B{DateRow}: no date.", DateRow, "B");
    }

    /// <summary>A percent cell × 100 at 4 decimals; null when blank or <c>-</c>.</summary>
    private static decimal? ReadPercent(XlsxRow row, int column)
    {
        var fraction = ReadNumber(row, column);
        if (fraction is null)
            return null;

        var rate = XlsxSheetReader.NormalizeNumber((fraction.Value * Percent).ToString(CultureInfo.InvariantCulture), RateDecimals);
        if (rate is not { } value || value < 0 || value >= RateLimit)
            throw Invalid(row.Row, column, "the rate must be zero or positive and below 10000 %");
        return value;
    }

    /// <summary>The 1D deal volume in millions of manat; the flag says it was given in manat.</summary>
    private static (decimal? Volume, bool Converted) ReadVolume(XlsxRow row)
    {
        if (ReadNumber(row, ColD) is not { } value)
            return (null, false);
        if (value < 0)
            throw Invalid(row.Row, ColD, "the deal volume must be zero or positive");

        if (value <= MlnVolumeMax)
            return (Round(value, VolumeDecimals), false);
        if (value < ManatVolumeMin)
            throw new AzirSheetException(AmbiguousVolume,
                $"Cell D{row.Row}: the deal volume {value.ToString(CultureInfo.InvariantCulture)} is neither millions of manat (up to 10000) nor manat (from 1000000).",
                row.Row, "D");

        var millions = Round(value / ManatPerMln, VolumeDecimals);
        if (millions >= VolumeLimit)
            throw Invalid(row.Row, ColD, "the deal volume is too large");
        return (millions, true);
    }

    private static int? ReadCount(XlsxRow row)
    {
        if (ReadNumber(row, ColE) is not { } value)
            return null;
        if (value < 0 || value != decimal.Truncate(value) || value > int.MaxValue)
            throw Invalid(row.Row, ColE, "the deal count must be a whole number, zero or positive");
        return (int)value;
    }

    /// <summary>A numeric cell's value; null when the cell is blank or <c>-</c>; any other text is refused.</summary>
    private static decimal? ReadNumber(XlsxRow row, int column)
    {
        var cell = row[column];
        var text = cell?.Value?.Trim();
        if (string.IsNullOrEmpty(text))
            return null;
        if (!cell!.IsNumeric)
        {
            if (text == Dash)
                return null;
            throw Invalid(row.Row, column, $"\"{text}\" is not a number");
        }
        if (!decimal.TryParse(text, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
            throw Invalid(row.Row, column, $"\"{text}\" is not a number");
        return value;
    }

    private static decimal Round(decimal value, int decimals) =>
        XlsxSheetReader.NormalizeNumber(value.ToString(CultureInfo.InvariantCulture), decimals) ?? value;

    private static decimal? ZeroAsNull(decimal? value) => value is 0 ? null : value;

    private static string Normalize(string? value) =>
        Spaces.Replace(value ?? string.Empty, " ").Trim().ToUpperInvariant();

    private static AzirSheetException Invalid(int row, int column, string what)
    {
        var name = XlsxSheetReader.ColumnName(column);
        return new AzirSheetException(InvalidValue, $"Cell {name}{row}: {what}.", row, name);
    }
}
