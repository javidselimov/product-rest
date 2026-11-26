using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FaqVideoTranslationDto(string? Title);
public record FaqVideoUpsertDto(string YoutubeUrl, ContentStatus Status, Dictionary<string, FaqVideoTranslationDto> Translations);

/// <summary>FAQ videos (spec 051): the "Video sual-cavab" cards of the FAQ page, each opening on YouTube.</summary>
[ApiController]
[RequirePermission(Permissions.Faq.Read)]
[Route("api/v1/faq/videos")]
public class FaqVideosController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "faq_video";

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] PagingQuery paging, [FromQuery] ContentStatus? status = null)
    {
        var query = db.FaqVideos.AsNoTracking();
        if (status is not null)
            query = query.Where(v => v.Status == status);

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var rows = await query
            .OrderBy(v => v.SortOrder).ThenBy(v => v.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(v => new
            {
                v.Id,
                v.YoutubeUrl,
                v.SortOrder,
                v.Status,
                Title = v.Translations.Where(t => t.Locale == "az").Select(t => t.Title).FirstOrDefault()
                        ?? v.Translations.Select(t => t.Title).FirstOrDefault(),
            })
            .ToListAsync();

        var items = rows.Select(r => new
        {
            r.Id,
            r.YoutubeUrl,
            YoutubeId = FaqSupport.YoutubeId(r.YoutubeUrl) ?? "",
            r.SortOrder,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.Title,
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var detail = await DetailAsync(id);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost]
    [RequirePermission(Permissions.Faq.Create)]
    public async Task<IActionResult> Create(FaqVideoUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var maxOrder = await db.FaqVideos.MaxAsync(v => (int?)v.SortOrder) ?? 0;
        var entity = new FaqVideo { SortOrder = maxOrder + 1, CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.FaqVideos.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("faq.video_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> Update(int id, FaqVideoUpsertDto dto)
    {
        if (Invalid(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.FaqVideos.Include(v => v.Translations).SingleOrDefaultAsync(v => v.Id == id);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("faq.video_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await DetailAsync(id));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Faq.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.FaqVideos.SingleOrDefaultAsync(v => v.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("faq.video_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("order")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> Reorder([FromBody] FaqOrderDto dto)
    {
        var videos = await db.FaqVideos.OrderBy(v => v.SortOrder).ThenBy(v => v.Id).ToListAsync();
        if (ContentSupport.InvalidOrder(dto.Ids, videos.Select(v => v.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = videos.Select(v => v.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            videos.Single(v => v.Id == dto.Ids[i]).SortOrder = i + 1;

        // The whole list changes, not one video: entity id 0.
        audit.Log("faq.video_reorder", AuditEntity, 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static string? Invalid(FaqVideoUpsertDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.YoutubeUrl) || dto.YoutubeUrl.Trim().Length > FaqSupport.MaxUrlLength
            || FaqSupport.YoutubeId(dto.YoutubeUrl) is null)
            return "YouTube linki tanınmadı. Videonun YouTube ünvanını (məs. https://www.youtube.com/watch?v=…) yapışdırın.";
        if (dto.Status == ContentStatus.Scheduled)
            return "Video planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.";
        if (dto.Translations.Keys.Any(k => !ContentSupport.Locales.Contains(k)))
            return "Yalnız az və en dilləri qəbul olunur.";
        if (!dto.Translations.Values.Any(t => !string.IsNullOrWhiteSpace(t.Title)))
            return "Videonun ən azı bir dildə başlığı olmalıdır.";
        if (dto.Translations.Values.Any(t => t.Title?.Trim().Length > FaqSupport.MaxNameLength))
            return $"Başlıq ən çox {FaqSupport.MaxNameLength} simvol ola bilər.";
        return null;
    }

    private static void Apply(FaqVideo entity, FaqVideoUpsertDto dto)
    {
        entity.YoutubeUrl = dto.YoutubeUrl.Trim();
        entity.Status = dto.Status;

        var titled = dto.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Value.Title)).ToDictionary();
        foreach (var (locale, tr) in titled)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FaqVideoTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Title = tr.Title!.Trim();
        }
        entity.Translations.RemoveAll(t => !titled.ContainsKey(t.Locale));
    }

    private async Task<object?> DetailAsync(int id)
    {
        var v = await db.FaqVideos.AsNoTracking().Include(x => x.Translations).SingleOrDefaultAsync(x => x.Id == id);
        if (v is null)
            return null;
        return new
        {
            v.Id,
            v.YoutubeUrl,
            YoutubeId = FaqSupport.YoutubeId(v.YoutubeUrl) ?? "",
            v.SortOrder,
            Status = v.Status.ToString().ToLowerInvariant(),
            v.CreatedAt,
            v.UpdatedAt,
            Translations = v.Translations.ToDictionary(t => t.Locale, t => new { t.Title }),
        };
    }
}
