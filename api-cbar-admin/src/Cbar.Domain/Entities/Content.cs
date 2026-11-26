namespace Cbar.Domain.Entities;

public enum ContentStatus
{
    Draft,
    Scheduled,
    Published,
    Archived
}

public class MediaAsset
{
    public long Id { get; set; }
    public string StorageKey { get; set; } = null!;
    public string OriginalName { get; set; } = null!;
    public string MimeType { get; set; } = null!;
    public long SizeBytes { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string ChecksumSha256 { get; set; } = null!;
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

public class Page
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public Page? Parent { get; set; }
    public List<Page> Children { get; set; } = [];
    public string Path { get; set; } = null!;     // ltree, ids root→leaf
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public string? NavUrl { get; set; }           // menu-link override (app route / external URL)
    // visibility flags (parity with the legacy admin's per-page checkboxes)
    public bool Active { get; set; } = true;      // master switch: off = hidden everywhere
    public bool Visible { get; set; } = true;     // shown in site navigation
    public bool ShowAz { get; set; } = true;
    public bool ShowEn { get; set; } = true;
    public bool ShowInFooter { get; set; }
    // admin tree behavior flags (legacy parity)
    public bool Readonly { get; set; }
    public bool Disabled { get; set; }
    public bool Removable { get; set; } = true;
    public bool RemovableAll { get; set; }
    public bool MovableU { get; set; } = true;
    public bool MovableD { get; set; } = true;
    public bool MovableL { get; set; }
    public bool MovableR { get; set; }
    // admin tree display state (legacy parity)
    public bool Selected { get; set; }
    public bool Collapsed { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<PageTranslation> Translations { get; set; } = [];
    public List<PageAsset> Assets { get; set; } = [];
    /// <summary>Settings kept outside the pages table; null means all defaults (spec 041).</summary>
    public PageDetail? Details { get; set; }
    /// <summary>Dropdown menu placement; null means "follow <see cref="PageDetail.ShowInSideNav"/>" (spec 054).</summary>
    public PageNavDetail? NavDetails { get; set; }
    /// <summary>Per-locale menu settings (spec 054); a locale without a row has none.</summary>
    public List<PageTranslationDetail> TranslationDetails { get; set; } = [];
}

/// <summary>Companion row of a page: see db/migrations/0024-page-details.sql.</summary>
public class PageDetail
{
    public int PageId { get; set; }
    /// <summary>Shown in its section's left menu; off keeps the page in every other menu (spec 041).</summary>
    public bool ShowInSideNav { get; set; } = true;
}

/// <summary>Companion row of a page: see db/migrations/0039-page-nav-details.sql.</summary>
public class PageNavDetail
{
    public int PageId { get; set; }
    /// <summary>
    /// Shown in the dropdown menus below its section root; null follows
    /// <see cref="PageDetail.ShowInSideNav"/>. <c>false</c> side + <c>true</c> here is a page only the
    /// dropdown menus list.
    /// </summary>
    public bool? ShowInDropdownNav { get; set; }
}

/// <summary>Per-locale companion row of a page: see db/migrations/0039-page-nav-details.sql.</summary>
public class PageTranslationDetail
{
    public int PageId { get; set; }
    public string Locale { get; set; } = null!;
    /// <summary>Siblings with the same label form one group in the dropdown menus (shown from spec 055).</summary>
    public string? MenuGroup { get; set; }
}

/// <summary>
/// The size of a media row was checked against object storage: see
/// db/migrations/0040-media-asset-details.sql.
/// </summary>
public class MediaAssetDetail
{
    public long MediaId { get; set; }
    public DateTimeOffset SizeVerifiedAt { get; set; }
}

public class PageTranslation
{
    public long Id { get; set; }
    public int PageId { get; set; }
    public Page Page { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Content { get; set; }
}

public class PageAsset
{
    public long Id { get; set; }
    public int PageId { get; set; }
    public Page Page { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
    public string? GroupLabel { get; set; }       // editor-set accordion group (e.g. a year)
    public List<PageAssetTranslation> Translations { get; set; } = [];
}

public class PageAssetTranslation
{
    public long Id { get; set; }
    public long PageAssetId { get; set; }
    public PageAsset PageAsset { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
}

public class PressRelease
{
    public int Id { get; set; }
    public short Type { get; set; } = 1;
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public DateTimeOffset? PublishedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<PressReleaseTranslation> Translations { get; set; } = [];
    public List<PressReleaseAsset> Assets { get; set; } = [];
    public List<PressReleaseQuestion> Questions { get; set; } = [];
}

public class PressReleaseTranslation
{
    public long Id { get; set; }
    public int PressReleaseId { get; set; }
    public PressRelease PressRelease { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Content { get; set; }
}

public class PressReleaseAsset
{
    public long Id { get; set; }
    public int PressReleaseId { get; set; }
    public PressRelease PressRelease { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
    public PressReleaseAssetDetail? Details { get; set; }
}

public class PressReleaseAssetDetail
{
    public long AssetId { get; set; }
    /// <summary>The language the file is shown in; null, like a missing row, means both (spec 033).</summary>
    public string? Locale { get; set; }
}

public class PressReleaseQuestion
{
    public int Id { get; set; }
    public int PressReleaseId { get; set; }
    public PressRelease PressRelease { get; set; } = null!;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public List<PressReleaseQuestionTranslation> Translations { get; set; } = [];
    public List<PressReleaseVote> Votes { get; set; } = [];
}

public class PressReleaseQuestionTranslation
{
    public long Id { get; set; }
    public int QuestionId { get; set; }           // column: question_id
    public PressReleaseQuestion Question { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string QuestionText { get; set; } = null!;  // column: question
}

public class PressReleaseVote
{
    public long Id { get; set; }
    public int QuestionId { get; set; }
    public PressReleaseQuestion Question { get; set; } = null!;
    public short Answer { get; set; }             // scale value
    public string VoterHash { get; set; } = null!;
    public DateTimeOffset CreatedAt { get; set; }
}
