using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FincertMembershipTranslationDto(string? Name, string? Description, string? Badge);
public record FincertMembershipUpsertDto(
    ContentStatus Status, long? LogoMediaId, string? Url, Dictionary<string, FincertMembershipTranslationDto> Translations);

/// <summary>
/// FinCERT international memberships (spec 053), the logo cards of the "Beynəlxalq əməkdaşlıq" block (e.g. FIRST). A
/// language is stored when it has a name; one without a name is not stored.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Fincert.Read)]
[Route("api/v1/fincert/memberships")]
public class FincertMembershipsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "fincert_membership";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        CancellationToken ct = default)
    {
        var query = db.FincertMemberships.AsNoTracking();
        if (status is not null)
            query = query.Where(m => m.Status == status);
        if (LikePattern.TooLong(search) is { } tooLong)
            return BadRequestProblem(tooLong);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = LikePattern.Contains(search);
            query = query.Where(m => m.Translations.Any(t => EF.Functions.ILike(t.Name, pattern, LikePattern.Escape)));
        }

        var w = paging.Resolve(20);
        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(m => new
            {
                m.Id,
                m.SortOrder,
                m.Status,
                Shown = m.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).Select(t => new { t.Name, t.Badge }).FirstOrDefault(),
                Logo = m.LogoMedia == null
                    ? null
                    : new { MediaId = m.LogoMedia.Id, m.LogoMedia.OriginalName, m.LogoMedia.MimeType, m.LogoMedia.SizeBytes },
                m.Url,
                Locales = m.Translations.Select(t => t.Locale).ToList(),
                m.UpdatedAt,
            })
            .AsSplitQuery()
            .ToListAsync(ct);

        var items = rows.Select(r => new
        {
            r.Id,
            r.SortOrder,
            Status = r.Status.ToString().ToLowerInvariant(),
            Name = r.Shown?.Name,
            Badge = r.Shown?.Badge,
            r.Logo,
            r.Url,
            Locales = ContentSupport.Locales.Where(r.Locales.Contains).ToList(),
            r.UpdatedAt,
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var detail = await DetailAsync(id, ct);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost]
    [RequirePermission(Permissions.Fincert.Create)]
    public async Task<IActionResult> Create(FincertMembershipUpsertDto dto, CancellationToken ct)
    {
        if (await InvalidAsync(dto, ct) is { } message)
            return BadRequestProblem(message);

        var maxOrder = await db.FincertMemberships.MaxAsync(m => (int?)m.SortOrder, ct) ?? 0;
        var entity = new FincertMembership { SortOrder = maxOrder + 1, CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        db.FincertMemberships.Add(entity);
        await db.SaveChangesAsync(ct);
        audit.Log("fincert.membership_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id, ct));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Fincert.Update)]
    public async Task<IActionResult> Update(int id, FincertMembershipUpsertDto dto, CancellationToken ct)
    {
        if (await InvalidAsync(dto, ct) is { } message)
            return BadRequestProblem(message);

        var entity = await db.FincertMemberships.Include(m => m.Translations).SingleOrDefaultAsync(m => m.Id == id, ct);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id, ct);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("fincert.membership_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync(ct);
        return Ok(await DetailAsync(id, ct));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Fincert.Delete)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.FincertMemberships.SingleOrDefaultAsync(m => m.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("fincert.membership_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("order")]
    [RequirePermission(Permissions.Fincert.Update)]
    public async Task<IActionResult> Reorder([FromBody] FincertOrderDto dto, CancellationToken ct)
    {
        var memberships = await db.FincertMemberships.OrderBy(m => m.SortOrder).ThenBy(m => m.Id).ToListAsync(ct);
        if (ContentSupport.InvalidOrder(dto.Ids, memberships.Select(m => m.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = memberships.Select(m => m.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            memberships.Single(m => m.Id == dto.Ids[i]).SortOrder = i + 1;

        // The whole list changes, not one membership: entity id 0.
        audit.Log("fincert.membership_reorder", AuditEntity, 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>The first thing wrong with the request, or null. The media FK is conditional (0036), so the id is checked here.</summary>
    private async Task<string?> InvalidAsync(FincertMembershipUpsertDto dto, CancellationToken ct)
    {
        if (dto.Status == ContentStatus.Scheduled)
            return "Üzvlük planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.";
        if (dto.Translations.Keys.Any(k => !ContentSupport.Locales.Contains(k)))
            return "Yalnız az və en dilləri qəbul olunur.";
        if (!dto.Translations.Values.Any(t => !string.IsNullOrWhiteSpace(t.Name)))
            return "Təşkilatın ən azı bir dildə adı olmalıdır.";
        if (dto.Translations.Values.Any(t => t.Name?.Trim().Length > FincertSupport.MaxNameLength))
            return $"Ad ən çox {FincertSupport.MaxNameLength} simvol ola bilər.";
        if (dto.Translations.Values.Any(t => t.Description?.Trim().Length > FincertSupport.MaxDescriptionLength))
            return $"Təsvir ən çox {FincertSupport.MaxDescriptionLength} simvol ola bilər.";
        if (dto.Translations.Values.Any(t => t.Badge?.Trim().Length > FincertSupport.MaxBadgeLength))
            return $"Nişan ən çox {FincertSupport.MaxBadgeLength} simvol ola bilər.";
        var url = FincertSupport.Blank(dto.Url);
        if (url is not null && (url.Length > FincertSupport.MaxUrlLength || !FincertSupport.IsWebUrl(url)))
            return "Link http:// və ya https:// ilə başlayan tam ünvan olmalıdır.";
        if (dto.LogoMediaId is { } logoId
            && !await db.MediaAssets.AnyAsync(m => m.Id == logoId && m.MimeType.StartsWith(MediaUploadRules.ImageMimePrefix), ct))
            return "Loqo üçün şəkil faylı seçin.";
        return null;
    }

    private static void Apply(FincertMembership entity, FincertMembershipUpsertDto dto)
    {
        entity.Status = dto.Status;
        entity.LogoMediaId = dto.LogoMediaId;
        entity.Url = FincertSupport.Blank(dto.Url);

        var named = dto.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Value.Name)).ToDictionary();
        foreach (var (locale, tr) in named)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FincertMembershipTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Name = tr.Name!.Trim();
            existing.Description = FincertSupport.Blank(tr.Description);
            existing.Badge = FincertSupport.Blank(tr.Badge);
        }
        entity.Translations.RemoveAll(t => !named.ContainsKey(t.Locale));
    }

    private async Task<object?> DetailAsync(int id, CancellationToken ct)
    {
        var m = await db.FincertMemberships.AsNoTracking()
            .Include(x => x.Translations).Include(x => x.LogoMedia)
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        if (m is null)
            return null;
        return new
        {
            m.Id,
            m.SortOrder,
            Status = m.Status.ToString().ToLowerInvariant(),
            m.LogoMediaId,
            Logo = m.LogoMedia is { } logo
                ? new { MediaId = logo.Id, logo.OriginalName, logo.MimeType, logo.SizeBytes }
                : null,
            m.Url,
            m.CreatedAt,
            m.UpdatedAt,
            Translations = m.Translations.ToDictionary(t => t.Locale, t => new { t.Name, t.Description, t.Badge }),
        };
    }
}
