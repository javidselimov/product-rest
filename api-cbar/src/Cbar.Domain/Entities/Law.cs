namespace Cbar.Domain.Entities;

public class LawCategory
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public List<LawCategoryTranslation> Translations { get; set; } = [];
    public List<Law> Laws { get; set; } = [];
}

public class LawCategoryTranslation
{
    public long Id { get; set; }
    public int CategoryId { get; set; }
    public LawCategory Category { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class Law
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public LawCategory Category { get; set; } = null!;
    public short Type { get; set; } = 1;          // 1 = law, 2 = regulation
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public DateTimeOffset? PublishedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<LawTranslation> Translations { get; set; } = [];
    public List<LawAsset> Assets { get; set; } = [];
}

public class LawTranslation
{
    public long Id { get; set; }
    public int LawId { get; set; }
    public Law Law { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
}

public class LawAsset
{
    public long Id { get; set; }
    public int LawId { get; set; }
    public Law Law { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
}
