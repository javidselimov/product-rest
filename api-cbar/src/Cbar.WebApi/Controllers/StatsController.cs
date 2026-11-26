using System.Globalization;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class StatsController(CbarDbContext db) : ControllerBase
{
    /// <summary>AZIR interbank index values, optionally filtered by date range and term.</summary>
    [HttpGet("api/v1/azir")]
    public async Task<IActionResult> GetAzir(
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery] string? term = null)
    {
        var items = await db.AzirIndexValues.AsNoTracking()
            .Where(v => (from == null || v.ValueDate >= from)
                && (to == null || v.ValueDate <= to)
                && (term == null || v.Term == term))
            .OrderBy(v => v.ValueDate).ThenBy(v => v.Term)
            .Select(v => new
            {
                valueDate = v.ValueDate,
                term = v.Term,
                rate = v.Rate,
                // A value saved without details has no details row: nulls and not reserve plan.
                dealVolume = v.Details == null ? null : v.Details.DealVolume,
                dealCount = v.Details == null ? null : v.Details.DealCount,
                minRate = v.Details == null ? null : v.Details.MinRate,
                maxRate = v.Details == null ? null : v.Details.MaxRate,
                isReservePlan = v.Details != null && v.Details.IsReservePlan,
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// The AZIR page's "information about the 1D AZIR index" block (spec 021, data-model §4):
    /// 1D values with a rate above zero, independent of any date filter. A figure that cannot be
    /// computed is null; the others are still returned.
    /// </summary>
    [HttpGet("api/v1/azir/summary")]
    public async Task<IActionResult> GetAzirSummary()
    {
        var oneDay = db.AzirIndexValues.AsNoTracking().Where(v => v.Term == "1D" && v.Rate > 0);

        var last = await oneDay
            .OrderByDescending(v => v.ValueDate)
            .Select(v => new
            {
                v.ValueDate,
                v.Rate,
                Volume = v.Details == null ? null : v.Details.DealVolume,
                MinRate = v.Details == null ? null : v.Details.MinRate,
                MaxRate = v.Details == null ? null : v.Details.MaxRate,
            })
            .FirstOrDefaultAsync();

        // "Month end" and "year end" are taken relative to the latest value, not to today, so a
        // value from the last days of the previous month is not compared with itself.
        var monthEnd = last is null ? default : new DateOnly(last.ValueDate.Year, last.ValueDate.Month, 1).AddDays(-1);
        var yearEnd = last is null ? default : new DateOnly(last.ValueDate.Year - 1, 12, 31);

        var rateAtMonthEnd = last is null ? null : await RateOnOrBefore(oneDay, monthEnd);
        var rateAtYearEnd = last is null ? null : await RateOnOrBefore(oneDay, yearEnd);

        var withVolume = oneDay.Where(v => v.Details != null && v.Details.DealVolume != null);
        var volumeAtMonthEnd = last is null ? null : await withVolume
            .Where(v => v.ValueDate <= monthEnd)
            .OrderByDescending(v => v.ValueDate)
            .Select(v => v.Details!.DealVolume)
            .FirstOrDefaultAsync();

        // The legacy "past 1 year" volume range ran from 1 January of the previous year; kept as
        // it was (spec 021, clarification Q2). The container runs with TZ=Asia/Baku.
        var today = DateOnly.FromDateTime(DateTime.Now);
        var volumesSince = withVolume
            .Where(v => v.ValueDate >= new DateOnly(today.Year - 1, 1, 1) && v.ValueDate <= today)
            .Select(v => v.Details!.DealVolume);
        var volumeMin = await volumesSince.MinAsync();
        var volumeMax = await volumesSince.MaxAsync();

        decimal? volumeUsd = null;
        if (last?.Volume is { } volume)
        {
            var lastDate = last.ValueDate;
            var usd = await db.CurrencyRates.AsNoTracking()
                .Where(r => r.CurrencyCode == "USD" && r.RateDate <= lastDate)
                .OrderByDescending(r => r.RateDate)
                .Select(r => new { r.Rate, r.Currency.Nominal })
                .FirstOrDefaultAsync();
            if (usd is { Rate: > 0, Nominal: > 0 })
                volumeUsd = Math.Round(volume / (usd.Rate / usd.Nominal), 2, MidpointRounding.AwayFromZero);
        }

        return Ok(new
        {
            lastDate = last?.ValueDate,
            lastRate = Round(last?.Rate),
            rateChangeSinceMonthEnd = Round(last?.Rate - rateAtMonthEnd),
            rateChangeSinceYearEnd = Round(last?.Rate - rateAtYearEnd),
            lastMinRate = Round(last?.MinRate),
            lastMaxRate = Round(last?.MaxRate),
            lastVolume = Round(last?.Volume),
            volumeChangeSinceMonthEnd = Round(last?.Volume - volumeAtMonthEnd),
            volumeMinSincePrevYearStart = Round(volumeMin),
            volumeMaxSincePrevYearStart = Round(volumeMax),
            lastVolumeUsd = volumeUsd,
        });
    }

    private static Task<decimal?> RateOnOrBefore(IQueryable<Domain.Entities.AzirIndexValue> source, DateOnly date) =>
        source.Where(v => v.ValueDate <= date)
            .OrderByDescending(v => v.ValueDate)
            .Select(v => (decimal?)v.Rate)
            .FirstOrDefaultAsync();

    private static decimal? Round(decimal? value) =>
        value is null ? null : Math.Round(value.Value, 4, MidpointRounding.AwayFromZero);

    /// <summary>Monthly inflation parameters, optionally filtered by year.</summary>
    [HttpGet("api/v1/inflation")]
    public async Task<IActionResult> GetInflation([FromQuery] short? year = null)
    {
        var items = await db.MonthlyInflationParameters.AsNoTracking()
            .Where(p => year == null || p.Year == year)
            .OrderBy(p => p.Year).ThenBy(p => p.Month).ThenBy(p => p.ParameterCode)
            .Select(p => new
            {
                year = p.Year,
                month = p.Month,
                parameterCode = p.ParameterCode,
                value = p.Value,
            })
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>Homepage inflation summary: current rate, target (free text) and next update date.</summary>
    [HttpGet("api/v1/inflation/settings")]
    public async Task<IActionResult> GetInflationSettings()
    {
        var item = await db.InflationSettings.AsNoTracking()
            .Select(s => new
            {
                currentInflation = s.CurrentInflation,
                targetInflation = s.TargetInflation,
                nextUpdateDate = s.NextUpdateDate,
            })
            .SingleOrDefaultAsync();

        return item is null ? NotFound() : Ok(item);
    }

    /// <summary>
    /// Most recent yield curve: the latest date with curve points, with that date's Nelson-Siegel
    /// parameters and standard-tenor yields (each imported separately, so either may be null).
    /// </summary>
    [HttpGet("api/v1/yield-curves/latest")]
    public async Task<IActionResult> GetLatestYieldCurve()
    {
        var date = await db.YcYields.AsNoTracking()
            .OrderByDescending(y => y.CurveDate)
            .Select(y => (DateOnly?)y.CurveDate)
            .FirstOrDefaultAsync();

        return date is null ? NotFound() : Ok(await QueryCurve(date.Value));
    }

    /// <summary>Yield curve for a specific date; 404 when the date has no curve points.</summary>
    [HttpGet("api/v1/yield-curves/{date:datetime}")]
    public async Task<IActionResult> GetYieldCurveByDate(DateOnly date)
    {
        if (!await db.YcYields.AsNoTracking().AnyAsync(y => y.CurveDate == date))
            return NotFound();

        return Ok(await QueryCurve(date));
    }

    private async Task<object> QueryCurve(DateOnly date)
    {
        var parameters = await db.YcParameters.AsNoTracking()
            .Where(p => p.CurveDate == date)
            .Select(p => new { beta0 = p.Beta0, beta1 = p.Beta1, beta2 = p.Beta2, lambda = p.Lambda })
            .SingleOrDefaultAsync();

        // `period` stays a string, as the public contract had it before the tenor became days.
        var yields = (await db.YcYields.AsNoTracking()
                .Where(y => y.CurveDate == date)
                .OrderBy(y => y.Period)
                .Select(y => new { y.Period, y.Yield })
                .ToListAsync())
            .Select(y => new { period = y.Period.ToString(CultureInfo.InvariantCulture), yield = y.Yield })
            .ToList();

        var periods = await db.YcPeriods.AsNoTracking()
            .Where(p => p.CurveDate == date)
            .Select(p => new
            {
                threeMonth = p.ThreeMonth,
                sixMonth = p.SixMonth,
                nineMonth = p.NineMonth,
                oneYear = p.OneYear,
                twoYear = p.TwoYear,
                threeYear = p.ThreeYear,
                fourYear = p.FourYear,
            })
            .SingleOrDefaultAsync();

        return new { curveDate = date, parameters, yields, periods };
    }
}
