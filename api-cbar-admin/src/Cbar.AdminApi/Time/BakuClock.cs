namespace Cbar.AdminApi.Time;

/// <summary>
/// The calendar day in Baku. Azerbaijan has no DST, so a fixed offset is exact and needs no tzdata in
/// the container. A copy of api-cbar's <c>Cbar.WebApi.Time.BakuClock</c> (the two APIs share no
/// package); used by the AZIR import to refuse a file dated after today (spec 058).
/// </summary>
public static class BakuClock
{
    public static readonly TimeSpan Offset = TimeSpan.FromHours(4);

    public static DateOnly Today() => DateOnly.FromDateTime(DateTime.UtcNow + Offset);
}
