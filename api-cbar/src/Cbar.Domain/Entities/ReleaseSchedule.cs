namespace Cbar.Domain.Entities;

/// <summary>What the timing cell of a release schedule item does (spec 039).</summary>
public enum ReleaseTimingMode : short
{
    /// <summary>Plain text.</summary>
    Text = 1,
    /// <summary>The text links to <see cref="ReleaseScheduleItem.TimingUrl"/>.</summary>
    Link = 2,
    /// <summary>The text opens the monetary policy decisions dialog, built from events of type 1.</summary>
    Decisions = 3,
}

/// <summary>
/// A row of the information disclosure schedule (spec 039): a kind of information, how often it is
/// published and by when. The site shows the rows as one table on a Media page, so a row has no slug.
/// </summary>
public class ReleaseScheduleItem
{
    public int Id { get; set; }
    public int GroupId { get; set; }
    public ReleaseScheduleGroup Group { get; set; } = null!;
    public int? PeriodicityId { get; set; }
    public ReleaseSchedulePeriodicity? Periodicity { get; set; }
    public ReleaseTimingMode TimingMode { get; set; } = ReleaseTimingMode.Text;
    /// <summary>Set only in <see cref="ReleaseTimingMode.Link"/>; a CHECK constraint keeps the two in step.</summary>
    public string? TimingUrl { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public bool ShowAz { get; set; } = true;
    public bool ShowEn { get; set; } = true;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<ReleaseScheduleItemTranslation> Translations { get; set; } = [];
}

public class ReleaseScheduleItemTranslation
{
    public long Id { get; set; }
    public int ItemId { get; set; }
    public ReleaseScheduleItem Item { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    /// <summary>"By when", for example "Up to the 20th day of the following month".</summary>
    public string? Timing { get; set; }
}

/// <summary>A section heading of the schedule table, for example "Monetary and exchange rate policy".</summary>
public class ReleaseScheduleGroup
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<ReleaseScheduleGroupTranslation> Translations { get; set; } = [];
}

public class ReleaseScheduleGroupTranslation
{
    public long Id { get; set; }
    public int GroupId { get; set; }
    public ReleaseScheduleGroup Group { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

/// <summary>A value of the managed periodicity list, for example "Monthly".</summary>
public class ReleaseSchedulePeriodicity
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<ReleaseSchedulePeriodicityTranslation> Translations { get; set; } = [];
}

public class ReleaseSchedulePeriodicityTranslation
{
    public long Id { get; set; }
    public int PeriodicityId { get; set; }
    public ReleaseSchedulePeriodicity Periodicity { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}
