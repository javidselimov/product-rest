using Cbar.AdminApi.Controllers;
using Cbar.AdminApi.Validation;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Tests;

public class WorkingPaperRulesTests
{
    private const int CurrentYear = 2026;
    private const long PdfId = 10;
    private const long ImageId = 11;
    private const long UnknownId = 99;

    private static readonly Dictionary<long, string> Media = new()
    {
        [PdfId] = "application/pdf",
        [ImageId] = "image/png",
    };

    private static WorkingPaperTranslationDto Titled(long? mediaId = null) =>
        new("Inflation expectations", Authors: ["A. Author"], MediaId: mediaId);

    private static WorkingPaperUpsertDto Paper(
        short number = 1, short year = CurrentYear, string? language = "az",
        ContentStatus status = ContentStatus.Published, List<string>? jelCodes = null,
        int? legacyPageId = null, Dictionary<string, WorkingPaperTranslationDto>? translations = null) =>
        new(number, year, language, status, translations ?? new() { ["az"] = Titled() }, jelCodes, legacyPageId);

    private static Dictionary<string, string[]> Validate(WorkingPaperUpsertDto dto) =>
        WorkingPaperRules.Validate(dto, CurrentYear, Media);

    [Fact]
    public void A_complete_paper_passes() =>
        Assert.Empty(Validate(Paper(jelCodes: ["E58", "c32"], translations: new() { ["az"] = Titled(PdfId) })));

    [Theory]
    [InlineData(1, true)]
    [InlineData(99, true)]
    [InlineData(0, false)]
    [InlineData(100, false)]
    public void Number_must_be_1_to_99(short number, bool valid) =>
        Assert.Equal(!valid, Validate(Paper(number: number)).ContainsKey("number"));

    [Theory]
    [InlineData(1990, true)]
    [InlineData(CurrentYear + 1, true)]   // entered ahead of the new year
    [InlineData(1989, false)]
    [InlineData(CurrentYear + 2, false)]
    public void Year_runs_from_1990_to_next_year(short year, bool valid) =>
        Assert.Equal(!valid, Validate(Paper(year: year)).ContainsKey("year"));

    [Theory]
    [InlineData(null)]
    [InlineData("ru")]
    public void Paper_language_must_be_a_known_one(string? language) =>
        Assert.Contains("paperLanguage", Validate(Paper(language: language)).Keys);

    [Fact]
    public void A_paper_cannot_be_scheduled() =>
        Assert.Contains("status", Validate(Paper(status: ContentStatus.Scheduled)).Keys);

    [Theory]
    [InlineData("E580")]
    [InlineData("58")]
    [InlineData("EE5")]
    public void Jel_codes_are_a_letter_and_one_or_two_digits(string code)
    {
        var errors = Validate(Paper(jelCodes: ["E58", code]));
        Assert.Contains(code.ToUpperInvariant(), errors["jelCodes"][0]);
    }

    [Fact]
    public void Legacy_page_id_must_be_positive() =>
        Assert.Contains("legacyPageId", Validate(Paper(legacyPageId: 0)).Keys);

    [Fact]
    public void At_least_one_locale_needs_a_title()
    {
        var errors = Validate(Paper(translations: new() { ["az"] = new("  "), ["en"] = new(null) }));
        Assert.Contains("translations", errors.Keys);
    }

    [Fact]
    public void A_titled_locale_needs_an_author()
    {
        var errors = Validate(Paper(translations: new()
        {
            ["az"] = Titled(),
            ["en"] = new("Title", Authors: [" ", ""]),
        }));
        Assert.Equal(["translations.en.authors"], errors.Keys);
    }

    [Fact]
    public void Title_length_is_limited()
    {
        var title = new string('x', WorkingPaperRules.MaxTitleLength + 1);
        var errors = Validate(Paper(translations: new() { ["az"] = Titled() with { Title = title } }));
        Assert.Contains("translations.az.title", errors.Keys);
    }

    [Fact]
    public void Unknown_locale_is_rejected() =>
        Assert.Contains("translations", Validate(Paper(translations: new() { ["az"] = Titled(), ["ru"] = Titled() })).Keys);

    [Theory]
    [InlineData(UnknownId)]
    [InlineData(ImageId)]
    public void Media_must_be_an_existing_document(long mediaId) =>
        Assert.Contains("translations.az.mediaId", Validate(Paper(translations: new() { ["az"] = Titled(mediaId) })).Keys);

    [Fact]
    public void Media_of_an_untitled_locale_is_checked_too()
    {
        // The untitled translation is still stored with its file, so a bad id must not slip through.
        var errors = Validate(Paper(translations: new()
        {
            ["az"] = Titled(),
            ["en"] = new(null, MediaId: UnknownId),
        }));
        Assert.Equal(["translations.en.mediaId"], errors.Keys);
    }

    [Fact]
    public void Media_ids_cover_every_known_locale_once()
    {
        var dto = Paper(translations: new()
        {
            ["az"] = Titled(PdfId),
            ["en"] = new(null, MediaId: PdfId),
            ["ru"] = Titled(ImageId),
        });
        Assert.Equal([PdfId], WorkingPaperRules.MediaIds(dto));
    }

    [Fact]
    public void Normalize_trims_and_drops_blanks_and_repeats_keeping_the_first_spelling() =>
        Assert.Equal(["Smith", "jones"], WorkingPaperRules.Normalize([" Smith ", "", "jones", "SMITH", "Jones"]));

    [Fact]
    public void Normalize_upper_cases_jel_codes() =>
        Assert.Equal(["E58"], WorkingPaperRules.Normalize(["e58", "E58 "], upper: true));
}
