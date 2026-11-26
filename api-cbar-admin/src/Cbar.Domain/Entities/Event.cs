namespace Cbar.Domain.Entities;

/// <summary>
/// A dated event (spec 034). Not a press release: it is public before it happens, so it has no
/// publication date. The links are optional and one-way; a legacy event only points at its page.
/// </summary>
public class Event
{
    public int Id { get; set; }
    /// <summary>1 decision, 2 press conference, 3 conference, 4 seminar; null for legacy anniversaries.</summary>
    public short? Type { get; set; }
    public int? CategoryId { get; set; }
    public EventCategory? Category { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public DateOnly StartsOn { get; set; }
    public DateOnly? EndsOn { get; set; }
    /// <summary>Asia/Baku time.</summary>
    public TimeOnly? StartTime { get; set; }
    public int? GalleryId { get; set; }
    public Gallery? Gallery { get; set; }
    public int? PressReleaseId { get; set; }
    public PressRelease? PressRelease { get; set; }
    public int? PageId { get; set; }
    public Page? Page { get; set; }
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<EventTranslation> Translations { get; set; } = [];
}

public class EventTranslation
{
    public long Id { get; set; }
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public string? Location { get; set; }
    public string? Content { get; set; }
}

public class EventCategory
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<EventCategoryTranslation> Translations { get; set; } = [];
}

public class EventCategoryTranslation
{
    public long Id { get; set; }
    public int CategoryId { get; set; }
    public EventCategory Category { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}
