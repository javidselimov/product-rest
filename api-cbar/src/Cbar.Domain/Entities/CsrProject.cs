namespace Cbar.Domain.Entities;

/// <summary>
/// A project of the corporate social responsibility page (spec 038). The site shows it as a card
/// and a dialog, so it has no slug and no address of its own.
/// </summary>
public class CsrProject
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public CsrCategory Category { get; set; } = null!;
    /// <summary>The card image. Separate from the photos: a card may have one while the dialog has none.</summary>
    public long? CoverMediaId { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public bool ShowAz { get; set; } = true;
    public bool ShowEn { get; set; } = true;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<CsrProjectTranslation> Translations { get; set; } = [];
    public List<CsrProjectImage> Images { get; set; } = [];
}

public class CsrProjectTranslation
{
    public long Id { get; set; }
    public int ProjectId { get; set; }
    public CsrProject Project { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string CardTitle { get; set; } = null!;
    public string Summary { get; set; } = null!;
    /// <summary>The dialog heading, usually longer than the card title.</summary>
    public string Title { get; set; } = null!;
    public string? Content { get; set; }
}

public class CsrProjectImage
{
    public long Id { get; set; }
    public int ProjectId { get; set; }
    public CsrProject Project { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class CsrCategory
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<CsrCategoryTranslation> Translations { get; set; } = [];
}

public class CsrCategoryTranslation
{
    public long Id { get; set; }
    public int CategoryId { get; set; }
    public CsrCategory Category { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}
