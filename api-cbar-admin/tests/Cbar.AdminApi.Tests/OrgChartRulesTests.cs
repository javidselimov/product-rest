using Cbar.AdminApi.Controllers;
using Cbar.AdminApi.Services;

namespace Cbar.AdminApi.Tests;

/// <summary>Org chart (spec 060): the always-open setting and the sibling order.</summary>
public class OrgChartRulesTests
{
    private const short Governor = 1;
    private const short Deputy = 2;
    private const short Director = 3;
    private const short Block = 4;
    private const short Department = 5;
    private const short Group = 6;

    [Theory]
    [InlineData(Block)]
    [InlineData(Group)]
    public void A_block_or_group_may_keep_its_departments_open(short kind) =>
        Assert.Null(OrgChartController.ValidateDepartmentsOpen(kind, true));

    [Theory]
    [InlineData(Governor)]
    [InlineData(Deputy)]
    [InlineData(Director)]
    [InlineData(Department)]
    public void Any_other_kind_is_refused_when_open(short kind) =>
        Assert.NotNull(OrgChartController.ValidateDepartmentsOpen(kind, true));

    [Theory]
    [InlineData(Governor, false)]
    [InlineData(Director, null)]
    [InlineData(Block, false)]
    [InlineData(Department, null)]
    public void False_or_omitted_is_always_fine(short kind, bool? value) =>
        Assert.Null(OrgChartController.ValidateDepartmentsOpen(kind, value));

    [Fact]
    public void The_order_must_name_every_sibling_once() =>
        Assert.Null(ContentSupport.InvalidOrder([39, 37, 38], [37, 38, 39]));

    [Theory]
    [InlineData(new[] { 37, 38 })]
    [InlineData(new[] { 37, 38, 39, 40 })]
    [InlineData(new[] { 37, 37, 39 })]
    [InlineData(new[] { 37, 38, 41 })]
    public void A_missing_extra_repeated_or_foreign_id_is_refused(int[] ids) =>
        Assert.NotNull(ContentSupport.InvalidOrder(ids, [37, 38, 39]));
}
