namespace Cbar.Domain.Entities;

/// <summary>
/// A topic of the FAQ page "Sual-cavab" (spec 051), e.g. "Pul siyasəti". Its questions show as numbered accordions; the
/// site selects a topic with <c>?topic=&lt;slug&gt;</c>, so the slug never changes after creation.
/// </summary>
public class FaqTopic
{
    public int Id { get; set; }
    public string Slug { get; set; } = null!;
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<FaqTopicTranslation> Translations { get; set; } = [];
    public List<FaqTopicPage> Pages { get; set; } = [];
    public List<FaqQuestion> Questions { get; set; } = [];
}

public class FaqTopicTranslation
{
    public long Id { get; set; }
    public int TopicId { get; set; }
    public FaqTopic Topic { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

/// <summary>A CMS page that shows a link card to the topic below its text.</summary>
public class FaqTopicPage
{
    public int TopicId { get; set; }
    public FaqTopic Topic { get; set; } = null!;
    public int PageId { get; set; }
    public int SortOrder { get; set; }
}

/// <summary>A question of a topic. Its number on the site is its position in the topic, not stored.</summary>
public class FaqQuestion
{
    public int Id { get; set; }
    public int TopicId { get; set; }
    public FaqTopic Topic { get; set; } = null!;
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<FaqQuestionTranslation> Translations { get; set; } = [];
}

public class FaqQuestionTranslation
{
    public long Id { get; set; }
    public int QuestionId { get; set; }
    public FaqQuestion Question { get; set; } = null!;
    public string Locale { get; set; } = null!;
    /// <summary>The question line; JSON name <c>question</c>.</summary>
    public string Text { get; set; } = null!;
    /// <summary>Rich-text HTML.</summary>
    public string Answer { get; set; } = null!;
}

/// <summary>A video card of the FAQ page; it opens on YouTube.</summary>
public class FaqVideo
{
    public int Id { get; set; }
    public string YoutubeUrl { get; set; } = null!;
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<FaqVideoTranslation> Translations { get; set; } = [];
}

public class FaqVideoTranslation
{
    public long Id { get; set; }
    public int VideoId { get; set; }
    public FaqVideo Video { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
}
