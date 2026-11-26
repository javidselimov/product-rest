namespace Cbar.Domain.Entities;

public class MeasEmitent
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<MeasEmitentTranslation> Translations { get; set; } = [];
}

public class MeasEmitentTranslation
{
    public long Id { get; set; }
    public int EmitentId { get; set; }
    public MeasEmitent Emitent { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class MeasInfoType
{
    public int Id { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<MeasInfoTypeTranslation> Translations { get; set; } = [];
}

public class MeasInfoTypeTranslation
{
    public long Id { get; set; }
    public int InfoTypeId { get; set; }
    public MeasInfoType InfoType { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class MeasDocument
{
    public long Id { get; set; }
    public int EmitentId { get; set; }
    public MeasEmitent Emitent { get; set; } = null!;
    public int InfoTypeId { get; set; }
    public MeasInfoType InfoType { get; set; } = null!;
    public DateOnly RegDate { get; set; }
    public string? Dqn { get; set; }              // state registration number
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}
