using Cbar.AdminApi.Controllers;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Tests;

public class StrategyDocRulesTests
{
    private const int PageId = 104;
    private const long ImageId = 11;
    private const long PdfId = 10;
    private const long UnknownId = 99;

    private static readonly Dictionary<long, string> Media = new()
    {
        [ImageId] = "image/png",
        [PdfId] = "application/pdf",
    };

    private static HomepageStrategyDocTranslationDto Titled(
        string? title = "Maliyyə sektorunun inkişaf Strategiyası", string? summary = null, long? coverMediaId = null,
        string? url = null) =>
        new(title, summary, coverMediaId, url);

    private static HomepageStrategyDocUpsertDto Doc(
        ContentStatus status = ContentStatus.Published, int? pageId = PageId,
        Dictionary<string, HomepageStrategyDocTranslationDto>? translations = null) =>
        new(status, pageId, translations ?? new() { ["az"] = Titled() });

    private static Dictionary<string, string[]> Validate(HomepageStrategyDocUpsertDto dto, bool pageExists = true) =>
        StrategyDocRules.Validate(dto, pageExists, Media);

    [Fact]
    public void A_document_with_a_page_passes() =>
        Assert.Empty(Validate(Doc(translations: new() { ["az"] = Titled(coverMediaId: ImageId), ["en"] = Titled("Strategy") })));

    [Fact]
    public void A_document_with_a_url_and_no_page_passes() =>
        Assert.Empty(Validate(Doc(pageId: null, translations: new() { ["az"] = Titled(url: "https://www.cbar.az/x") })));

    [Theory]
    [InlineData(ContentStatus.Scheduled)]
    [InlineData(ContentStatus.Archived)]
    public void Only_published_or_draft(ContentStatus status) =>
        Assert.Contains("status", Validate(Doc(status: status)).Keys);

    [Fact]
    public void A_draft_passes() => Assert.Empty(Validate(Doc(status: ContentStatus.Draft)));

    [Fact]
    public void An_unknown_locale_is_refused() =>
        Assert.Contains("translations", Validate(Doc(translations: new() { ["az"] = Titled(), ["ru"] = Titled() })).Keys);

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public void A_title_is_needed_in_one_locale(string? title) =>
        Assert.Contains("translations.az.title", Validate(Doc(translations: new() { ["az"] = Titled(title) })).Keys);

    [Fact]
    public void One_titled_locale_is_enough() =>
        Assert.Empty(Validate(Doc(translations: new() { ["az"] = Titled(null), ["en"] = Titled("Strategy") })));

    [Fact]
    public void Lengths_are_capped()
    {
        var errors = Validate(Doc(translations: new()
        {
            ["az"] = Titled(
                new string('a', StrategyDocRules.MaxTitleLength + 1),
                new string('b', StrategyDocRules.MaxSummaryLength + 1),
                url: "/" + new string('c', StrategyDocRules.MaxUrlLength)),
        }));
        Assert.Contains("translations.az.title", errors.Keys);
        Assert.Contains("translations.az.summary", errors.Keys);
        Assert.Contains("translations.az.url", errors.Keys);
    }

    [Fact]
    public void Lengths_at_the_cap_pass() =>
        Assert.Empty(Validate(Doc(translations: new()
        {
            ["az"] = Titled(new string('a', StrategyDocRules.MaxTitleLength), new string('b', StrategyDocRules.MaxSummaryLength)),
        })));

    [Theory]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("//evil.example", false)]
    [InlineData("www.cbar.az/x", false)]
    [InlineData("ftp://cbar.az", false)]
    [InlineData("/az/maliyye-sektorunun-inkisaf-strategiyasi", true)]
    [InlineData("https://www.cbar.az/x", true)]
    [InlineData("HTTP://cbar.az", true)]
    public void A_url_is_a_web_address_or_a_site_path(string url, bool valid) =>
        Assert.Equal(!valid, Validate(Doc(translations: new() { ["en"] = Titled(url: url) })).ContainsKey("translations.en.url"));

    [Fact]
    public void Without_a_page_a_titled_locale_needs_a_url() =>
        Assert.Contains("pageId", Validate(Doc(pageId: null)).Keys);

    [Fact]
    public void The_url_of_an_untitled_locale_does_not_count_as_a_link() =>
        Assert.Contains("pageId", Validate(Doc(pageId: null, translations: new()
        {
            ["az"] = Titled(),
            ["en"] = Titled(null, url: "https://www.cbar.az/en"),
        })).Keys);

    [Fact]
    public void An_unknown_page_is_refused() =>
        Assert.Contains("pageId", Validate(Doc(), pageExists: false).Keys);

    [Theory]
    [InlineData(PdfId)]
    [InlineData(UnknownId)]
    public void A_cover_must_be_an_existing_image(long mediaId) =>
        Assert.Contains("translations.en.coverMediaId", Validate(Doc(translations: new()
        {
            ["az"] = Titled(),
            ["en"] = Titled("Strategy", coverMediaId: mediaId),
        })).Keys);

    [Fact]
    public void Media_ids_are_those_of_every_known_locale() =>
        Assert.Equal([PdfId, ImageId], StrategyDocRules.MediaIds(Doc(translations: new()
        {
            ["az"] = Titled(coverMediaId: ImageId),
            ["en"] = Titled(null, coverMediaId: PdfId),
            ["ru"] = Titled(coverMediaId: UnknownId),
        })).Order());

    [Fact]
    public void A_null_body_dictionary_asks_for_a_title() =>
        Assert.Contains("translations.az.title", StrategyDocRules.Validate(
            new HomepageStrategyDocUpsertDto(ContentStatus.Published, PageId, null), true, Media).Keys);

    [Theory]
    [InlineData("https://cbar.az", true)]
    [InlineData("http://cbar.az", true)]
    [InlineData("/x", true)]
    [InlineData("//cbar.az", false)]
    [InlineData("javascript:alert(1)", false)]
    [InlineData("cbar.az", false)]
    public void IsAllowedLink_takes_web_addresses_and_site_paths(string link, bool allowed) =>
        Assert.Equal(allowed, ContentSupport.IsAllowedLink(link));
}
