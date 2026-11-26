using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record DivisionTranslationDto(string Name, string? Description, long? RegulationMediaId = null);
public record DivisionUpsertDto(
    int SortOrder,
    bool IsActive,
    long? MediaId,
    Dictionary<string, DivisionTranslationDto> Translations);

public record OfficeTranslationDto(string Name, string? Address, string? Phone, string? DirectorName, long? RegulationMediaId);
public record OfficeUpsertDto(
    int SortOrder,
    bool IsActive,
    long? PhotoMediaId,
    Dictionary<string, OfficeTranslationDto> Translations);

public record StaffTranslationDto(string FullName, string? Position, string? ReceptionDays, string? Bio);
public record StaffUpsertDto(
    short Type,
    int SortOrder,
    bool IsActive,
    string? Phone,
    long? PhotoMediaId,
    Dictionary<string, StaffTranslationDto> Translations);
public record StaffAttachPhotoDto(long MediaId);
public record StaffPhotoOrderDto(List<long> PhotoIds);

[ApiController]
[RequirePermission(Permissions.Organization.Read)]
[Route("api/v1/organization/divisions")]
public class OrganizationDivisionsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.OrganizationDivisions.AsNoTracking()
            .Include(d => d.Translations).ThenInclude(t => t.Details).ThenInclude(x => x!.RegulationMedia)
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.OrganizationDivisions.AsNoTracking()
            .Include(d => d.Translations).ThenInclude(t => t.Details).ThenInclude(x => x!.RegulationMedia)
            .SingleOrDefaultAsync(d => d.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Organization.Create)]
    public async Task<IActionResult> Create(DivisionUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (!await MediaExistsAsync(dto))
            return BadRequestProblem("Media asset not found.");

        var entity = new OrganizationDivision
        {
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            MediaId = dto.MediaId,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.OrganizationDivisions.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("organization_divisions.create", "organization_division", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> Update(int id, DivisionUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.OrganizationDivisions
            .Include(d => d.Translations).ThenInclude(t => t.Details).ThenInclude(x => x!.RegulationMedia)
            .SingleOrDefaultAsync(d => d.Id == id);
        if (entity is null)
            return NotFound();
        if (!await MediaExistsAsync(dto))
            return BadRequestProblem("Media asset not found.");

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.MediaId = dto.MediaId;
        ApplyTranslations(entity, dto);

        audit.Log("organization_divisions.update", "organization_division", entity.Id, before, dto);
        await db.SaveChangesAsync();
        // The regulation name in the response must reflect the ids just written, not the
        // navigation loaded before the update.
        foreach (var tr in entity.Translations)
            await db.Entry(tr.Details!).Reference(d => d.RegulationMedia).LoadAsync();
        return Ok(ToDetailDto(entity));
    }

    /// <summary>Every media id in the payload (image + per-locale regulation) must exist.</summary>
    private async Task<bool> MediaExistsAsync(DivisionUpsertDto dto)
    {
        var ids = dto.Translations.Values
            .Select(t => t.RegulationMediaId)
            .Append(dto.MediaId)
            .OfType<long>()
            .Distinct()
            .ToList();
        if (ids.Count == 0)
            return true;
        var found = await db.MediaAssets.CountAsync(m => ids.Contains(m.Id));
        return found == ids.Count;
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Organization.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        // Translation details loaded so EF deletes them with the division: the database FK (and
        // its cascade) exists only where the migration role may reference the translations table
        // (0016-organization-division-translation-details.sql).
        var entity = await db.OrganizationDivisions
            .Include(d => d.Translations).ThenInclude(t => t.Details)
            .SingleOrDefaultAsync(d => d.Id == id);
        if (entity is null)
            return NotFound();

        db.OrganizationDivisions.Remove(entity);
        audit.Log("organization_divisions.delete", "organization_division", entity.Id);
        await db.SaveChangesAsync();
        // Where 0015 could not add the FK, nothing else unlinks the chart nodes.
        await db.OrgChartNodes.Where(n => n.DivisionId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.DivisionId, (int?)null));
        return NoContent();
    }

    private static void ApplyTranslations(OrganizationDivision entity, DivisionUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new OrganizationDivisionTranslation
                {
                    Locale = locale,
                    Name = tr.Name,
                    Description = tr.Description,
                    Details = new OrganizationDivisionTranslationDetail { RegulationMediaId = tr.RegulationMediaId },
                });
            }
            else
            {
                existing.Name = tr.Name;
                existing.Description = tr.Description;
                var details = existing.Details ??= new OrganizationDivisionTranslationDetail();
                if (details.RegulationMediaId != tr.RegulationMediaId)
                    details.RegulationMedia = null;
                details.RegulationMediaId = tr.RegulationMediaId;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(OrganizationDivision d) => new
    {
        d.Id,
        d.SortOrder,
        d.IsActive,
        d.MediaId,
        d.UpdatedAt,
        Translations = d.Translations.ToDictionary(t => t.Locale, t => new
        {
            t.Name,
            t.Description,
            RegulationMediaId = t.Details?.RegulationMediaId,
            // Shown next to the media picker in the panel — the detail DTO has no mime/preview for documents.
            RegulationName = t.Details?.RegulationMedia?.OriginalName,
        }),
    };
}

[ApiController]
[RequirePermission(Permissions.Organization.Read)]
[Route("api/v1/organization/offices")]
public class OrganizationOfficesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.OrganizationOffices.AsNoTracking()
            .Include(o => o.Details)
            .Include(o => o.Translations).ThenInclude(t => t.Details).ThenInclude(d => d!.RegulationMedia)
            .OrderBy(o => o.SortOrder).ThenBy(o => o.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.OrganizationOffices.AsNoTracking()
            .Include(o => o.Details)
            .Include(o => o.Translations).ThenInclude(t => t.Details).ThenInclude(d => d!.RegulationMedia)
            .SingleOrDefaultAsync(o => o.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Organization.Create)]
    public async Task<IActionResult> Create(OfficeUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (!await MediaExistsAsync(dto))
            return BadRequestProblem("Media asset not found.");

        var entity = new OrganizationOffice
        {
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            Details = new OrganizationOfficeDetail { PhotoMediaId = dto.PhotoMediaId },
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.OrganizationOffices.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("organization_offices.create", "organization_office", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> Update(int id, OfficeUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.OrganizationOffices
            .Include(o => o.Details)
            .Include(o => o.Translations).ThenInclude(t => t.Details).ThenInclude(d => d!.RegulationMedia)
            .SingleOrDefaultAsync(o => o.Id == id);
        if (entity is null)
            return NotFound();
        if (!await MediaExistsAsync(dto))
            return BadRequestProblem("Media asset not found.");

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.Details ??= new OrganizationOfficeDetail();
        entity.Details.PhotoMediaId = dto.PhotoMediaId;
        ApplyTranslations(entity, dto);

        audit.Log("organization_offices.update", "organization_office", entity.Id, before, dto);
        await db.SaveChangesAsync();
        // The regulation name in the response must reflect the ids just written, not the
        // navigation loaded before the update.
        foreach (var tr in entity.Translations)
            await db.Entry(tr.Details!).Reference(d => d.RegulationMedia).LoadAsync();
        return Ok(ToDetailDto(entity));
    }

    /// <summary>Every media id in the payload (photo + per-locale regulation) must exist.</summary>
    private async Task<bool> MediaExistsAsync(OfficeUpsertDto dto)
    {
        var ids = dto.Translations.Values
            .Select(t => t.RegulationMediaId)
            .Append(dto.PhotoMediaId)
            .OfType<long>()
            .Distinct()
            .ToList();
        if (ids.Count == 0)
            return true;
        var found = await db.MediaAssets.CountAsync(m => ids.Contains(m.Id));
        return found == ids.Count;
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Organization.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        // Details loaded so EF deletes them with the office: the database FKs (and their cascade)
        // exist only where the migration role may reference the office tables
        // (0014-organization-office-detail-tables.sql).
        var entity = await db.OrganizationOffices
            .Include(o => o.Details)
            .Include(o => o.Translations).ThenInclude(t => t.Details)
            .SingleOrDefaultAsync(o => o.Id == id);
        if (entity is null)
            return NotFound();

        db.OrganizationOffices.Remove(entity);
        audit.Log("organization_offices.delete", "organization_office", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(OrganizationOffice entity, OfficeUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new OrganizationOfficeTranslation
                {
                    Locale = locale,
                    Name = tr.Name,
                    Address = tr.Address,
                    Phone = tr.Phone,
                    Details = new OrganizationOfficeTranslationDetail
                    {
                        DirectorName = tr.DirectorName,
                        RegulationMediaId = tr.RegulationMediaId,
                    },
                });
            }
            else
            {
                existing.Name = tr.Name;
                existing.Address = tr.Address;
                existing.Phone = tr.Phone;
                var details = existing.Details ??= new OrganizationOfficeTranslationDetail();
                details.DirectorName = tr.DirectorName;
                if (details.RegulationMediaId != tr.RegulationMediaId)
                    details.RegulationMedia = null;
                details.RegulationMediaId = tr.RegulationMediaId;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(OrganizationOffice o) => new
    {
        o.Id,
        o.SortOrder,
        o.IsActive,
        PhotoMediaId = o.Details?.PhotoMediaId,
        o.UpdatedAt,
        Translations = o.Translations.ToDictionary(t => t.Locale, t => new
        {
            t.Name,
            t.Address,
            t.Phone,
            DirectorName = t.Details?.DirectorName,
            RegulationMediaId = t.Details?.RegulationMediaId,
            // Shown next to the media picker in the panel — the detail DTO has no mime/preview for documents.
            RegulationName = t.Details?.RegulationMedia?.OriginalName,
        }),
    };
}

[ApiController]
[RequirePermission(Permissions.Organization.Read)]
[Route("api/v1/organization/staff")]
public class OrganizationStaffController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] short? type = null)
    {
        var query = db.OrganizationStaff.AsNoTracking();
        if (type is not null)
            query = query.Where(s => s.Type == type);

        var items = await query
            .Include(s => s.Translations)
            .Include(s => s.Photos).ThenInclude(p => p.Media)
            .OrderBy(s => s.SortOrder).ThenBy(s => s.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.OrganizationStaff.AsNoTracking()
            .Include(s => s.Translations)
            .Include(s => s.Photos).ThenInclude(p => p.Media)
            .SingleOrDefaultAsync(s => s.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Organization.Create)]
    public async Task<IActionResult> Create(StaffUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (dto.PhotoMediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var entity = new OrganizationStaff
        {
            Type = dto.Type,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
            Phone = dto.Phone,
            PhotoMediaId = dto.PhotoMediaId,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.OrganizationStaff.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("organization_staff.create", "organization_staff", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> Update(int id, StaffUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.OrganizationStaff
            .Include(s => s.Translations)
            .Include(s => s.Photos).ThenInclude(p => p.Media)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (entity is null)
            return NotFound();
        if (dto.PhotoMediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");

        var before = ToDetailDto(entity);
        entity.Type = dto.Type;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        entity.Phone = dto.Phone;
        entity.PhotoMediaId = dto.PhotoMediaId;
        ApplyTranslations(entity, dto);

        audit.Log("organization_staff.update", "organization_staff", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Organization.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.OrganizationStaff.SingleOrDefaultAsync(s => s.Id == id);
        if (entity is null)
            return NotFound();

        db.OrganizationStaff.Remove(entity);
        audit.Log("organization_staff.delete", "organization_staff", entity.Id);
        await db.SaveChangesAsync();
        // Where 0015 could not add the FK, nothing else unlinks the chart nodes.
        await db.OrgChartNodes.Where(n => n.StaffId == id)
            .ExecuteUpdateAsync(s => s.SetProperty(n => n.StaffId, (int?)null));
        return NoContent();
    }

    // Press photos (the downloadable set under the biography) — same sub-resource shape as
    // gallery images: attach appends, detach leaves a sort gap, order rewrites 1..n.

    [HttpPost("{id:int}/photos")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> AttachPhoto(int id, [FromBody] StaffAttachPhotoDto dto)
    {
        var staff = await db.OrganizationStaff.Include(s => s.Photos)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (staff is null)
            return NotFound();

        var mimeType = await db.MediaAssets.Where(m => m.Id == dto.MediaId).Select(m => m.MimeType).FirstOrDefaultAsync();
        if (mimeType is null)
            return BadRequestProblem("Media asset not found.");
        // The set is offered as downloadable photographs; a PDF or video has no place in it.
        if (!mimeType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            return BadRequestProblem("Only image assets can be attached as photos.");
        if (staff.Photos.Any(p => p.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = staff.Photos.Count == 0 ? 0 : staff.Photos.Max(p => p.SortOrder);
        var photo = new OrganizationStaffPhoto { MediaId = dto.MediaId, SortOrder = maxOrder + 1 };
        staff.Photos.Add(photo);
        audit.Log("organization_staff.attach_photo", "organization_staff", id, after: dto);
        await db.SaveChangesAsync();
        return Ok(new { photo.Id, photo.MediaId, photo.SortOrder });
    }

    [HttpDelete("{id:int}/photos/{photoId:long}")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> DetachPhoto(int id, long photoId)
    {
        var photo = await db.Set<OrganizationStaffPhoto>()
            .SingleOrDefaultAsync(p => p.StaffId == id && p.Id == photoId);
        if (photo is null)
            return NotFound();

        db.Remove(photo);
        audit.Log("organization_staff.detach_photo", "organization_staff", id, before: new { photoId, photo.MediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/photos/order")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> ReorderPhotos(int id, [FromBody] StaffPhotoOrderDto dto)
    {
        var staff = await db.OrganizationStaff.Include(s => s.Photos)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (staff is null)
            return NotFound();

        var current = staff.Photos.Select(p => p.Id).ToHashSet();
        if (dto.PhotoIds.Count != current.Count || !current.SetEquals(dto.PhotoIds))
            return BadRequestProblem("photoIds must contain exactly the member's photo ids.");

        var before = staff.Photos.OrderBy(p => p.SortOrder).Select(p => p.Id).ToList();
        for (var i = 0; i < dto.PhotoIds.Count; i++)
            staff.Photos.Single(p => p.Id == dto.PhotoIds[i]).SortOrder = i + 1;

        audit.Log("organization_staff.reorder_photos", "organization_staff", id,
            before: new { photoIds = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(OrganizationStaff entity, StaffUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new OrganizationStaffTranslation
                {
                    Locale = locale,
                    FullName = tr.FullName,
                    Position = tr.Position,
                    ReceptionDays = tr.ReceptionDays,
                    Bio = tr.Bio,
                });
            }
            else
            {
                existing.FullName = tr.FullName;
                existing.Position = tr.Position;
                existing.ReceptionDays = tr.ReceptionDays;
                existing.Bio = tr.Bio;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(OrganizationStaff s) => new
    {
        s.Id,
        s.Type,
        s.SortOrder,
        s.IsActive,
        s.Phone,
        s.PhotoMediaId,
        s.UpdatedAt,
        Translations = s.Translations.ToDictionary(t => t.Locale, t => new { t.FullName, t.Position, t.ReceptionDays, t.Bio }),
        Photos = s.Photos
            .OrderBy(p => p.SortOrder)
            .Select(p => new { p.Id, p.MediaId, p.Media?.OriginalName, p.SortOrder }),
    };
}
