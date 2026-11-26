using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record FaqQuestionTranslationDto(string? Question, string? Answer);
public record FaqQuestionUpsertDto(int TopicId, ContentStatus Status, Dictionary<string, FaqQuestionTranslationDto> Translations);

/// <summary>
/// FAQ questions (spec 051). A language is stored only when its question and answer are both filled, so the public API
/// never shows half a question; a language the editor left empty (an untouched editor saves <c>&lt;p&gt;&lt;/p&gt;</c>) is
/// simply not stored. The order inside a topic is changed through <c>PUT /faq/topics/{id}/questions/order</c>.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Faq.Read)]
[Route("api/v1/faq/questions")]
public class FaqQuestionsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "faq_question";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        [FromQuery] int? topicId = null, [FromQuery] string? missingLocale = null)
    {
        var query = db.FaqQuestions.AsNoTracking();
        if (status is not null)
            query = query.Where(q => q.Status == status);
        if (topicId is not null)
            query = query.Where(q => q.TopicId == topicId);
        if (missingLocale is "az" or "en")
            query = query.Where(q => !q.Translations.Any(t => t.Locale == missingLocale));
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(q => q.Translations.Any(t => EF.Functions.ILike(t.Text, $"%{search}%")));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var rows = await query
            .OrderBy(q => q.Topic.SortOrder).ThenBy(q => q.TopicId).ThenBy(q => q.SortOrder).ThenBy(q => q.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(q => new
            {
                q.Id,
                q.TopicId,
                TopicName = q.Topic.Translations.Where(x => x.Locale == "az").Select(x => x.Name).FirstOrDefault()
                            ?? q.Topic.Translations.Select(x => x.Name).FirstOrDefault(),
                q.SortOrder,
                // Position among the topic's questions, as the site numbers them.
                Number = db.FaqQuestions.Count(o => o.TopicId == q.TopicId
                    && (o.SortOrder < q.SortOrder || (o.SortOrder == q.SortOrder && o.Id < q.Id))) + 1,
                q.Status,
                Question = q.Translations.Where(t => t.Locale == "az").Select(t => t.Text).FirstOrDefault()
                           ?? q.Translations.Select(t => t.Text).FirstOrDefault(),
                Locales = q.Translations.Select(t => t.Locale).ToList(),
            })
            .AsSplitQuery()
            .ToListAsync();

        var items = rows.Select(r => new
        {
            r.Id,
            r.TopicId,
            r.TopicName,
            r.SortOrder,
            r.Number,
            Status = r.Status.ToString().ToLowerInvariant(),
            r.Question,
            Locales = ContentSupport.Locales.Where(r.Locales.Contains).ToList(),
            // Stored languages are complete by construction (see the class summary).
            IncompleteLocales = Array.Empty<string>(),
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
    public async Task<IActionResult> Create(FaqQuestionUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = new FaqQuestion
        {
            TopicId = dto.TopicId,
            SortOrder = await NextSortOrderAsync(dto.TopicId),
            CreatedBy = CurrentUserId(),
        };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.FaqQuestions.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("faq.question_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Faq.Update)]
    public async Task<IActionResult> Update(int id, FaqQuestionUpsertDto dto)
    {
        if (await InvalidAsync(dto) is { } message)
            return BadRequestProblem(message);

        var entity = await db.FaqQuestions.Include(q => q.Translations).SingleOrDefaultAsync(q => q.Id == id);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id);
        // Moved to another topic: it joins the end of that topic.
        if (entity.TopicId != dto.TopicId)
        {
            entity.SortOrder = await NextSortOrderAsync(dto.TopicId);
            entity.TopicId = dto.TopicId;
        }
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("faq.question_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(await DetailAsync(id));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Faq.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.FaqQuestions.SingleOrDefaultAsync(q => q.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("faq.question_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<int> NextSortOrderAsync(int topicId) =>
        (await db.FaqQuestions.Where(q => q.TopicId == topicId).MaxAsync(q => (int?)q.SortOrder) ?? 0) + 1;

    private static bool Filled(FaqQuestionTranslationDto t) => !string.IsNullOrWhiteSpace(t.Question) && !ContentSupport.IsBlankHtml(t.Answer);

    private static bool Started(FaqQuestionTranslationDto t) => !string.IsNullOrWhiteSpace(t.Question) || !ContentSupport.IsBlankHtml(t.Answer);

    private async Task<string?> InvalidAsync(FaqQuestionUpsertDto dto)
    {
        if (!await db.FaqTopics.AnyAsync(t => t.Id == dto.TopicId))
            return "Mövzu tapılmadı. Siyahıdan mövcud mövzunu seçin.";
        if (dto.Status == ContentStatus.Scheduled)
            return "Sual planlaşdırıla bilməz: «Dərc olunub» və ya «Qaralama» seçin.";
        if (dto.Translations.Keys.Any(k => !ContentSupport.Locales.Contains(k)))
            return "Yalnız az və en dilləri qəbul olunur.";

        // A language with only a question or only an answer would show half a question on the site.
        foreach (var (locale, tr) in dto.Translations)
            if (Started(tr) && !Filled(tr))
                return $"«{locale}» dilində sual və cavab birlikdə doldurulmalıdır.";
        if (!dto.Translations.Values.Any(Filled))
            return "Ən azı bir dildə sual və cavab yazılmalıdır.";
        if (dto.Translations.Values.Any(t => t.Question?.Trim().Length > FaqSupport.MaxQuestionLength))
            return $"Sual ən çox {FaqSupport.MaxQuestionLength} simvol ola bilər.";
        return null;
    }

    private static void Apply(FaqQuestion entity, FaqQuestionUpsertDto dto)
    {
        entity.Status = dto.Status;

        var filled = dto.Translations.Where(t => Filled(t.Value)).ToDictionary();
        foreach (var (locale, tr) in filled)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new FaqQuestionTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Text = tr.Question!.Trim();
            existing.Answer = tr.Answer!;
        }
        entity.Translations.RemoveAll(t => !filled.ContainsKey(t.Locale));
    }

    private async Task<object?> DetailAsync(int id)
    {
        var q = await db.FaqQuestions.AsNoTracking().Include(x => x.Translations).SingleOrDefaultAsync(x => x.Id == id);
        if (q is null)
            return null;
        return new
        {
            q.Id,
            q.TopicId,
            q.SortOrder,
            Status = q.Status.ToString().ToLowerInvariant(),
            q.CreatedAt,
            q.UpdatedAt,
            Translations = q.Translations.ToDictionary(t => t.Locale, t => new { Question = t.Text, t.Answer }),
        };
    }
}
