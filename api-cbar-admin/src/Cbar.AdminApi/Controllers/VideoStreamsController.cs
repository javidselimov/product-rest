using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record VideoStreamTranslationDto(string Title);
public record VideoStreamUpsertDto(
    string StreamUrl,
    bool IsLive,
    DateTimeOffset? StartsAt,
    Dictionary<string, VideoStreamTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.VideoStreams.Read)]
[Route("api/v1/video-streams")]
public class VideoStreamsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.VideoStreams.AsNoTracking()
            .Include(s => s.Translations)
            .OrderByDescending(s => s.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.VideoStreams.AsNoTracking()
            .Include(s => s.Translations)
            .SingleOrDefaultAsync(s => s.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.VideoStreams.Create)]
    public async Task<IActionResult> Create(VideoStreamUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new VideoStream { StreamUrl = dto.StreamUrl, IsLive = dto.IsLive, StartsAt = dto.StartsAt };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.VideoStreams.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("video_streams.create", "video_stream", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.VideoStreams.Update)]
    public async Task<IActionResult> Update(int id, VideoStreamUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.VideoStreams
            .Include(s => s.Translations)
            .SingleOrDefaultAsync(s => s.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.StreamUrl = dto.StreamUrl;
        entity.IsLive = dto.IsLive;
        entity.StartsAt = dto.StartsAt;
        ApplyTranslations(entity, dto);

        audit.Log("video_streams.update", "video_stream", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.VideoStreams.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.VideoStreams.SingleOrDefaultAsync(s => s.Id == id);
        if (entity is null)
            return NotFound();

        db.VideoStreams.Remove(entity);   // hard delete
        audit.Log("video_streams.delete", "video_stream", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(VideoStream entity, VideoStreamUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new VideoStreamTranslation { Locale = locale, Title = tr.Title });
            else
                existing.Title = tr.Title;
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(VideoStream s) => new
    {
        s.Id,
        s.StreamUrl,
        s.IsLive,
        s.StartsAt,
        s.CreatedAt,
        s.UpdatedAt,
        Translations = s.Translations.ToDictionary(t => t.Locale, t => new { t.Title }),
    };
}
