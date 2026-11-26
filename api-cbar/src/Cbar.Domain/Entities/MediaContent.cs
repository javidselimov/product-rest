namespace Cbar.Domain.Entities;

public class Gallery
{
    public int Id { get; set; }
    public DateOnly? EventDate { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<GalleryTranslation> Translations { get; set; } = [];
    public List<GalleryImage> Images { get; set; } = [];
}

public class GalleryTranslation
{
    public long Id { get; set; }
    public int GalleryId { get; set; }
    public Gallery Gallery { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
}

public class GalleryImage
{
    public long Id { get; set; }
    public int GalleryId { get; set; }
    public Gallery Gallery { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
}

public class Video
{
    public int Id { get; set; }
    public string YoutubeUrl { get; set; } = null!;
    public DateTimeOffset? PublishedAt { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<VideoTranslation> Translations { get; set; } = [];
}

public class VideoTranslation
{
    public long Id { get; set; }
    public int VideoId { get; set; }
    public Video Video { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
}

public class VideoStream
{
    public int Id { get; set; }
    public string StreamUrl { get; set; } = null!;
    public bool IsLive { get; set; }
    public DateTimeOffset? StartsAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<VideoStreamTranslation> Translations { get; set; } = [];
}

public class VideoStreamTranslation
{
    public long Id { get; set; }
    public int StreamId { get; set; }
    public VideoStream Stream { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
}
