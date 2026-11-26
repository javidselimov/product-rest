using Cbar.AdminApi.Controllers;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Tests;

/// <summary>Menu flags (spec 041, spec 054) and menu group labels of <see cref="PagesController"/>.</summary>
public class PageSettingsTests
{
    private static PageUpsertDto Dto(PageFlagsDto? flags = null, string? azMenuGroup = null) =>
        new(ParentId: null, SortOrder: 0, Status: ContentStatus.Published, ShowInFooter: false,
            Translations: new() { ["az"] = new("Səhifə", null, MenuGroup: azMenuGroup) },
            Flags: flags);

    private static Page Apply(PageFlagsDto? flags, Page? page = null, bool isCreate = false)
    {
        page ??= new Page();
        PagesController.ApplySettings(page, Dto(flags), isCreate);
        return page;
    }

    [Fact]
    public void Dropdown_flag_omitted_writes_no_row() =>
        Assert.Null(Apply(new PageFlagsDto(ShowInSideNav: false)).NavDetails);

    [Fact]
    public void Dropdown_flag_equal_to_the_left_menu_flag_writes_no_row()
    {
        Assert.Null(Apply(new PageFlagsDto(ShowInDropdownNav: true)).NavDetails);
        Assert.Null(Apply(new PageFlagsDto(ShowInSideNav: false, ShowInDropdownNav: false)).NavDetails);
    }

    [Fact]
    public void Dropdown_only_page_writes_both_rows()
    {
        var page = Apply(new PageFlagsDto(ShowInSideNav: false, ShowInDropdownNav: true));
        Assert.False(page.Details!.ShowInSideNav);
        Assert.True(page.NavDetails!.ShowInDropdownNav);
    }

    [Fact]
    public void Hidden_from_dropdown_only_writes_a_nav_row()
    {
        var page = Apply(new PageFlagsDto(ShowInDropdownNav: false));
        Assert.Null(page.Details);
        Assert.False(page.NavDetails!.ShowInDropdownNav);
    }

    [Fact]
    public void An_existing_nav_row_is_updated_even_to_the_followed_value()
    {
        var page = new Page { NavDetails = new PageNavDetail { ShowInDropdownNav = false } };
        Apply(new PageFlagsDto(ShowInDropdownNav: true), page);
        Assert.True(page.NavDetails!.ShowInDropdownNav);
    }

    [Fact]
    public void Flags_omitted_on_update_leave_the_page_untouched()
    {
        var page = new Page { Removable = false, NavDetails = new PageNavDetail { ShowInDropdownNav = true } };
        Apply(flags: null, page);
        Assert.False(page.Removable);
        Assert.True(page.NavDetails!.ShowInDropdownNav);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Menu_group_absent_or_cleared_is_valid(string? label) =>
        Assert.Empty(PagesController.ValidateMenuGroups(Dto(azMenuGroup: label)));

    [Fact]
    public void Menu_group_is_measured_after_trimming()
    {
        var label = $"  {new string('x', PagesController.MenuGroupMaxLength)}  ";
        Assert.Empty(PagesController.ValidateMenuGroups(Dto(azMenuGroup: label)));
    }

    [Fact]
    public void Menu_group_longer_than_the_column_is_a_field_error()
    {
        var label = new string('x', PagesController.MenuGroupMaxLength + 1);
        Assert.Equal(["translations.az.menuGroup"], PagesController.ValidateMenuGroups(Dto(azMenuGroup: label)).Keys);
    }
}
