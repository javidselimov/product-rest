using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record LawTranslationDto(string Title, string? Description);
public record LawUpsertDto(
    int CategoryId,
    short Type,
    ContentStatus Status,
    DateTimeOffset? PublishedAt,
    Dictionary<string, LawTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.Laws.Read)]
[Route("api/v1/laws")]
public class LawsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] int? categoryId = null,
        [FromQuery] ContentStatus? status = null)
    {
        var query = db.Laws.AsNoTracking();
        if (status is not null)
            query = query.Where(l => l.Status == status);
        if (categoryId is not null)
            query = query.Where(l => l.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(l => l.Translations.Any(t => EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(l => l.PublishedAt ?? l.CreatedAt)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(l => new
            {
                l.Id,
                l.CategoryId,
                l.Type,
                Status = l.Status.ToString().ToLowerInvariant(),
                l.PublishedAt,
                l.UpdatedAt,
                Title = l.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? l.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.Laws.AsNoTracking()
            .Include(l => l.Translations)
            .Include(l => l.Assets).ThenInclude(a => a.Media)
            .SingleOrDefaultAsync(l => l.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Laws.Create)]
    public async Task<IActionResult> Create(LawUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (!await db.LawCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequestProblem("Law category not found.");

        var entity = new Law
        {
            CategoryId = dto.CategoryId,
            Type = dto.Type,
            Status = dto.Status,
            PublishedAt = dto.PublishedAt,
        };
        await ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Laws.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("laws.create", "law", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Laws.Update)]
    public async Task<IActionResult> Update(int id, LawUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.Laws
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();
        if (entity.CategoryId != dto.CategoryId && !await db.LawCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequestProblem("Law category not found.");

        var before = ToDetailDto(entity);
        entity.CategoryId = dto.CategoryId;
        entity.Type = dto.Type;
        entity.Status = dto.Status;
        entity.PublishedAt = dto.PublishedAt;
        await ApplyTranslations(entity, dto);

        audit.Log("laws.update", "law", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Laws.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Laws.SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("laws.delete", "law", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/assets")]
    [RequirePermission(Permissions.Laws.Update)]
    public async Task<IActionResult> AttachAsset(int id, [FromBody] AttachAssetDto dto)
    {
        var law = await db.Laws.Include(l => l.Assets)
            .SingleOrDefaultAsync(l => l.Id == id);
        if (law is null)
            return NotFound();
        if (!await db.MediaAssets.AnyAsync(m => m.Id == dto.MediaId))
            return BadRequestProblem("Media asset not found.");
        if (law.Assets.Any(a => a.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = law.Assets.Count == 0 ? 0 : law.Assets.Max(a => a.SortOrder);
        law.Assets.Add(new LawAsset { MediaId = dto.MediaId, SortOrder = maxOrder + 1 });
        audit.Log("laws.attach_asset", "law", id, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/assets/{mediaId:long}")]
    [RequirePermission(Permissions.Laws.Update)]
    public async Task<IActionResult> DetachAsset(int id, long mediaId)
    {
        var asset = await db.Set<LawAsset>()
            .SingleOrDefaultAsync(a => a.LawId == id && a.MediaId == mediaId);
        if (asset is null)
            return NotFound();

        db.Remove(asset);
        audit.Log("laws.detach_asset", "law", id, before: new { mediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task ApplyTranslations(Law entity, LawUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new LawTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlug.ForAsync(
                        db.Set<LawTranslation>().Where(t => t.Locale == locale).Select(t => t.Slug),
                        tr.Title),
                    Description = tr.Description,
                });
            }
            else
            {
                if (existing.Title != tr.Title)
                    existing.Slug = await UniqueSlug.ForAsync(
                        db.Set<LawTranslation>().Where(t => t.Locale == locale && t.Id != existing.Id).Select(t => t.Slug),
                        tr.Title);
                existing.Title = tr.Title;
                existing.Description = tr.Description;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(Law l) => new
    {
        l.Id,
        l.CategoryId,
        l.Type,
        Status = l.Status.ToString().ToLowerInvariant(),
        l.PublishedAt,
        l.UpdatedAt,
        Translations = l.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Description }),
        Assets = l.Assets
            .OrderBy(a => a.SortOrder)
            .Select(a => new
            {
                MediaId = a.MediaId,
                a.Media?.OriginalName,
                a.Media?.MimeType,
                SizeBytes = a.Media?.SizeBytes,
            }),
    };
}
