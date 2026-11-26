using Cbar.Domain.Entities;
using Cbar.WebApi.Controllers;

namespace Cbar.WebApi.Tests;

/// <summary>`GET /api/v1/events` order (spec 034, `sort=newest` spec 059), on in-memory rows.</summary>
public class EventOrderTests
{
    private static EventTranslation Row(string title, string startsOn, string? startTime = null) => new()
    {
        Title = title,
        Slug = title,
        Locale = "az",
        Event = new Event
        {
            StartsOn = DateOnly.Parse(startsOn),
            StartTime = startTime is null ? null : TimeOnly.Parse(startTime),
        },
    };

    private static readonly EventTranslation[] Rows =
    [
        Row("past", "2026-10-15", "11:00"),
        Row("far", "2027-01-20"),
        Row("same-day-early", "2026-11-28", "11:00"),
        Row("same-day-untimed", "2026-11-28"),
        Row("same-day-late", "2026-11-28", "15:00"),
        Row("older", "2026-09-01", "10:00"),
    ];

    private static string[] Titles(string? when, string? sort) =>
        EventsController.Ordered(Rows.AsQueryable(), when, sort).Select(t => t.Title).ToArray();

    [Fact]
    public void Newest_puts_the_latest_day_first_and_the_later_time_first_within_a_day()
    {
        Assert.Equal(
            ["far", "same-day-late", "same-day-early", "same-day-untimed", "past", "older"],
            Titles(when: null, sort: "newest"));
    }

    [Fact]
    public void Without_sort_the_list_runs_oldest_first_with_the_earlier_time_first()
    {
        Assert.Equal(
            ["older", "past", "same-day-early", "same-day-late", "same-day-untimed", "far"],
            Titles(when: null, sort: null));
    }

    [Fact]
    public void Past_without_sort_keeps_the_newest_day_first_with_the_earlier_time_first()
    {
        Assert.Equal(
            ["far", "same-day-early", "same-day-late", "same-day-untimed", "past", "older"],
            Titles(when: "past", sort: null));
    }

    [Fact]
    public void Titles_break_ties_on_the_same_day_and_time()
    {
        var rows = new[] { Row("b", "2026-11-28", "11:00"), Row("a", "2026-11-28", "11:00") };

        Assert.Equal(["a", "b"], EventsController.Ordered(rows.AsQueryable(), null, "newest").Select(t => t.Title));
    }
}
