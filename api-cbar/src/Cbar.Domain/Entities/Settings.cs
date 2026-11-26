namespace Cbar.Domain.Entities;

public class Setting
{
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;    // jsonb
    public int? UpdatedBy { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
