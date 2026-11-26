using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record MoneyMarkCategoryTranslationDto(string Name);
public record MoneyMarkCategoryUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, MoneyMarkCategoryTranslationDto> Translations);

public record MoneyMarkTranslationDto(string Title, string? Description, string? SecurityFeatures);
public record MoneyMarkUpsertDto(
    int CategoryId,
    short Type,
    long? FrontMediaId,
    long? RearMediaId,
    int SortOrder,
    ContentStatus Status,
    Dictionary<string, MoneyMarkTranslationDto> Translations);

public record MoneyMarkNewsTranslationDto(string Title, string? Content);
public record MoneyMarkNewsUpsertDto(
    ContentStatus Status,
    DateTimeOffset? PublishedAt,
    Dictionary<string, MoneyMarkNewsTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.MoneyMarks.Read)]
[Route("api/v1/money-mark-categories")]
public class MoneyMarkCategoriesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.MoneyMarkCategories.AsNoTracking()
            .Include(c => c.Translations)
            .OrderBy(c => c.SortOrder).ThenBy(c => c.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.MoneyMarkCategories.AsNoTracking()
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.MoneyMarks.Create)]
    public async Task<IActionResult> Create(MoneyMarkCategoryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new MoneyMarkCategory { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MoneyMarkCategories.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("money_mark_categories.create", "money_mark_category", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Update)]
    public async Task<IActionResult> Update(int id, MoneyMarkCategoryUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.MoneyMarkCategories
            .Include(c => c.Translations)
            .SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("money_mark_categories.update", "money_mark_category", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MoneyMarkCategories.SingleOrDefaultAsync(c => c.Id == id);
        if (entity is null)
            return NotFound();
        if (await db.MoneyMarks.IgnoreQueryFilters().AnyAsync(m => m.CategoryId == id))
            return ConflictProblem("Category is referenced by money marks; reassign or delete them first.");

        db.MoneyMarkCategories.Remove(entity);
        audit.Log("money_mark_categories.delete", "money_mark_category", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(MoneyMarkCategory entity, MoneyMarkCategoryUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new MoneyMarkCategoryTranslation { Locale = locale, Name = tr.Name });
            else
                existing.Name = tr.Name;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(MoneyMarkCategory c) => new
    {
        c.Id,
        c.SortOrder,
        c.IsActive,
        Translations = c.Translations.ToDictionary(t => t.Locale, t => new { t.Name }),
    };
}

[ApiController]
[RequirePermission(Permissions.MoneyMarks.Read)]
[Route("api/v1/money-marks")]
public class MoneyMarksController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] short? type = null, [FromQuery] int? categoryId = null,
        [FromQuery] ContentStatus? status = null)
    {
        var query = db.MoneyMarks.AsNoTracking();
        if (type is not null)
            query = query.Where(m => m.Type == type);
        if (categoryId is not null)
            query = query.Where(m => m.CategoryId == categoryId);
        if (status is not null)
            query = query.Where(m => m.Status == status);

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(m => m.SortOrder).ThenBy(m => m.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(m => new
            {
                m.Id,
                m.CategoryId,
                m.Type,
                m.SortOrder,
                Status = m.Status.ToString().ToLowerInvariant(),
                m.UpdatedAt,
                Title = m.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? m.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.MoneyMarks.AsNoTracking()
            .Include(m => m.Translations)
            .Include(m => m.FrontMedia)
            .Include(m => m.RearMedia)
            .SingleOrDefaultAsync(m => m.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.MoneyMarks.Create)]
    public async Task<IActionResult> Create(MoneyMarkUpsertDto dto)
    {
        var validation = await Validate(dto);
        if (validation is not null)
            return validation;

        var entity = new MoneyMark
        {
            CategoryId = dto.CategoryId,
            Type = dto.Type,
            FrontMediaId = dto.FrontMediaId,
            RearMediaId = dto.RearMediaId,
            SortOrder = dto.SortOrder,
            Status = dto.Status,
        };
        await ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MoneyMarks.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("money_marks.create", "money_mark", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Update)]
    public async Task<IActionResult> Update(int id, MoneyMarkUpsertDto dto)
    {
        var entity = await db.MoneyMarks
            .Include(m => m.Translations)
            .SingleOrDefaultAsync(m => m.Id == id);
        if (entity is null)
            return NotFound();

        var validation = await Validate(dto);
        if (validation is not null)
            return validation;

        var before = ToDetailDto(entity);
        entity.CategoryId = dto.CategoryId;
        entity.Type = dto.Type;
        entity.FrontMediaId = dto.FrontMediaId;
        entity.RearMediaId = dto.RearMediaId;
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        await ApplyTranslations(entity, dto);

        audit.Log("money_marks.update", "money_mark", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MoneyMarks.SingleOrDefaultAsync(m => m.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("money_marks.delete", "money_mark", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult?> Validate(MoneyMarkUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (!await db.MoneyMarkCategories.AnyAsync(c => c.Id == dto.CategoryId))
            return BadRequestProblem("Money mark category not found.");
        if (dto.FrontMediaId is { } frontId && !await db.MediaAssets.AnyAsync(m => m.Id == frontId))
            return BadRequestProblem("Front media asset not found.");
        if (dto.RearMediaId is { } rearId && !await db.MediaAssets.AnyAsync(m => m.Id == rearId))
            return BadRequestProblem("Rear media asset not found.");
        return null;
    }

    private async Task ApplyTranslations(MoneyMark entity, MoneyMarkUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new MoneyMarkTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlug.ForAsync(
                        db.Set<MoneyMarkTranslation>().Where(t => t.Locale == locale).Select(t => t.Slug),
                        tr.Title),
                    Description = tr.Description,
                    SecurityFeatures = tr.SecurityFeatures,
                });
            }
            else
            {
                if (existing.Title != tr.Title)
                    existing.Slug = await UniqueSlug.ForAsync(
                        db.Set<MoneyMarkTranslation>().Where(t => t.Locale == locale && t.Id != existing.Id).Select(t => t.Slug),
                        tr.Title);
                existing.Title = tr.Title;
                existing.Description = tr.Description;
                existing.SecurityFeatures = tr.SecurityFeatures;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(MoneyMark m) => new
    {
        m.Id,
        m.CategoryId,
        m.Type,
        m.FrontMediaId,
        m.RearMediaId,
        m.SortOrder,
        Status = m.Status.ToString().ToLowerInvariant(),
        m.UpdatedAt,
        Translations = m.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Description, t.SecurityFeatures }),
    };
}

[ApiController]
[RequirePermission(Permissions.MoneyMarks.Read)]
[Route("api/v1/money-mark-news")]
public class MoneyMarkNewsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null)
    {
        var query = db.MoneyMarkNews.AsNoTracking();
        if (status is not null)
            query = query.Where(n => n.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(n => n.Translations.Any(t => EF.Functions.ILike(t.Title, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.PublishedAt ?? n.CreatedAt)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(n => new
            {
                n.Id,
                Status = n.Status.ToString().ToLowerInvariant(),
                n.PublishedAt,
                n.UpdatedAt,
                Title = n.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? n.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.MoneyMarkNews.AsNoTracking()
            .Include(n => n.Translations)
            .SingleOrDefaultAsync(n => n.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.MoneyMarks.Create)]
    public async Task<IActionResult> Create(MoneyMarkNewsUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new MoneyMarkNews { Status = dto.Status, PublishedAt = dto.PublishedAt };
        await ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MoneyMarkNews.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("money_mark_news.create", "money_mark_news", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Update)]
    public async Task<IActionResult> Update(int id, MoneyMarkNewsUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.MoneyMarkNews
            .Include(n => n.Translations)
            .SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.Status = dto.Status;
        entity.PublishedAt = dto.PublishedAt;
        await ApplyTranslations(entity, dto);

        audit.Log("money_mark_news.update", "money_mark_news", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.MoneyMarks.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.MoneyMarkNews.SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("money_mark_news.delete", "money_mark_news", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task ApplyTranslations(MoneyMarkNews entity, MoneyMarkNewsUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new MoneyMarkNewsTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlug.ForAsync(
                        db.Set<MoneyMarkNewsTranslation>().Where(t => t.Locale == locale).Select(t => t.Slug),
                        tr.Title),
                    Content = tr.Content,
                });
            }
            else
            {
                if (existing.Title != tr.Title)
                    existing.Slug = await UniqueSlug.ForAsync(
                        db.Set<MoneyMarkNewsTranslation>().Where(t => t.Locale == locale && t.Id != existing.Id).Select(t => t.Slug),
                        tr.Title);
                existing.Title = tr.Title;
                existing.Content = tr.Content;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(MoneyMarkNews n) => new
    {
        n.Id,
        Status = n.Status.ToString().ToLowerInvariant(),
        n.PublishedAt,
        n.UpdatedAt,
        Translations = n.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Content }),
    };
}
