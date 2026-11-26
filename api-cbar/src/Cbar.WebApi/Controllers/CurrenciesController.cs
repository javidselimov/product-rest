using System.Globalization;
using System.Text;
using System.Xml.Linq;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

[ApiController]
public class CurrenciesController(CbarDbContext db) : ControllerBase
{
    private static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

    /// <summary>The XML feed's "Bank metalları", in the legacy feed's order (product-host/visitor/views/currency/xml.php).</summary>
    private static readonly string[] MetalCodes = ["XPD", "XPT", "XAG", "XAU"];

    /// <summary>Official rates for a date (defaults to the latest published sheet).</summary>
    [HttpGet("api/v1/currencies")]
    public async Task<IActionResult> GetRates([FromQuery] DateOnly? date, [FromQuery] string locale = "az")
    {
        var rateDate = date ?? await LatestRateDateAsync();
        if (rateDate is null)
            return NotFound(new { message = "No rates published yet." });

        var rates = await db.CurrencyRates
            .Where(r => r.RateDate == rateDate)
            .OrderBy(r => r.Currency.SortOrder)
            .Select(r => new
            {
                code = r.CurrencyCode,
                nominal = r.Currency.Nominal,
                name = r.Currency.Translations
                    .Where(t => t.Locale == locale)
                    .Select(t => t.Name)
                    .FirstOrDefault(),
                rate = r.Rate,
                showOnHomepage = r.Currency.ShowOnHomepage,
            })
            .ToListAsync();

        return Ok(new { date = rateDate, rates });
    }

    /// <summary>
    /// Legacy public XML feed — byte-compatible contract consumed by third parties.
    /// URL shape and document structure must match the historical
    /// https://www.cbar.az/currencies/{DD.MM.YYYY}.xml exactly (golden-file tested).
    /// </summary>
    [HttpGet("currencies/{date}.xml")]
    public async Task<IActionResult> GetRatesXml(string date)
    {
        if (!DateOnly.TryParseExact(date, "dd.MM.yyyy", Inv, DateTimeStyles.None, out var rateDate))
            return BadRequest("Expected date format: DD.MM.YYYY");

        var rates = await db.CurrencyRates
            .Where(r => r.RateDate == rateDate)
            .OrderBy(r => r.Currency.SortOrder)
            .Select(r => new
            {
                r.CurrencyCode,
                r.Currency.Nominal,
                NameAz = r.Currency.Translations
                    .Where(t => t.Locale == "az")
                    .Select(t => t.Name)
                    .FirstOrDefault(),
                r.Rate,
            })
            .ToListAsync();

        if (rates.Count == 0)
            return NotFound();

        // Metals are never currencies: like the legacy feed they get their own block, first, in a
        // fixed order with a "1 t.u." nominal and the bare name — and a date without metals has
        // no such block, so its document is unchanged (spec 025, contracts/public-xml-feed.md).
        var metals = MetalCodes
            .Select(code => rates.FirstOrDefault(r => r.CurrencyCode == code))
            .Where(r => r is not null)
            .Select(r => new XElement("Valute",
                new XAttribute("Code", r!.CurrencyCode),
                new XElement("Nominal", "1 t.u."),
                new XElement("Name", r.NameAz),
                new XElement("Value", r.Rate.ToString("0.0000", Inv))))
            .ToList();

        // TODO(compat): verify element order, attribute names, and number formatting
        // against archived production responses before cutover.
        var doc = new XDocument(
            new XDeclaration("1.0", "UTF-8", null),
            new XElement("ValCurs",
                new XAttribute("Date", rateDate.ToString("dd.MM.yyyy", Inv)),
                new XAttribute("Name", "AZN məzənnələri"),
                metals.Count == 0 ? null : new XElement("ValType",
                    new XAttribute("Type", "Bank metalları"),
                    metals),
                new XElement("ValType",
                    new XAttribute("Type", "Xarici valyutalar"),
                    rates.Where(r => !MetalCodes.Contains(r.CurrencyCode)).Select(r => new XElement("Valute",
                        new XAttribute("Code", r.CurrencyCode),
                        new XElement("Nominal", r.Nominal.ToString(Inv)),
                        new XElement("Name", $"{r.Nominal} {r.NameAz}"),
                        new XElement("Value", r.Rate.ToString("0.0000", Inv)))))));

        return Content(doc.Declaration + Environment.NewLine + doc, "application/xml", Encoding.UTF8);
    }

    private async Task<DateOnly?> LatestRateDateAsync() =>
        await db.CurrencyRates
            .OrderByDescending(r => r.RateDate)
            .Select(r => (DateOnly?)r.RateDate)
            .FirstOrDefaultAsync();
}
