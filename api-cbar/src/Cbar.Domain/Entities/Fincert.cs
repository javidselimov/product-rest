namespace Cbar.Domain.Entities;

/// <summary>
/// The single record of the FinCERT page (spec 053): contacts and the reporting portal address. The row always has id 1
/// (a CHECK keeps it single); the admin API creates it on first save. It has no status: CMS page 133 decides whether the
/// page is published.
/// </summary>
public class FincertSettings
{
    public const short SingletonId = 1;

    public short Id { get; set; } = SingletonId;
    public string? Email { get; set; }
    /// <summary>As the editor wrote it; the site builds the <c>tel:</c> link from its digits and <c>+</c>.</summary>
    public string? Phone { get; set; }
    public string? PortalUrl { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<FincertSettingsTranslation> Translations { get; set; } = [];
}

/// <summary>
/// The per-locale part of the FinCERT settings. The RFC-2350 document is a media file, an external link or both; the
/// file wins on the site, the link carries the legacy file address until an editor uploads the document.
/// </summary>
public class FincertSettingsTranslation
{
    public long Id { get; set; }
    public short SettingsId { get; set; }
    public FincertSettings Settings { get; set; } = null!;
    public string Locale { get; set; } = null!;
    /// <summary>Plain text; line breaks separate paragraphs.</summary>
    public string? Mission { get; set; }
    public string? PortalTitle { get; set; }
    public string? PortalDescription { get; set; }
    public long? RfcMediaId { get; set; }
    public MediaAsset? RfcMedia { get; set; }
    public string? RfcUrl { get; set; }
}

/// <summary>
/// An activity direction of FinCERT, shown as a numbered accordion. Its number is its position among the visible
/// directions, not stored.
/// </summary>
public class FincertDirection
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<FincertDirectionTranslation> Translations { get; set; } = [];
}

/// <summary>The per-locale title and rich-text body of a FinCERT direction.</summary>
public class FincertDirectionTranslation
{
    public long Id { get; set; }
    public int DirectionId { get; set; }
    public FincertDirection Direction { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    /// <summary>Rich-text HTML.</summary>
    public string Body { get; set; } = "";
}

/// <summary>A membership of FinCERT in an international organization (e.g. FIRST), shown as a card with a logo.</summary>
public class FincertMembership
{
    public int Id { get; set; }
    public long? LogoMediaId { get; set; }
    public MediaAsset? LogoMedia { get; set; }
    public string? Url { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<FincertMembershipTranslation> Translations { get; set; } = [];
}

/// <summary>The per-locale name, description and badge (e.g. "2026-cı ildən tam hüquqlu üzv") of a membership.</summary>
public class FincertMembershipTranslation
{
    public long Id { get; set; }
    public int MembershipId { get; set; }
    public FincertMembership Membership { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public string? Badge { get; set; }
}
