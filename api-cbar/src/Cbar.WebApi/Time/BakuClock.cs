namespace Cbar.WebApi.Time;

/// <summary>
/// The calendar day in Baku. Azerbaijan has no DST, so a fixed offset is exact and needs no tzdata in
/// the container. Shared by the events list and the release schedule's decision dates (spec 034, 039).
/// </summary>
public static class BakuClock
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(4);

    public static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow + Offset);
}
