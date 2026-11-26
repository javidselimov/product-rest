using System.Text.RegularExpressions;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// FinCERT page (spec 053). One response carries the whole page: mission, contacts, the reporting portal, the RFC-2350
/// document, the activity directions and the international memberships. CMS page 133 still gives the title and the
/// address, and its text is the site's fallback when everything here is empty, so an empty FinCERT is 200, not 404.
/// </summary>
[ApiController]
public partial class FincertController(CbarDbContext db) : ControllerBase
{
    private record RfcFileRow(long Id, string MimeType, long SizeBytes);

    private record SettingsTranslationRow(
        string? Mission, string? PortalTitle, string? PortalDescription, string? RfcUrl, RfcFileRow? RfcFile);

    private record SettingsRow(string? Email, string? Phone, string? PortalUrl, SettingsTranslationRow? Translation);

    private record DirectionItem(int Id, string Title, string Body);

    private record MembershipRow(int Id, string Name, string? Description, string? Badge, string? Url, long? LogoId);

    [HttpGet("api/v1/fincert")]
    public async Task<IActionResult> Get([FromQuery] string locale = "az", CancellationToken ct = default)
    {
        locale = Normalize(locale);

        var settings = await LoadSettingsAsync(locale, ct);
        var directions = await LoadDirectionsAsync(locale, ct);
        var memberships = await LoadMembershipsAsync(locale, ct);

        return Ok(BuildResponse(settings, directions, memberships));
    }

    private Task<SettingsRow?> LoadSettingsAsync(string locale, CancellationToken ct) =>
        db.FincertSettings.AsNoTracking()
            .Where(s => s.Id == FincertSettings.SingletonId)
            .Select(s => new SettingsRow(
                s.Email,
                s.Phone,
                s.PortalUrl,
                s.Translations.Where(t => t.Locale == locale).Select(t => new SettingsTranslationRow(
                    t.Mission,
                    t.PortalTitle,
                    t.PortalDescription,
                    t.RfcUrl,
                    // MediaAsset's query filter turns a deleted file into null here.
                    t.RfcMedia == null ? null : new RfcFileRow(t.RfcMedia.Id, t.RfcMedia.MimeType, t.RfcMedia.SizeBytes)))
                    .FirstOrDefault()))
            .FirstOrDefaultAsync(ct);

    private async Task<List<DirectionItem>> LoadDirectionsAsync(string locale, CancellationToken ct)
    {
        var rows = await db.FincertDirections.AsNoTracking()
            .Where(d => d.Status == ContentStatus.Published)
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .SelectMany(d => d.Translations
                .Where(t => t.Locale == locale && t.Title.Trim() != "")
                .Select(t => new DirectionItem(d.Id, t.Title, t.Body)))
            .ToListAsync(ct);
        // A body that is only markup (an empty paragraph the editor left) would show an empty accordion; the tag check
        // is done here because Postgres has no HTML-aware trim.
        return rows.Where(d => HasText(d.Body)).ToList();
    }

    private Task<List<MembershipRow>> LoadMembershipsAsync(string locale, CancellationToken ct) =>
        db.FincertMemberships.AsNoTracking()
            .Where(m => m.Status == ContentStatus.Published)
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Id)
            .SelectMany(m => m.Translations
                .Where(t => t.Locale == locale && t.Name.Trim() != "")
                .Select(t => new MembershipRow(
                    m.Id,
                    t.Name,
                    t.Description,
                    t.Badge,
                    m.Url,
                    m.LogoMedia == null ? (long?)null : m.LogoMedia.Id)))
            .ToListAsync(ct);

    /// <summary>
    /// Shapes the response. Pure: no database access, so the null rules (portal needs both URL and title, rfc is null
    /// only without file and link, blank strings become null) live in one place.
    /// </summary>
    private static object BuildResponse(
        SettingsRow? settings, IReadOnlyList<DirectionItem> directions, IReadOnlyList<MembershipRow> memberships)
    {
        var tr = settings?.Translation;
        var portalUrl = Blank(settings?.PortalUrl);
        var portalTitle = Blank(tr?.PortalTitle);
        var rfcUrl = Blank(tr?.RfcUrl);
        var rfcFile = tr?.RfcFile is { } file
            ? new { url = MediaPath(file.Id), mimeType = file.MimeType, sizeBytes = file.SizeBytes }
            : null;

        return new
        {
            mission = Blank(tr?.Mission),
            email = Blank(settings?.Email),
            phone = Blank(settings?.Phone),
            portal = portalUrl is not null && portalTitle is not null
                ? new { title = portalTitle, description = Blank(tr?.PortalDescription), url = portalUrl }
                : null,
            rfc = rfcFile is not null || rfcUrl is not null ? new { file = rfcFile, url = rfcUrl } : null,
            directions,
            memberships = memberships.Select(m => new
            {
                m.Id,
                m.Name,
                Description = Blank(m.Description),
                Badge = Blank(m.Badge),
                Url = Blank(m.Url),
                Logo = m.LogoId is { } logo ? MediaPath(logo) : null,
            }),
        };
    }

    private static string Normalize(string? locale) => locale == "en" ? "en" : "az";

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static bool HasText(string html) =>
        !string.IsNullOrWhiteSpace(Tags().Replace(html, " ").Replace("&nbsp;", " ", StringComparison.OrdinalIgnoreCase));

    private static string MediaPath(long id) => $"/media/{id}";

    [GeneratedRegex("<[^>]*>")]
    private static partial Regex Tags();
}
