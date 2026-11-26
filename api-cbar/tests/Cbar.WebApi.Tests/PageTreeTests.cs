using Cbar.WebApi.Controllers;
using static Cbar.WebApi.Controllers.PagesController;

namespace Cbar.WebApi.Tests;

/// <summary>
/// <see cref="PagesController.BuildTree"/>. The defaults for a page without <c>page_details</c> /
/// <c>page_nav_details</c> / <c>page_translation_details</c> rows are set in the SQL projection, so a row here
/// carries what the query returns for that case: ShowInSideNav true, ShowInDropdownNav and MenuGroup null.
/// </summary>
public class PageTreeTests
{
    private static PageRow Row(
        int id, int? parentId = null, bool showInSideNav = true, bool? showInDropdownNav = null, string? menuGroup = null,
        bool translated = true) =>
        new(id, parentId, null, showInSideNav, showInDropdownNav, menuGroup,
            translated ? $"Page {id}" : null, translated ? $"page-{id}" : null);

    [Fact]
    public void Menu_fields_are_passed_through()
    {
        var tree = BuildTree([
            Row(1),
            Row(2, parentId: 1, showInSideNav: false, showInDropdownNav: true, menuGroup: "Statistics"),
        ]);

        var root = Assert.Single(tree);
        Assert.Equal((true, (bool?)null, (string?)null), (root.ShowInSideNav, root.ShowInDropdownNav, root.MenuGroup));
        var child = Assert.Single(root.Children);
        Assert.Equal((false, (bool?)true, "Statistics"), (child.ShowInSideNav, child.ShowInDropdownNav, child.MenuGroup));
    }

    [Fact]
    public void Children_keep_the_given_order()
    {
        var tree = BuildTree([Row(1), Row(3, parentId: 1), Row(2, parentId: 1)]);

        Assert.Equal([3, 2], Assert.Single(tree).Children.Select(c => c.Id));
    }

    [Fact]
    public void An_untranslated_page_is_skipped_and_its_children_become_roots()
    {
        var tree = BuildTree([Row(1, translated: false), Row(2, parentId: 1), Row(3, parentId: 2)]);

        var root = Assert.Single(tree);
        Assert.Equal(2, root.Id);
        Assert.Equal(3, Assert.Single(root.Children).Id);
    }

    [Fact]
    public void A_page_whose_parent_is_missing_is_a_root() =>
        Assert.Equal([1, 5], BuildTree([Row(1), Row(5, parentId: 404)]).Select(n => n.Id));
}
