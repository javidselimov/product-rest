using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record GalleryTranslationDto(string Title);
public record GalleryUpsertDto(
    DateOnly? EventDate,
    int SortOrder,
    bool IsActive,
    Dictionary<string, GalleryTranslationDto> Translations);
public record GalleryAttachImageDto(long MediaId);
public record GalleryImageOrderDto(List<long> ImageIds);

[ApiController]
[RequirePermission(Permissions.Galleries.Read)]
[Route("api/v1/galleries")]
public class GalleriesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] PagingQuery paging)
    {
        var query = db.Galleries.AsNoTracking();
        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(g => g.EventDate)
            .ThenByDescending(g => g.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(g => new
            {
                g.Id,
                g.EventDate,
                g.SortOrder,
                g.IsActive,
                g.UpdatedAt,
                ImageCount = g.Images.Count,
                Title = g.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? g.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.Galleries.AsNoTracking()
            .Include(g => g.Translations)
            .Include(g => g.Images).ThenInclude(i => i.Media)
            .SingleOrDefaultAsync(g => g.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Galleries.Create)]
    public async Task<IActionResult> Create(GalleryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new Gallery { EventDate = dto.EventDate, SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Galleries.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("galleries.create", "gallery", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Galleries.Update)]
    public async Task<IActionResult> Update(int id, GalleryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.Galleries
            .Include(g => g.Translations)
            .Include(g => g.Images).ThenInclude(i => i.Media)
            .SingleOrDefaultAsync(g => g.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.EventDate = dto.EventDate;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("galleries.update", "gallery", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Galleries.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Galleries.SingleOrDefaultAsync(g => g.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("galleries.delete", "gallery", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/images")]
    [RequirePermission(Permissions.Galleries.Update)]
    public async Task<IActionResult> AttachImage(int id, [FromBody] GalleryAttachImageDto dto)
    {
        var gallery = await db.Galleries.Include(g => g.Images)
            .SingleOrDefaultAsync(g => g.Id == id);
        if (gallery is null)
            return NotFound();
        if (!await db.MediaAssets.AnyAsync(m => m.Id == dto.MediaId))
            return BadRequestProblem("Media asset not found.");
        if (gallery.Images.Any(i => i.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = gallery.Images.Count == 0 ? 0 : gallery.Images.Max(i => i.SortOrder);
        var image = new GalleryImage { MediaId = dto.MediaId, SortOrder = maxOrder + 1 };
        gallery.Images.Add(image);
        audit.Log("galleries.attach_image", "gallery", id, after: dto);
        await db.SaveChangesAsync();
        return Ok(new { image.Id, image.MediaId, image.SortOrder });
    }

    [HttpDelete("{id:int}/images/{imageId:long}")]
    [RequirePermission(Permissions.Galleries.Update)]
    public async Task<IActionResult> DetachImage(int id, long imageId)
    {
        var image = await db.Set<GalleryImage>()
            .SingleOrDefaultAsync(i => i.GalleryId == id && i.Id == imageId);
        if (image is null)
            return NotFound();

        db.Remove(image);
        audit.Log("galleries.detach_image", "gallery", id, before: new { imageId, image.MediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/images/order")]
    [RequirePermission(Permissions.Galleries.Update)]
    public async Task<IActionResult> ReorderImages(int id, [FromBody] GalleryImageOrderDto dto)
    {
        var gallery = await db.Galleries.Include(g => g.Images)
            .SingleOrDefaultAsync(g => g.Id == id);
        if (gallery is null)
            return NotFound();

        var current = gallery.Images.Select(i => i.Id).ToHashSet();
        if (dto.ImageIds.Count != current.Count || !current.SetEquals(dto.ImageIds))
            return BadRequestProblem("imageIds must contain exactly the gallery's image ids.");

        var before = gallery.Images.OrderBy(i => i.SortOrder).Select(i => i.Id).ToList();
        for (var i = 0; i < dto.ImageIds.Count; i++)
            gallery.Images.Single(img => img.Id == dto.ImageIds[i]).SortOrder = i + 1;

        audit.Log("galleries.reorder_images", "gallery", id,
            before: new { imageIds = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(Gallery entity, GalleryUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new GalleryTranslation { Locale = locale, Title = tr.Title });
            else
                existing.Title = tr.Title;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(Gallery g) => new
    {
        g.Id,
        g.EventDate,
        g.SortOrder,
        g.IsActive,
        g.UpdatedAt,
        Translations = g.Translations.ToDictionary(t => t.Locale, t => new { t.Title }),
        Images = g.Images
            .OrderBy(i => i.SortOrder)
            .Select(i => new { i.Id, i.MediaId, i.Media?.OriginalName, i.SortOrder }),
    };
}
