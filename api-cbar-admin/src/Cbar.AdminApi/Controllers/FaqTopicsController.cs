using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FaqTopicTranslationDto(string Name);
public record FaqTopicUpsertDto(ContentStatus Status, Dictionary<string, FaqTopicTranslationDto> Translations, List<int>? PageIds);
public record FaqOrderDto(List<int> Ids);

/// <summary>
/// FAQ topics (spec 051): the "Sual-cavab" panel section's topic list, the order of topics and of each topic's questions,
/// and the CMS pages that show a topic's link card. The slug is made once, from the name, and never changes: the site's
/// <c>?topic=</c> links keep working when a topic is renamed.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Faq.Read)]
[Route("api/v1/faq/topics")]
public class FaqTopicsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "faq_topic";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null, [FromQuery] int? pageId = null)
    {
        var query = db.FaqTopics.AsNoTracking();
        if (status is not null)
            query = query.Where(t => t.Status == status);
        if (pageId is not null)
            query = query.Where(t => t.Pages.Any(p => p.PageId == pageId));
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Translations.Any(x => EF.Functions.ILike(x.Name, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var rows = await query
            .OrderBy(t => t.SortOrder).ThenBy(t => t.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(t => new
            {
                t.Id,
                t.Slug,
                t.SortOrder,
                t.Status,
                Name = t.Translations.Where(x => x.Locale == "az").Select(x => x.Name).FirstOrDefault()
                       ?? t.Translations.Select(x => x.Name).FirstOrDefault(),
                QuestionCount = t.Questions.Count,
                Locales = t.Translations.Select(x => x.Locale).ToList(),
                PageIds = t.Pages.OrderBy(p => p.SortOrder).Select(p => p.PageId).ToList(),
            })
            .AsSplitQuery()
            .ToListAsync();

        var titles = await PageTitlesAsync(rows.SelectMany(r => r.PageIds));
        var items = rows.Select(r => new
        {
            r.Id,
            r.Slug,
            r.SortOrder,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.Name,
            r.QuestionCount,
            Locales = ContentSupport.Locales.Where(r.Locales.Contains).ToList(),
            Pages = r.PageIds.Where(titles.ContainsKey).Select(id => new { Id = id, Title = titles[id] }).ToList(),
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
    public async Task<IActionResult> Create(FaqTopicUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var name = dto.Translations.TryGetValue("az", out var az) && !string.IsNullOrWhiteSpace(az.Name)
            ? az.Name
            : dto.Translations.Values.First(t => !string.IsNullOrWhiteSpace(t.Name)).Name;
        var maxOrder = await db.FaqTopics.MaxAsync(t => (int?)t.SortOrder) ?? 0;
        var entity = new FaqTopic
        {
            // Soft-deleted topics keep their slug: a new topic must not take the address an old link still uses.
            Slug = await UniqueSlug.ForAsync(db.FaqTopics.IgnoreQueryFilters().Select(t => t.Slug), name.Trim()),
            SortOrder = maxOrder + 1,
            CreatedBy = CurrentUserId(),
        };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.FaqTopics.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("faq.topic_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> Update(int id, FaqTopicUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.FaqTopics.Include(t => t.Translations).Include(t => t.Pages)
            .AsSplitQuery().SingleOrDefaultAsync(t => t.Id == id);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("faq.topic_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await DetailAsync(id));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Faq.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.FaqTopics.SingleOrDefaultAsync(t => t.Id == id);
        if (entity is null)
            return NotFound();

        var questions = await db.FaqQuestions.CountAsync(q => q.TopicId == id);
        if (questions > 0)
            return ConflictProblem($"Mövzuda {questions} sual var. Əvvəl sualları başqa mövzuya keçirin və ya silin.");

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("faq.topic_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("order")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> Reorder([FromBody] FaqOrderDto dto)
    {
        var topics = await db.FaqTopics.OrderBy(t => t.SortOrder).ThenBy(t => t.Id).ToListAsync();
        if (ContentSupport.InvalidOrder(dto.Ids, topics.Select(t => t.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = topics.Select(t => t.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            topics.Single(t => t.Id == dto.Ids[i]).SortOrder = i + 1;

        // The whole list changes, not one topic: entity id 0.
        audit.Log("faq.topic_reorder", AuditEntity, 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id:int}/questions/order")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> ReorderQuestions(int id, [FromBody] FaqOrderDto dto)
    {
        if (!await db.FaqTopics.AnyAsync(t => t.Id == id))
            return NotFound();

        var questions = await db.FaqQuestions.Where(q => q.TopicId == id)
            .OrderBy(q => q.SortOrder).ThenBy(q => q.Id).ToListAsync();
        if (ContentSupport.InvalidOrder(dto.Ids, questions.Select(q => q.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = questions.Select(q => q.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            questions.Single(q => q.Id == dto.Ids[i]).SortOrder = i + 1;

        audit.Log("faq.question_reorder", AuditEntity, id, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>The first thing wrong with the request, or null. The page FK is conditional (0032), so the ids are checked here.</summary>
    private async Task<string?> InvalidAsync(FaqTopicUpsertDto dto)
    {
        var named = dto.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Value.Name)).ToList();
        if (named.Count == 0)
            return "Mövzunun ən azı bir dildə adı olmalıdır.";
        if (named.Any(t => !ContentSupport.Locales.Contains(t.Key)))
            return "Yalnız az və en dilləri qəbul olunur.";
        if (named.Any(t => t.Value.Name.Trim().Length > FaqSupport.MaxNameLength))
            return $"Mövzunun adı ən çox {FaqSupport.MaxNameLength} simvol ola bilər.";
        if (dto.Status == ContentStatus.Scheduled)
            return "Mövzu planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.";

        var pageIds = dto.PageIds ?? [];
        if (pageIds.Distinct().Count() != pageIds.Count)
            return "Eyni səhifə iki dəfə seçilib.";
        if (pageIds.Count > 0 && await db.Pages.CountAsync(p => pageIds.Contains(p.Id) && p.DeletedAt == null) != pageIds.Count)
            return "Seçilmiş səhifələrdən biri tapılmadı və ya silinib.";
        return null;
    }

    private static void Apply(FaqTopic entity, FaqTopicUpsertDto dto)
    {
        entity.Status = dto.Status;

        // A language left blank is not stored: the topic then does not show in it.
        var named = dto.Translations.Where(t => !string.IsNullOrWhiteSpace(t.Value.Name)).ToDictionary();
        foreach (var (locale, tr) in named)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FaqTopicTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Name = tr.Name.Trim();
        }
        entity.Translations.RemoveAll(t => !named.ContainsKey(t.Locale));

        // Omitted: the links stay as they are (the topic form saves name and status only).
        if (dto.PageIds is not { } pageIds)
            return;
        entity.Pages.RemoveAll(p => !pageIds.Contains(p.PageId));
        for (var i = 0; i < pageIds.Count; i++)
        {
            var link = entity.Pages.SingleOrDefault(p => p.PageId == pageIds[i]);
            if (link is null)
            {
                link = new FaqTopicPage { PageId = pageIds[i] };
                entity.Pages.Add(link);
            }
            link.SortOrder = i;
        }
    }

    /// <summary>The az title of each page, else any locale's; deleted pages are left out.</summary>
    private async Task<Dictionary<int, string>> PageTitlesAsync(IEnumerable<int> pageIds)
    {
        var ids = pageIds.Distinct().ToList();
        if (ids.Count == 0)
            return [];
        var rows = await db.PageTranslations.AsNoTracking()
            .Where(t => ids.Contains(t.PageId) && t.Page.DeletedAt == null)
            .Select(t => new { t.PageId, t.Locale, t.Title })
            .ToListAsync();
        return rows.GroupBy(r => r.PageId)
            .ToDictionary(g => g.Key, g => (g.FirstOrDefault(r => r.Locale == "az") ?? g.First()).Title);
    }

    private async Task<object?> DetailAsync(int id)
    {
        var t = await db.FaqTopics.AsNoTracking()
            .Include(x => x.Translations)
            .Include(x => x.Pages)
            .AsSplitQuery()
            .SingleOrDefaultAsync(x => x.Id == id);
        if (t is null)
            return null;

        var pageIds = t.Pages.OrderBy(p => p.SortOrder).Select(p => p.PageId).ToList();
        var titles = await PageTitlesAsync(pageIds);
        return new
        {
            t.Id,
            t.Slug,
            t.SortOrder,
            Status = t.Status.ToString().ToLowerInvariant(),
            t.CreatedAt,
            t.UpdatedAt,
            Translations = t.Translations.ToDictionary(x => x.Locale, x => new { x.Name }),
            PageIds = pageIds,
            Pages = pageIds.Where(titles.ContainsKey).Select(pid => new { Id = pid, Title = titles[pid] }).ToList(),
        };
    }
}
