using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record VideoTranslationDto(string Title);
public record VideoUpsertDto(
    string YoutubeUrl,
    DateTimeOffset? PublishedAt,
    int SortOrder,
    bool IsActive,
    Dictionary<string, VideoTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.Videos.Read)]
[Route("api/v1/videos")]
public class VideosController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List([FromQuery] PagingQuery paging)
    {
        var query = db.Videos.AsNoTracking();
        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(v => v.PublishedAt ?? v.CreatedAt)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(v => new
            {
                v.Id,
                v.YoutubeUrl,
                v.PublishedAt,
                v.SortOrder,
                v.IsActive,
                v.UpdatedAt,
                Title = v.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? v.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.Videos.AsNoTracking()
            .Include(v => v.Translations)
            .SingleOrDefaultAsync(v => v.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Videos.Create)]
    public async Task<IActionResult> Create(VideoUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new Video
        {
            YoutubeUrl = dto.YoutubeUrl,
            PublishedAt = dto.PublishedAt,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive,
        };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Videos.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("videos.create", "video", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Videos.Update)]
    public async Task<IActionResult> Update(int id, VideoUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.Videos
            .Include(v => v.Translations)
            .SingleOrDefaultAsync(v => v.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.YoutubeUrl = dto.YoutubeUrl;
        entity.PublishedAt = dto.PublishedAt;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("videos.update", "video", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Videos.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Videos.SingleOrDefaultAsync(v => v.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("videos.delete", "video", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(Video entity, VideoUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new VideoTranslation { Locale = locale, Title = tr.Title });
            else
                existing.Title = tr.Title;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(Video v) => new
    {
        v.Id,
        v.YoutubeUrl,
        v.PublishedAt,
        v.SortOrder,
        v.IsActive,
        v.UpdatedAt,
        Translations = v.Translations.ToDictionary(t => t.Locale, t => new { t.Title }),
    };
}
