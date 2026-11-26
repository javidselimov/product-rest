using System.Text.Json;
using Cbar.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// Public, read-only view of the CMS settings the site needs. Values are written by
/// api-cbar-admin (<c>PUT /api/v1/settings/{key}</c>); only whitelisted keys are exposed here.
/// </summary>
[ApiController]
public class SiteSettingsController(CbarDbContext db) : ControllerBase
{
    private const string AccessibilityWidgetKey = "accessibility.widget";

    /// <summary>
    /// Whether the accessibility menu (accessibility.cert.gov.az widget) is shown on the site.
    /// Always 200: a missing row or malformed value means disabled (spec 007, data-model).
    /// </summary>
    [HttpGet("api/v1/site-settings/accessibility-widget")]
    public async Task<IActionResult> GetAccessibilityWidget()
    {
        var raw = await db.Settings.AsNoTracking()
            .Where(s => s.Key == AccessibilityWidgetKey)
            .Select(s => s.Value)
            .SingleOrDefaultAsync();

        return Ok(new { enabled = IsEnabled(raw) });
    }

    /// <summary>True only for a JSON object whose <c>enabled</c> property is the literal <c>true</c>.</summary>
    private static bool IsEnabled(string? raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return false;

        try
        {
            using var doc = JsonDocument.Parse(raw);
            return doc.RootElement.ValueKind == JsonValueKind.Object
                && doc.RootElement.TryGetProperty("enabled", out var enabled)
                && enabled.ValueKind == JsonValueKind.True;
        }
        catch (JsonException)
        {
            return false;
        }
    }
}
