namespace Cbar.Domain.Entities;

public class Banner
{
    public int Id { get; set; }
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<BannerTranslation> Translations { get; set; } = [];
}

public class BannerTranslation
{
    public long Id { get; set; }
    public int BannerId { get; set; }
    public Banner Banner { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string? Title { get; set; }
    public string? Link { get; set; }
    public string? Description { get; set; }
}

public class NewsSliderItem
{
    public int Id { get; set; }
    public DateOnly NewsDate { get; set; }
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<NewsSliderItemTranslation> Translations { get; set; } = [];
}

public class NewsSliderItemTranslation
{
    public long Id { get; set; }
    public int SliderId { get; set; }             // column: slider_id
    public NewsSliderItem Slider { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string? Link { get; set; }
}

public class RunningLine
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? StartsAt { get; set; }
    public DateTimeOffset? EndsAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<RunningLineTranslation> Translations { get; set; } = [];
}

public class RunningLineTranslation
{
    public long Id { get; set; }
    public int RunningLineId { get; set; }
    public RunningLine RunningLine { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Text { get; set; } = null!;
}

public class HomepageLink
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<HomepageLinkTranslation> Translations { get; set; } = [];
}

public class HomepageLinkTranslation
{
    public long Id { get; set; }
    public int LinkId { get; set; }               // column: link_id
    public HomepageLink Link { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Url { get; set; } = null!;
}

public class HomepagePublication
{
    public int Id { get; set; }
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public DateTimeOffset? PublishedAt { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<HomepagePublicationTranslation> Translations { get; set; } = [];
}

public class HomepagePublicationTranslation
{
    public long Id { get; set; }
    public int PublicationId { get; set; }        // column: publication_id
    public HomepagePublication Publication { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Url { get; set; }
}

/// <summary>
/// A card of the homepage "Strategiya və sənədlər" block (spec 057). The card opens the locale's <c>Url</c>, else the
/// linked page in that locale; the site shows the first three published documents of a locale.
/// </summary>
public class HomepageStrategyDoc
{
    public int Id { get; set; }
    public int? PageId { get; set; }
    public Page? Page { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<HomepageStrategyDocTranslation> Translations { get; set; } = [];
}

/// <summary>The per-locale title, short text, cover and link of a strategy document; a locale is stored only with a title.</summary>
public class HomepageStrategyDocTranslation
{
    public long Id { get; set; }
    public int DocId { get; set; }                // column: doc_id
    public HomepageStrategyDoc Doc { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Summary { get; set; }
    public long? CoverMediaId { get; set; }
    public MediaAsset? CoverMedia { get; set; }
    public string? Url { get; set; }
}
