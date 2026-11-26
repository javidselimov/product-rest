using Cbar.AdminApi.Validation;

namespace Cbar.AdminApi.Tests;

/// <summary>Spec 058: the bank's daily AZIR workbook → values (data-model §1).</summary>
public class AzirSheetReaderTests
{
    private static readonly DateOnly Today = new(2026, 11, 24);
    private const double FileDate = 46322; // 2026-10-27

    private static AzirSheet ReadFixture()
    {
        using var file = File.OpenRead(Path.Combine(AppContext.BaseDirectory, "Fixtures", "azir-2026-10-27.xlsx"));
        return AzirSheetReader.Read(file, Today);
    }

    /// <summary>The fixture's layout: date in B2, header in row 4, 1D in row 5.</summary>
    private static Dictionary<string, object> Sheet(params (string Cell, object Value)[] overrides)
    {
        var cells = new Dictionary<string, object>
        {
            ["B2"] = FileDate,
            ["C2"] = "tarixinə AZIR İNDEKSLƏRİ",
            ["B4"] = "Ad",
            ["C4"] = "Faiz",
            ["D4"] = "Əqdlərin həcmi\n(AZN) ",
            ["E4"] = "Əqdlərin sayı",
            ["B5"] = "AZIR*",
            ["C5"] = 0.063047774476156684,
            ["D5"] = 0,
            ["E5"] = 0,
            ["B7"] = "TF AZIR 30D",
            ["C7"] = 0.059748,
            ["D7"] = "-",
            ["E7"] = "-",
        };
        foreach (var (cell, value) in overrides)
        {
            if (value is null)
                cells.Remove(cell);
            else
                cells[cell] = value;
        }
        return cells;
    }

    private static AzirSheet Read(params (string Cell, object Value)[] overrides)
    {
        using var file = TestWorkbook.Build(Sheet(overrides));
        return AzirSheetReader.Read(file, Today);
    }

    private static AzirSheetException Rejected(params (string Cell, object Value)[] overrides) =>
        Assert.Throws<AzirSheetException>(() => Read(overrides));

    private static AzirSheetTerm OneDay(AzirSheet sheet) => sheet.Terms.Single(t => t.Term == "1D");

    // --- The bank's real file --------------------------------------------------------------------

    [Fact]
    public void The_sample_file_reads_as_the_legacy_site_shows_it()
    {
        var sheet = ReadFixture();

        Assert.Equal(new DateOnly(2026, 10, 27), sheet.ValueDate);
        Assert.Equal(["1D", "30D", "90D", "180D"], sheet.Terms.Select(t => t.Term));
        Assert.Equal(new AzirSheetTerm(5, "1D", 6.3048m, true, 0m, 0, null, null), OneDay(sheet));
        Assert.Equal(new AzirSheetTerm(7, "30D", 5.9748m, false, null, null, null, null), sheet.Terms[1]);
        Assert.Equal(6.1316m, sheet.Terms[2].Rate);
        Assert.Equal(6.3484m, sheet.Terms[3].Rate);
        Assert.Equal([new AzirSkippedRow(10, "AZIR TFAI", AzirSheetReader.SkippedTfai)], sheet.Skipped);
        Assert.False(sheet.VolumeConverted);
    }

    // --- Names -----------------------------------------------------------------------------------

    [Theory]
    [InlineData("AZIR*", true)]
    [InlineData("AZIR", false)]
    [InlineData("1D AZIR*", true)]
    [InlineData(" 1d  azir ", false)]
    public void The_1D_row_is_recognised_in_either_spelling(string name, bool reserve) =>
        Assert.Equal(reserve, OneDay(Read(("B5", name))).IsReservePlan);

    [Fact]
    public void Names_ignore_spacing_and_case() =>
        Assert.Equal("30D", Read(("B7", "tf  azir 30d ")).Terms[1].Term);

    [Fact]
    public void A_star_on_a_longer_tenor_marks_it_reserve_plan() =>
        Assert.True(Read(("B7", "TF AZIR 30D*")).Terms[1].IsReservePlan);

    [Fact]
    public void Footnotes_and_blank_rows_are_ignored()
    {
        var sheet = Read(("B14", "* Ehtiyat plan əsasında hesablanmışdır."), ("C11", ""));
        Assert.Equal(2, sheet.Terms.Count);
    }

    [Fact]
    public void A_header_moved_down_still_finds_the_table()
    {
        var sheet = Read(("B4", null!), ("C4", null!), ("B5", "Ad"), ("C5", "Faiz"), ("D5", null!), ("E5", null!),
            ("B6", "AZIR*"), ("C6", 0.0625), ("B7", null!), ("C7", null!), ("D7", null!), ("E7", null!));
        Assert.Equal(new AzirSheetTerm(6, "1D", 6.25m, true, null, null, null, null), OneDay(sheet));
    }

    [Fact]
    public void A_text_date_is_accepted() =>
        Assert.Equal(new DateOnly(2026, 10, 27), Read(("B2", "27.10.2026")).ValueDate);

    // --- Numbers ---------------------------------------------------------------------------------

    [Theory]
    [InlineData(27.5, 27.50, false)]
    [InlineData(10000, 10000, false)]
    [InlineData(1000000, 1.00, true)]
    [InlineData(132000000, 132.00, true)]
    [InlineData(27499999, 27.50, true)]
    public void The_volume_is_stored_in_millions(double file, double stored, bool converted)
    {
        var sheet = Read(("D5", file));
        Assert.Equal((decimal)stored, OneDay(sheet).DealVolume);
        Assert.Equal(converted, sheet.VolumeConverted);
    }

