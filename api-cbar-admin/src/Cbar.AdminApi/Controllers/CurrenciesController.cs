using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

/// <summary>Update payload for a currency master record.</summary>
public record CurrencyMasterUpdateDto(bool ShowOnHomepage, int SortOrder, bool IsActive);

/// <summary>
/// Currency master records (the ISO set), distinct from the per-date rate sheets in
/// <see cref="CurrencyRatesController"/>. Lets editors choose which currencies appear on
/// the homepage card and in what order — replaces the old hardcoded frontend list.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Currencies.Read)]
[Route("api/v1/currencies")]
public class CurrenciesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.Currencies.AsNoTracking()
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Code)
            .Select(c => new
            {
                code = c.Code,
                nominal = c.Nominal,
                sortOrder = c.SortOrder,
                isActive = c.IsActive,
                showOnHomepage = c.ShowOnHomepage,
                nameAz = c.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault(),
                nameEn = c.Translations.Where(t => t.Locale == "en").Select(t => t.Name).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items });
    }

    [HttpPut("{code}")]
    [RequirePermission(Permissions.Currencies.Update)]
    public async Task<IActionResult> Update(string code, CurrencyMasterUpdateDto dto)
    {
        var currency = await db.Currencies.FirstOrDefaultAsync(c => c.Code == code);
        if (currency is null)
            return NotFoundProblem($"Unknown currency '{code}'.");

        var before = new { code, currency.ShowOnHomepage, currency.SortOrder, currency.IsActive };
        currency.ShowOnHomepage = dto.ShowOnHomepage;
        currency.SortOrder = dto.SortOrder;
        currency.IsActive = dto.IsActive;

        audit.Log("currencies.update", "currency", 0,
            before: before,
            after: new { code, dto.ShowOnHomepage, dto.SortOrder, dto.IsActive });
        await db.SaveChangesAsync();
        return NoContent();
    }
}
