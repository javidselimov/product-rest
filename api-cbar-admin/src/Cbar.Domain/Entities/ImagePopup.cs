namespace Cbar.Domain.Entities;

public class ImagePopup
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset? ActivatedAt { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<ImagePopupTranslation> Translations { get; set; } = [];
}

public class ImagePopupTranslation
{
    public long Id { get; set; }
    public int PopupId { get; set; }
    public ImagePopup Popup { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public string? Link { get; set; }
    public string? AltText { get; set; }
}
