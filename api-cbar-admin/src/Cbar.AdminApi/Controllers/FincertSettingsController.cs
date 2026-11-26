using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FincertSettingsTranslationDto(
    string? Mission, string? PortalTitle, string? PortalDescription, long? RfcMediaId, string? RfcUrl);

public record FincertSettingsUpdateDto(
    string? Email, string? Phone, string? PortalUrl, Dictionary<string, FincertSettingsTranslationDto>? Translations);

/// <summary>
/// The single FinCERT settings record (spec 053): contacts, the reporting portal, the RFC-2350 document and the
/// mission. <c>PUT</c> creates it on first save. Unlike the other sections a locale left out of <c>translations</c> is
/// kept, because the panel form may save one language tab at a time. Field failures name the field in <c>errors</c>.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Fincert.Read)]
[Route("api/v1/fincert/settings")]
public class FincertSettingsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "fincert_settings";

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) => Ok(await DetailAsync(ct));

    [HttpPut]
    [RequirePermission(Permissions.Fincert.Update)]
    public async Task<IActionResult> Update(FincertSettingsUpdateDto dto, CancellationToken ct)
    {
        var entity = await db.FincertSettings.Include(s => s.Translations)
            .SingleOrDefaultAsync(s => s.Id == FincertSettings.SingletonId, ct);
        var errors = await ValidateAsync(dto, entity, ct);
        if (errors.Count > 0)
            return FieldValidationProblem(errors);

        var before = await DetailAsync(ct);
        if (entity is null)
        {
            entity = new FincertSettings();
            db.FincertSettings.Add(entity);
        }
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        await db.SaveChangesAsync(ct);
        audit.Log("fincert.settings_update", AuditEntity, FincertSettings.SingletonId, before, dto);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return Ok(await DetailAsync(ct));
    }

    private async Task<Dictionary<string, string[]>> ValidateAsync(FincertSettingsUpdateDto dto, FincertSettings? stored, CancellationToken ct)
    {
        var errors = new Dictionary<string, string[]>();
        void Fail(string field, string message) => errors.TryAdd(field, [message]);

        var email = FincertSupport.Blank(dto.Email);
        if (email is not null && (email.Length > FincertSupport.MaxEmailLength || !FincertSupport.IsEmail(email)))
            Fail("email", "E-poçt ünvanı düzgün deyil (məs. fincert@cbar.az).");
        if (FincertSupport.Blank(dto.Phone)?.Length > FincertSupport.MaxPhoneLength)
            Fail("phone", $"Telefon ən çox {FincertSupport.MaxPhoneLength} simvol ola bilər.");
        var portalUrl = FincertSupport.Blank(dto.PortalUrl);
        if (portalUrl is not null && (portalUrl.Length > FincertSupport.MaxUrlLength || !FincertSupport.IsWebUrl(portalUrl)))
            Fail("portalUrl", "Portalın ünvanı http:// və ya https:// ilə başlayan tam link olmalıdır.");

        var translations = dto.Translations ?? [];
        foreach (var (locale, tr) in translations)
        {
            var path = $"translations.{locale}";
            if (!ContentSupport.Locales.Contains(locale))
            {
                Fail("translations", "Yalnız az və en dilləri qəbul olunur.");
                continue;
            }
            if (FincertSupport.Blank(tr.PortalTitle)?.Length > FincertSupport.MaxNameLength)
                Fail($"{path}.portalTitle", $"Portalın adı ən çox {FincertSupport.MaxNameLength} simvol ola bilər.");
            if (FincertSupport.Blank(tr.PortalDescription)?.Length > FincertSupport.MaxDescriptionLength)
                Fail($"{path}.portalDescription", $"Təsvir ən çox {FincertSupport.MaxDescriptionLength} simvol ola bilər.");
            var rfcUrl = FincertSupport.Blank(tr.RfcUrl);
            if (rfcUrl is not null && (rfcUrl.Length > FincertSupport.MaxUrlLength || !FincertSupport.IsWebUrl(rfcUrl)))
                Fail($"{path}.rfcUrl", "Link http:// və ya https:// ilə başlayan tam ünvan olmalıdır.");
            // The media FK is conditional (0036), so the id is checked here; MediaAssets' filter hides deleted files.
            if (tr.RfcMediaId is { } mediaId)
            {
                var mime = await db.MediaAssets.Where(m => m.Id == mediaId).Select(m => m.MimeType).SingleOrDefaultAsync(ct);
                if (mime is null || !MediaUploadRules.DocumentMimeTypes.Contains(mime))
                    Fail($"{path}.rfcMediaId", "RFC-2350 üçün sənəd faylı seçin (PDF, Word, Excel, ZIP).");
            }
        }

        // A portal card needs an address: check the titles as they will be stored, kept locales included.
        var titled = ContentSupport.Locales.Where(locale => translations.TryGetValue(locale, out var tr)
            ? FincertSupport.Blank(tr.PortalTitle) is not null
            : stored?.Translations.Any(t => t.Locale == locale && t.PortalTitle is not null) == true);
        if (portalUrl is null && titled.Any())
            Fail("portalUrl", "Portalın adı yazılıbsa, ünvanı da yazılmalıdır.");

        return errors;
    }

    private static void Apply(FincertSettings entity, FincertSettingsUpdateDto dto)
    {
        entity.Email = FincertSupport.Blank(dto.Email);
        entity.Phone = FincertSupport.Blank(dto.Phone);
        entity.PortalUrl = FincertSupport.Blank(dto.PortalUrl);

        foreach (var (locale, tr) in dto.Translations ?? [])
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FincertSettingsTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Mission = FincertSupport.Blank(tr.Mission);
            existing.PortalTitle = FincertSupport.Blank(tr.PortalTitle);
            existing.PortalDescription = FincertSupport.Blank(tr.PortalDescription);
            existing.RfcMediaId = tr.RfcMediaId;
            existing.RfcUrl = FincertSupport.Blank(tr.RfcUrl);
        }
    }

    private async Task<object> DetailAsync(CancellationToken ct)
    {
        var s = await db.FincertSettings.AsNoTracking()
            .Include(x => x.Translations).ThenInclude(t => t.RfcMedia)
            .SingleOrDefaultAsync(x => x.Id == FincertSettings.SingletonId, ct);

        return new
        {
            Email = s?.Email,
            Phone = s?.Phone,
            PortalUrl = s?.PortalUrl,
            UpdatedAt = s?.UpdatedAt,
            Translations = (s?.Translations ?? []).ToDictionary(t => t.Locale, t => new
            {
                t.Mission,
                t.PortalTitle,
                t.PortalDescription,
                t.RfcMediaId,
                t.RfcUrl,
                RfcFile = t.RfcMedia is { } m
                    ? new { MediaId = m.Id, m.OriginalName, m.MimeType, m.SizeBytes }
                    : null,
            }),
        };
    }
}
