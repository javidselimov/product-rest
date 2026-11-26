namespace Cbar.Domain.Entities;

/// <summary>
/// A series of monthly reports on the consumer rights pages (spec 052): the bank complaint index,
/// the insurance complaint index and the infographics. A fixed list seeded by migration 0034; the
/// APIs address a series by <see cref="Key"/>, which is the same in every environment.
/// </summary>
public class MonthlyReportSeries
{
    public short Id { get; set; }
    public string Key { get; set; } = null!;
    /// <summary>A report covers this many months ending with its own month (12 for the insurance index).</summary>
    public short PeriodMonths { get; set; } = 1;
    public short SortOrder { get; set; }
    public List<MonthlyReportSeriesTranslation> Translations { get; set; } = [];
}

public class MonthlyReportSeriesTranslation
{
    public int Id { get; set; }
    public short SeriesId { get; set; }
    public MonthlyReportSeries Series { get; set; } = null!;
    public string Locale { get; set; } = null!;
    /// <summary>With the period, the title of every report of the series.</summary>
    public string Name { get; set; } = null!;
}

/// <summary>
/// One month of a series. It has no title of its own; the site titles it with the series name and
/// the period. One report per series and month among the rows not deleted.
/// </summary>
public class MonthlyReport
{
    public int Id { get; set; }
    public short SeriesId { get; set; }
    public MonthlyReportSeries Series { get; set; } = null!;
    public short Year { get; set; }
    /// <summary>1–12.</summary>
    public short Month { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<MonthlyReportTranslation> Translations { get; set; } = [];
}

/// <summary>
/// The file of one locale. A locale without a row has no file, and the report does not show in it.
/// No navigation to <see cref="MediaAsset"/>: its query filter hides deleted files, which would drop
/// the row instead of letting the panel flag the missing file.
/// </summary>
public class MonthlyReportTranslation
{
    public long Id { get; set; }
    public int ReportId { get; set; }
    public MonthlyReport Report { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public long MediaId { get; set; }
}