    [Fact]
    public void Deal_count_and_minimum_and_maximum_are_read_for_1D()
    {
        var day = OneDay(Read(("E5", 2), ("B12", "LAST MIN RATE"), ("C12", 0.06), ("B13", "LAST MAX RATE"), ("C13", 0.0602)));
        Assert.Equal(2, day.DealCount);
        Assert.Equal(6.00m, day.MinRate);
        Assert.Equal(6.02m, day.MaxRate);
    }

    [Fact]
    public void A_zero_minimum_or_maximum_is_stored_as_null()
    {
        var day = OneDay(Read(("B12", "LAST MIN RATE"), ("C12", 0), ("B13", "LAST MAX RATE"), ("C13", 0)));
        Assert.Null(day.MinRate);
        Assert.Null(day.MaxRate);
    }

    [Fact]
    public void A_dash_volume_and_count_are_null()
    {
        var day = OneDay(Read(("D5", "-"), ("E5", "-")));
        Assert.Null(day.DealVolume);
        Assert.Null(day.DealCount);
    }

    [Theory]
    [InlineData("-")]
    [InlineData(0)]
    public void A_longer_tenor_without_a_rate_is_skipped(object rate)
    {
        var sheet = Read(("C7", rate));
        Assert.Equal(["1D"], sheet.Terms.Select(t => t.Term));
        Assert.Equal([new AzirSkippedRow(7, "TF AZIR 30D", AzirSheetReader.SkippedEmpty)], sheet.Skipped);
    }

    [Fact]
    public void A_longer_tenor_with_a_blank_rate_is_skipped() =>
        Assert.Equal(AzirSheetReader.SkippedEmpty, Read(("C7", null!)).Skipped.Single().Reason);

    // --- Rejections ------------------------------------------------------------------------------

    [Fact]
    public void A_missing_date_is_rejected() =>
        Assert.Equal((AzirSheetReader.DateMissing, 2, "B"), Info(Rejected(("B2", null!))));

    [Fact]
    public void A_text_that_is_not_a_date_is_rejected() =>
        Assert.Equal(AzirSheetReader.DateMissing, Rejected(("B2", "AZIR")).Code);

    [Fact]
    public void A_future_date_is_rejected()
    {
        var error = Rejected(("B2", "25.11.2026"));
        Assert.Equal(AzirSheetReader.DateInFuture, error.Code);
        Assert.Equal(new DateOnly(2026, 11, 25), error.ValueDate);
    }

    [Fact]
    public void A_sheet_without_the_header_is_rejected() =>
        Assert.Equal(AzirSheetReader.HeaderMissing, Rejected(("B4", "Name")).Code);

    [Fact]
    public void An_unknown_name_is_rejected_with_its_cell() =>
        Assert.Equal((AzirSheetReader.UnknownIndex, 8, "B"), Info(Rejected(("B8", "TF AZIR 60D"), ("C8", 0.06))));

    [Theory]
    [InlineData("AZIR")]
    [InlineData("1D AZIR")]
    public void A_second_1D_row_is_rejected(string name) =>
        Assert.Equal((AzirSheetReader.DuplicateIndex, 8, "B"), Info(Rejected(("B8", name), ("C8", 0.06))));

    [Fact]
    public void A_second_minimum_row_is_rejected() =>
        Assert.Equal(AzirSheetReader.DuplicateIndex,
            Rejected(("B12", "LAST MIN RATE"), ("C12", 0), ("B13", "last min rate"), ("C13", 0)).Code);

    [Fact]
    public void A_sheet_without_1D_is_rejected() =>
        Assert.Equal(AzirSheetReader.Missing1D, Rejected(("B5", null!), ("C5", null!), ("D5", null!), ("E5", null!)).Code);

    [Theory]
    [InlineData("-")]
    [InlineData(0)]
    public void A_1D_row_without_a_rate_is_rejected(object rate) =>
        Assert.Equal((AzirSheetReader.Missing1D, 5, "C"), Info(Rejected(("C5", rate))));

    [Theory]
    [InlineData("C5", "6.3%")]
    [InlineData("C5", -0.01)]
    [InlineData("C5", 100)]
    [InlineData("E5", 2.5)]
    [InlineData("E5", -1)]
    [InlineData("D5", -5)]
    [InlineData("D5", "çox")]
    public void A_bad_number_is_rejected_with_its_cell(string cell, object value)
    {
        var error = Rejected((cell, value));
        Assert.Equal((AzirSheetReader.InvalidValue, 5, cell[..1]), Info(error));
    }

    [Fact]
    public void A_minimum_above_the_maximum_is_rejected() =>
        Assert.Equal((AzirSheetReader.InvalidValue, 12, "C"),
            Info(Rejected(("B12", "LAST MIN RATE"), ("C12", 0.07), ("B13", "LAST MAX RATE"), ("C13", 0.06))));

    [Theory]
    [InlineData(10000.01)]
    [InlineData(250000)]
    [InlineData(999999.99)]
    public void A_volume_in_neither_unit_is_rejected(double volume) =>
        Assert.Equal((AzirSheetReader.AmbiguousVolume, 5, "D"), Info(Rejected(("D5", volume))));

    [Fact]
    public void A_file_that_is_not_a_workbook_is_rejected()
    {
        using var file = new MemoryStream("not a zip"u8.ToArray());
        var error = Assert.Throws<XlsxReadException>(() => AzirSheetReader.Read(file, Today));
        Assert.Equal(XlsxSheetReader.NotXlsx, error.Code);
    }

    private static (string, int?, string?) Info(AzirSheetException e) => (e.Code, e.Row, e.Column);
}
