using Cbar.WebApi.Controllers;

namespace Cbar.WebApi.Tests;

/// <summary>
/// <see cref="StrategyDocLinks"/>: where a homepage strategy card goes and which cover it shows (spec 057). The page slug
/// is only passed when the public site shows the page in the locale; the SQL projection decides that.
/// </summary>
public class StrategyDocLinksTests
{
    [Fact]
    public void The_locale_url_wins_over_the_page() =>
        Assert.Equal("https://www.cbar.az/x", StrategyDocLinks.Href(" https://www.cbar.az/x ", "maliyye-sektorunun-inkisaf-strategiyasi"));

    [Fact]
    public void A_site_path_url_is_kept_as_it_is() =>
        Assert.Equal("/az/strategiya", StrategyDocLinks.Href("/az/strategiya", null));

    [Fact]
    public void Without_a_url_the_page_slug_is_the_link() =>
        Assert.Equal("/maliyye-sektorunun-inkisaf-strategiyasi", StrategyDocLinks.Href(null, "maliyye-sektorunun-inkisaf-strategiyasi"));

    [Theory]
    [InlineData(null, null)]
    [InlineData("", "")]
    [InlineData("  ", null)]
    public void Without_either_there_is_no_link(string? url, string? slug) =>
        Assert.Null(StrategyDocLinks.Href(url, slug));

    [Fact]
    public void The_locale_cover_wins() => Assert.Equal("/media/12", StrategyDocLinks.Cover(12, 34));

    [Fact]
    public void Without_a_locale_cover_the_other_locale_cover_is_shown() => Assert.Equal("/media/34", StrategyDocLinks.Cover(null, 34));

    [Fact]
    public void Without_any_cover_there_is_none() => Assert.Null(StrategyDocLinks.Cover(null, null));
}
