namespace Cbar.Domain.Entities;

public class MoneyMarkCategory
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public List<MoneyMarkCategoryTranslation> Translations { get; set; } = [];
    public List<MoneyMark> MoneyMarks { get; set; } = [];
}

public class MoneyMarkCategoryTranslation
{
    public long Id { get; set; }
    public int CategoryId { get; set; }
    public MoneyMarkCategory Category { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class MoneyMark
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public MoneyMarkCategory Category { get; set; } = null!;
    public short Type { get; set; } = 1;          // 1 = banknote, 2 = coin
    public long? FrontMediaId { get; set; }
    public MediaAsset? FrontMedia { get; set; }
    public long? RearMediaId { get; set; }
    public MediaAsset? RearMedia { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<MoneyMarkTranslation> Translations { get; set; } = [];
}

public class MoneyMarkTranslation
{
    public long Id { get; set; }
    public int MoneyMarkId { get; set; }
    public MoneyMark MoneyMark { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Description { get; set; }
    public string? SecurityFeatures { get; set; }
}

public class MoneyMarkNews
{
    public int Id { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public DateTimeOffset? PublishedAt { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<MoneyMarkNewsTranslation> Translations { get; set; } = [];
}

public class MoneyMarkNewsTranslation
{
    public long Id { get; set; }
    public int NewsId { get; set; }
    public MoneyMarkNews News { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Content { get; set; }
}
