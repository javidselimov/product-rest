namespace Cbar.Domain.Entities;

/// <summary>
/// A Memorandum of Understanding signed with a foreign central bank or supervisor (spec 045). The
/// site shows it as a table row on the CMS page "Mərkəzi banklarla əməkdaşlıq", so it has no slug
/// and no address of its own.
/// </summary>
public class Memorandum
{
    public int Id { get; set; }
    /// <summary>The year of signing; the site shows and sorts by it.</summary>
    public short SignedYear { get; set; }
    /// <summary>Order among the memorandums of one year.</summary>
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public bool ShowAz { get; set; } = true;
    public bool ShowEn { get; set; } = true;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<MemorandumTranslation> Translations { get; set; } = [];
}

public class MemorandumTranslation
{
    public long Id { get; set; }
    public int MemorandumId { get; set; }
    public Memorandum Memorandum { get; set; } = null!;
    public string Locale { get; set; } = null!;
    /// <summary>The counterparty: a central bank, a ministry or a supervisor.</summary>
    public string Organization { get; set; } = null!;
    /// <summary>Free text, as the editor wants it shown ("BƏƏ").</summary>
    public string Country { get; set; } = null!;
}
