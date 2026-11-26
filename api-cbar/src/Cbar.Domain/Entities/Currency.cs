namespace Cbar.Domain.Entities;

public class Currency
{
    public string Code { get; set; } = null!;     // ISO 4217
    public int Nominal { get; set; } = 1;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public bool ShowOnHomepage { get; set; }
    public List<CurrencyTranslation> Translations { get; set; } = [];
}

public class CurrencyTranslation
{
    public long Id { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public Currency Currency { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class CurrencyRate
{
    public long Id { get; set; }
    public DateOnly RateDate { get; set; }
    public string CurrencyCode { get; set; } = null!;
    public Currency Currency { get; set; } = null!;
    public decimal Rate { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
