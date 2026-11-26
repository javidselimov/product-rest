using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record IfiOrganizationTranslationDto(string Name, string? Mission, string? MembershipIntro, string? Content);
public record IfiOrganizationUpsertDto(
    long? LogoMediaId,
    string? WebsiteUrl,
    short? MemberSince,
    int SortOrder,
    ContentStatus Status,
    bool ShowAz,
    bool ShowEn,
    Dictionary<string, IfiOrganizationTranslationDto> Translations);
public record IfiMembershipTranslationDto(string Name);
public record IfiMembershipUpsertDto(DateOnly JoinedOn, Dictionary<string, IfiMembershipTranslationDto> Translations);
public record IfiMembershipOrderDto(List<long> Ids);

/// <summary>
/// International financial institutions (spec 044): the accordion cards of the cooperation page, and
/// their membership dates as a sub-resource, like the photos of a CSR project.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Ifi.Read)]
[Route("api/v1/ifi-organizations")]
public class IfiOrganizationsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string ImageMimePrefix = "image/";
    private const string AuditEntity = "ifi_organization";
    private const short MinYear = 1900;
    private const short MaxYear = 2100;
    private const int MaxNameLength = 255;
    private const int MaxIntroLength = 500;
    private const int MaxUrlLength = 500;

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null)
    {
        var query = db.IfiOrganizations.AsNoTracking();
        if (status is not null)
            query = query.Where(o => o.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o => o.Translations.Any(t => EF.Functions.ILike(t.Name, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(o => o.SortOrder).ThenBy(o => o.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(o => new
            {
                o.Id,
                Status = o.Status.ToString().ToLowerInvariant(),
                o.SortOrder,
                o.ShowAz,
                o.ShowEn,
                Name = o.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                       ?? o.Translations.Select(t => t.Name).FirstOrDefault(),
                o.MemberSince,
                MembershipCount = o.Memberships.Count,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await LoadAsync(id);
        return item is null ? NotFound() : Ok(await ToDetailDtoAsync(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Ifi.Create)]
    public async Task<IActionResult> Create(IfiOrganizationUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new IfiOrganization { CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.IfiOrganizations.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("ifi.create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await ToDetailDtoAsync((await LoadAsync(entity.Id))!));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Ifi.Update)]
    public async Task<IActionResult> Update(int id, IfiOrganizationUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.IfiOrganizations
            .Include(o => o.Translations)
            .SingleOrDefaultAsync(o => o.Id == id);
        if (entity is null)
            return NotFound();

        var before = await ToDetailDtoAsync((await LoadAsync(id))!);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("ifi.update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await ToDetailDtoAsync((await LoadAsync(id))!));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Ifi.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.IfiOrganizations.SingleOrDefaultAsync(o => o.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("ifi.delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/memberships")]
    [RequirePermission(Permissions.Ifi.Update)]
    public async Task<IActionResult> CreateMembership(int id, [FromBody] IfiMembershipUpsertDto dto)
    {
        if (InvalidMembership(dto) is { } message)
            return BadRequestProblem(message);

        var organization = await db.IfiOrganizations.Include(o => o.Memberships)
            .SingleOrDefaultAsync(o => o.Id == id);
        if (organization is null)
            return NotFound();

        var maxOrder = organization.Memberships.Count == 0 ? 0 : organization.Memberships.Max(m => m.SortOrder);
        var membership = new IfiMembership { SortOrder = maxOrder + 1 };
        ApplyMembership(membership, dto);
        organization.Memberships.Add(membership);

        await using var tx = await db.Database.BeginTransactionAsync();
        await db.SaveChangesAsync();
        audit.Log("ifi.membership_create", AuditEntity, id, after: new { membershipId = membership.Id, dto });
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id }, ToMembershipDto(membership));
    }

    [HttpPut("{id:int}/memberships/order")]
    [RequirePermission(Permissions.Ifi.Update)]
    public async Task<IActionResult> ReorderMemberships(int id, [FromBody] IfiMembershipOrderDto dto)
    {
        var organization = await db.IfiOrganizations.Include(o => o.Memberships)
            .SingleOrDefaultAsync(o => o.Id == id);
        if (organization is null)
            return NotFound();

        var current = organization.Memberships.Select(m => m.Id).ToHashSet();
        if (dto.Ids.Count != current.Count || !current.SetEquals(dto.Ids))
            return BadRequestProblem("ids must contain exactly the organization's memberships.");

        var before = organization.Memberships.OrderBy(m => m.SortOrder).ThenBy(m => m.Id).Select(m => m.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            organization.Memberships.Single(m => m.Id == dto.Ids[i]).SortOrder = i + 1;

        audit.Log("ifi.membership_reorder", AuditEntity, id, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/memberships/{membershipId:long}")]
    [RequirePermission(Permissions.Ifi.Update)]
    public async Task<IActionResult> UpdateMembership(int id, long membershipId, [FromBody] IfiMembershipUpsertDto dto)
    {
        if (InvalidMembership(dto) is { } message)
            return BadRequestProblem(message);

        var membership = await db.IfiMemberships.Include(m => m.Translations)
            .SingleOrDefaultAsync(m => m.Id == membershipId && m.OrganizationId == id && m.Organization.DeletedAt == null);
        if (membership is null)
            return NotFound();

        var before = ToMembershipDto(membership);
        ApplyMembership(membership, dto);

        audit.Log("ifi.membership_update", AuditEntity, id, before, new { membershipId, dto });
        await db.SaveChangesAsync();
        return Ok(ToMembershipDto(membership));
    }

    [HttpDelete("{id:int}/memberships/{membershipId:long}")]
    [RequirePermission(Permissions.Ifi.Update)]
    public async Task<IActionResult> DeleteMembership(int id, long membershipId)
    {
        var membership = await db.IfiMemberships
            .SingleOrDefaultAsync(m => m.Id == membershipId && m.OrganizationId == id && m.Organization.DeletedAt == null);
        if (membership is null)
            return NotFound();

        db.Remove(membership);
        audit.Log("ifi.membership_delete", AuditEntity, id, before: new { membershipId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<IfiOrganization?> LoadAsync(int id) => db.IfiOrganizations.AsNoTracking()
        .Include(o => o.Translations)
        .Include(o => o.Memberships).ThenInclude(m => m.Translations)
        .AsSplitQuery()
        .SingleOrDefaultAsync(o => o.Id == id);

    private Task<bool> IsImageAsync(long mediaId) =>
        db.MediaAssets.AnyAsync(m => m.Id == mediaId && m.MimeType.StartsWith(ImageMimePrefix));

    private static bool IsWebUrl(string url) =>
        Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);

    /// <summary>The first thing wrong with the request, or null. The media FK is conditional (0025), so the id is checked here.</summary>
    private async Task<string?> InvalidAsync(IfiOrganizationUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return "At least one language is required.";
        if (dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Name)))
            return "A name is required.";
        if (dto.Translations.Values.Any(t => t.Name.Length > MaxNameLength || t.MembershipIntro?.Length > MaxIntroLength))
            return "A name or a membership line is too long.";
        if (dto.Status == ContentStatus.Scheduled)
            return "An organization cannot be scheduled.";
        if (dto.MemberSince is { } year && (year < MinYear || year > MaxYear))
            return $"The membership year must be between {MinYear} and {MaxYear}.";
        if (!string.IsNullOrWhiteSpace(dto.WebsiteUrl) && (dto.WebsiteUrl.Length > MaxUrlLength || !IsWebUrl(dto.WebsiteUrl)))
            return "The website must be an http or https address.";
        if (dto.LogoMediaId is { } logoId && !await IsImageAsync(logoId))
            return "The logo must be an image.";
        return null;
    }

    private static string? InvalidMembership(IfiMembershipUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return "At least one language is required.";
        if (dto.Translations.Values.Any(t => string.IsNullOrWhiteSpace(t.Name) || t.Name.Length > MaxNameLength))
            return "A name of at most 255 characters is required.";
        return null;
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static void Apply(IfiOrganization entity, IfiOrganizationUpsertDto dto)
    {
        entity.LogoMediaId = dto.LogoMediaId;
        entity.WebsiteUrl = Blank(dto.WebsiteUrl);
        entity.MemberSince = dto.MemberSince;
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        entity.ShowAz = dto.ShowAz;
        entity.ShowEn = dto.ShowEn;

        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new IfiOrganizationTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Name = tr.Name.Trim();
            existing.Mission = Blank(tr.Mission);
            existing.MembershipIntro = Blank(tr.MembershipIntro);
            existing.Content = tr.Content;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static void ApplyMembership(IfiMembership membership, IfiMembershipUpsertDto dto)
    {
        membership.JoinedOn = dto.JoinedOn;
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = membership.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new IfiMembershipTranslation { Locale = locale };
                membership.Translations.Add(existing);
            }
            existing.Name = tr.Name.Trim();
        }
        membership.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToMembershipDto(IfiMembership m) => new
    {
        m.Id,
        m.JoinedOn,
        m.SortOrder,
        Translations = m.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };

    private async Task<object> ToDetailDtoAsync(IfiOrganization o)
    {
        var logo = o.LogoMediaId is { } logoId
            ? await db.MediaAssets.AsNoTracking().SingleOrDefaultAsync(m => m.Id == logoId)
            : null;

        return new
        {
            o.Id,
            o.LogoMediaId,
            Logo = logo is null ? null : new { MediaId = logo.Id, logo.OriginalName, logo.MimeType, logo.SizeBytes },
            o.WebsiteUrl,
            o.MemberSince,
            o.SortOrder,
            Status = o.Status.ToString().ToLowerInvariant(),
            o.ShowAz,
            o.ShowEn,
            o.CreatedAt,
            o.UpdatedAt,
            Translations = o.Translations.ToDictionary(
                t => t.Locale,
                t => new { t.Name, t.Mission, t.MembershipIntro, t.Content }),
            Memberships = o.Memberships.OrderBy(m => m.SortOrder).ThenBy(m => m.Id).Select(ToMembershipDto).ToList(),
        };
    }
}
