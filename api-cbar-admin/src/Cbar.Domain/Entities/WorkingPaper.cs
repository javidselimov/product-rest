namespace Cbar.Domain.Entities;

/// <summary>
/// A working paper of the "Nəşrlər və tədqiqatlar" section (spec 054). Addressed on the site by
/// number and year (<c>02-2025</c>); one paper per number and year among the rows not deleted.
/// </summary>
public class WorkingPaper
{
    public int Id { get; set; }
    /// <summary>Position within the year, 1–99: "02" in "02/2025".</summary>
    public short Number { get; set; }
    public short Year { get; set; }
    /// <summary>The language the paper is written in: <c>az</c>, <c>en</c> or <c>other</c> — not a site locale.</summary>
    public string PaperLanguage { get; set; } = "en";
    /// <summary>JEL classification codes, e.g. <c>E58</c> (text[]).</summary>
    public List<string> JelCodes { get; set; } = [];
    /// <summary>The legacy site's page id (<c>page-&lt;id&gt;/…</c>); set by the migration seed.</summary>
    public int? LegacyPageId { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<WorkingPaperTranslation> Translations { get; set; } = [];
}

/// <summary>
/// The paper in one locale. The paper shows in a locale only when its title there is filled. No
/// navigation to <see cref="MediaAsset"/>: its query filter hides deleted files, which would drop the
/// row instead of letting the panel flag the missing file.
/// </summary>
public class WorkingPaperTranslation
{
    public long Id { get; set; }
    public int PaperId { get; set; }
    public WorkingPaper Paper { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string? Title { get; set; }
    /// <summary>In display order (text[]).</summary>
    public List<string> Authors { get; set; } = [];
    /// <summary>Plain text; a line break starts a new paragraph on the site.</summary>
    public string? Abstract { get; set; }
    public List<string> Keywords { get; set; } = [];
    /// <summary>The PDF of the locale.</summary>
    public long? MediaId { get; set; }
}
