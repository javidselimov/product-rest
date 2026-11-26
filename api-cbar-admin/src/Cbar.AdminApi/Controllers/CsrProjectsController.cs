using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record CsrProjectTranslationDto(string CardTitle, string Summary, string Title, string? Content);
public record CsrProjectUpsertDto(
    int CategoryId,
    long? CoverMediaId,
    int SortOrder,
    ContentStatus Status,
    bool ShowAz,
    bool ShowEn,
    Dictionary<string, CsrProjectTranslationDto> Translations);
public record CsrProjectAssetOrderDto(List<long> MediaIds);

/// <summary>CSR projects (spec 038): the cards and dialogs of the corporate social responsibility page.</summary>
[ApiController]
[RequirePermission(Permissions.Csr.Read)]
[Route("api/v1/csr-projects")]
public class CsrProjectsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string ImageMimePrefix = "image/";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        [FromQuery] int? categoryId = null)
    {
        var query = db.CsrProjects.AsNoTracking();
        if (status is not null)
            query = query.Where(p => p.Status == status);
        if (categoryId is not null)
            query = query.Where(p => p.CategoryId == categoryId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Translations.Any(t =>
                EF.Functions.ILike(t.CardTitle, $"%{search}%") || EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(p => p.SortOrder).ThenBy(p => p.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(p => new
            {
                p.Id,
                Status = p.Status.ToString().ToLowerInvariant(),
                p.SortOrder,
                p.ShowAz,
                p.ShowEn,
                Title = p.Translations.Where(t => t.Locale == "az").Select(t => t.CardTitle).FirstOrDefault()
                        ?? p.Translations.Select(t => t.CardTitle).FirstOrDefault(),
                CategoryName = p.Category.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                               ?? p.Category.Translations.Select(t => t.Name).FirstOrDefault(),
                ImageCount = p.Images.Count,
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
    [RequirePermission(Permissions.Csr.Create)]
    public async Task<IActionResult> Create(CsrProjectUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new CsrProject();
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.CsrProjects.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("csr.create", "csr_project", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await ToDetailDtoAsync((await LoadAsync(entity.Id))!));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Csr.Update)]
    public async Task<IActionResult> Update(int id, CsrProjectUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.CsrProjects
            .Include(p => p.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        var before = await ToDetailDtoAsync((await LoadAsync(id))!);
        Apply(entity, dto);

        audit.Log("csr.update", "csr_project", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await ToDetailDtoAsync((await LoadAsync(id))!));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Csr.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.CsrProjects.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("csr.delete", "csr_project", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/assets")]
    [RequirePermission(Permissions.Csr.Update)]
    public async Task<IActionResult> AttachAsset(int id, [FromBody] AttachAssetDto dto)
    {
        var project = await db.CsrProjects.Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (project is null)
            return NotFound();
        if (!await IsImageAsync(dto.MediaId))
            return BadRequestProblem("Media asset not found or not an image.");
        if (project.Images.Any(i => i.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = project.Images.Count == 0 ? 0 : project.Images.Max(i => i.SortOrder);
        project.Images.Add(new CsrProjectImage { MediaId = dto.MediaId, SortOrder = maxOrder + 1 });
        audit.Log("csr.attach_asset", "csr_project", id, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/assets/order")]
    [RequirePermission(Permissions.Csr.Update)]
    public async Task<IActionResult> ReorderAssets(int id, [FromBody] CsrProjectAssetOrderDto dto)
    {
        var project = await db.CsrProjects.Include(p => p.Images)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (project is null)
            return NotFound();

        var current = project.Images.Select(i => i.MediaId).ToHashSet();
        if (dto.MediaIds.Count != current.Count || !current.SetEquals(dto.MediaIds))
            return BadRequestProblem("mediaIds must contain exactly the project's photos.");

        var before = project.Images.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).Select(i => i.MediaId).ToList();
        for (var i = 0; i < dto.MediaIds.Count; i++)
            project.Images.Single(image => image.MediaId == dto.MediaIds[i]).SortOrder = i + 1;

        audit.Log("csr.reorder_assets", "csr_project", id, before: new { mediaIds = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/assets/{mediaId:long}")]
    [RequirePermission(Permissions.Csr.Update)]
    public async Task<IActionResult> DetachAsset(int id, long mediaId)
    {
        var image = await db.CsrProjectImages
            .SingleOrDefaultAsync(i => i.ProjectId == id && i.MediaId == mediaId);
        if (image is null)
            return NotFound();

        db.Remove(image);
        audit.Log("csr.detach_asset", "csr_project", id, before: new { mediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    private Task<CsrProject?> LoadAsync(int id) => db.CsrProjects.AsNoTracking()
        .Include(p => p.Translations)
        .Include(p => p.Images).ThenInclude(i => i.Media)
        .AsSplitQuery()
        .SingleOrDefaultAsync(p => p.Id == id);

    private Task<bool> IsImageAsync(long mediaId) =>
        db.MediaAssets.AnyAsync(m => m.Id == mediaId && m.MimeType.StartsWith(ImageMimePrefix));

    /// <summary>The first thing wrong with the request, or null. Media FKs are conditional (0020), so ids are checked here.</summary>
    private async Task<string?> InvalidAsync(CsrProjectUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return "At least one language is required.";
        if (dto.Translations.Values.Any(t =>
                string.IsNullOrWhiteSpace(t.CardTitle) || string.IsNullOrWhiteSpace(t.Summary) || string.IsNullOrWhiteSpace(t.Title)))
            return "A card title, a summary and a title are required.";
        if (dto.Status == ContentStatus.Scheduled)
            return "A project cannot be scheduled.";
        if (!await db.CsrCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return "The category does not exist.";
        if (dto.CoverMediaId is { } coverId && !await IsImageAsync(coverId))
            return "The cover must be an image.";
        return null;
    }

    private static void Apply(CsrProject entity, CsrProjectUpsertDto dto)
    {
        entity.CategoryId = dto.CategoryId;
        entity.CoverMediaId = dto.CoverMediaId;
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        entity.ShowAz = dto.ShowAz;
        entity.ShowEn = dto.ShowEn;

        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new CsrProjectTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.CardTitle = tr.CardTitle;
            existing.Summary = tr.Summary;
            existing.Title = tr.Title;
            existing.Content = tr.Content;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object AssetRef(MediaAsset m) => new { MediaId = m.Id, m.OriginalName, m.MimeType, m.SizeBytes };

    private async Task<object> ToDetailDtoAsync(CsrProject p)
    {
        // A column, not a navigation: the same asset row may also sit in the photos.
        var cover = p.CoverMediaId is { } coverId
            ? await db.MediaAssets.AsNoTracking().SingleOrDefaultAsync(m => m.Id == coverId)
            : null;

        return new
        {
            p.Id,
            p.CategoryId,
            p.CoverMediaId,
            Cover = cover is null ? null : AssetRef(cover),
            p.SortOrder,
            Status = p.Status.ToString().ToLowerInvariant(),
            p.ShowAz,
            p.ShowEn,
            p.CreatedAt,
            p.UpdatedAt,
            Translations = p.Translations.ToDictionary(
                t => t.Locale,
                t => new { t.CardTitle, t.Summary, t.Title, t.Content }),
            Assets = p.Images.OrderBy(i => i.SortOrder).ThenBy(i => i.Id).Select(i => AssetRef(i.Media)).ToList(),
        };
    }
}
