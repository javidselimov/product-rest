namespace Cbar.Domain.Entities;

public class AzirIndexValue
{
    public long Id { get; set; }
    public DateOnly ValueDate { get; set; }
    public string Term { get; set; } = "1D";      // 1D, 1W, 1M, ...
    public decimal Rate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public AzirIndexValueDetail? Details { get; set; }
}

/// <summary>Deal details of an AZIR value; a value without one reads as nulls and not reserve plan.</summary>
public class AzirIndexValueDetail
{
    public long AzirIndexValueId { get; set; }
    public decimal? DealVolume { get; set; }    // mln AZN
    public int? DealCount { get; set; }
    public decimal? MinRate { get; set; }       // last transaction day
    public decimal? MaxRate { get; set; }
    public bool IsReservePlan { get; set; }     // calculated under the contingency plan: `*`
    public DateTimeOffset UpdatedAt { get; set; }
}

public class MonthlyInflationParameter
{
    public int Id { get; set; }
    public short Year { get; set; }
    public short Month { get; set; }
    public string ParameterCode { get; set; } = null!;  // e.g. 'cpi_yoy', 'cpi_mom'
    public decimal Value { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

// Homepage inflation summary: a single row (id = 1), as in the legacy panel.
public class InflationSetting
{
    public short Id { get; set; } = 1;
    public decimal CurrentInflation { get; set; }
    public string TargetInflation { get; set; } = null!;  // free text, e.g. "4 (±2)"
    public DateOnly NextUpdateDate { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class InfoLine
{
    public int Id { get; set; }
    public string Alias { get; set; } = null!;    // block identifier
    public short? Year { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<InfoLineTranslation> Translations { get; set; } = [];
}

public class InfoLineTranslation
{
    public long Id { get; set; }
    public int InfoLineId { get; set; }
    public InfoLine InfoLine { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Title { get; set; } = null!;
    public string? Value { get; set; }
}

// Yield curve: three independent date-keyed datasets, each imported from its own .xlsx, as the
// legacy admin kept them (YCYields, YCParams, YCPeriods). A date may have any subset of them.

public class YcYield
{
    public long Id { get; set; }
    public DateOnly CurveDate { get; set; }
    public int Period { get; set; }   // tenor in days
    public decimal Yield { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class YcParameters
{
    public int Id { get; set; }
    public DateOnly CurveDate { get; set; }
    public decimal Beta0 { get; set; }
    public decimal Beta1 { get; set; }
    public decimal Beta2 { get; set; }
    public decimal Lambda { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class YcPeriods
{
    public int Id { get; set; }
    public DateOnly CurveDate { get; set; }
    public decimal ThreeMonth { get; set; }
    public decimal SixMonth { get; set; }
    public decimal NineMonth { get; set; }
    public decimal OneYear { get; set; }
    public decimal TwoYear { get; set; }
    public decimal ThreeYear { get; set; }
    public decimal FourYear { get; set; }
    public int? CreatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}
