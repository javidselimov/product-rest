using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record HomepageStrategyDocTranslationDto(string? Title, string? Summary, long? CoverMediaId, string? Url);
public record HomepageStrategyDocUpsertDto(
    ContentStatus Status, int? PageId, Dictionary<string, HomepageStrategyDocTranslationDto>? Translations);
public record HomepageStrategyDocOrderDto(List<int> Ids);

/// <summary>
/// The homepage "Strategiya və sənədlər" documents (spec 057). The site shows the first three published documents of a
/// locale; a card opens the locale's <c>url</c>, else the linked page in that locale. A locale is stored only with a title.
/// </summary>
[ApiController]
[RequirePermission(Permissions.HomepageStrategyDocs.Read)]
[Route("api/v1/homepage-strategy-docs")]
public class HomepageStrategyDocsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    private const string AuditEntity = "homepage_strategy_doc";

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null, [FromQuery] ContentStatus? status = null,
        CancellationToken ct = default)
    {
        var query = db.HomepageStrategyDocs.AsNoTracking();
        if (status is not null)
            query = query.Where(d => d.Status == status);
        if (LikePattern.TooLong(search) is { } tooLong)
            return BadRequestProblem(tooLong);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = LikePattern.Contains(search);
            query = query.Where(d => d.Translations.Any(t => EF.Functions.ILike(t.Title, pattern, LikePattern.Escape)));
        }

        var w = paging.Resolve(20);
        var total = await query.CountAsync(ct);
        var rows = await query
            .OrderBy(d => d.SortOrder).ThenBy(d => d.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(d => new
            {
                d.Id,
                d.SortOrder,
                d.Status,
                d.PageId,
                PageTitle = d.Page == null
                    ? null
                    : d.Page.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).Select(t => t.Title).FirstOrDefault(),
                Translations = d.Translations.Select(t => new { t.Locale, t.Title, t.Url }).ToList(),
                // The locales in which the public site shows the linked page (api-cbar PagesController.GetBySlug).
                PageLocales = d.Page == null
                    ? new List<string>()
                    : d.Page.Translations
                        .Where(t => d.Page.Status == ContentStatus.Published && d.Page.Active && t.Slug != ""
                            && (t.Locale == "en" ? d.Page.ShowEn : d.Page.ShowAz))
                        .Select(t => t.Locale)
                        .ToList(),
                Cover = d.Translations
                    .Where(t => t.CoverMedia != null)
                    .OrderBy(t => t.Locale == "az" ? 0 : 1)
                    .Select(t => new { MediaId = t.CoverMedia!.Id, t.CoverMedia.OriginalName, t.CoverMedia.MimeType, t.CoverMedia.SizeBytes })
                    .FirstOrDefault(),
                d.UpdatedAt,
            })
            .AsSplitQuery()
            .ToListAsync(ct);

        var items = rows.Select(r =>
        {
            var shown = r.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).FirstOrDefault();
            return new
            {
                r.Id,
                r.SortOrder,
                Status = r.Status.ToString().ToLowerInvariant(),
                Title = shown?.Title,
                r.PageId,
                r.PageTitle,
                Urls = r.Translations.Where(t => !string.IsNullOrEmpty(t.Url)).ToDictionary(t => t.Locale, t => t.Url),
                r.Cover,
                Locales = ContentSupport.Locales.Where(l => r.Translations.Any(t => t.Locale == l)).ToList(),
                LinkBroken = !r.Translations.Any(t => !string.IsNullOrEmpty(t.Url) || r.PageLocales.Contains(t.Locale)),
                r.UpdatedAt,
            };
        });
        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id, CancellationToken ct)
    {
        var detail = await DetailAsync(id, ct);
        return detail is null ? NotFound() : Ok(detail);
    }

    [HttpPost]
    [RequirePermission(Permissions.HomepageStrategyDocs.Create)]
    public async Task<IActionResult> Create(HomepageStrategyDocUpsertDto dto, CancellationToken ct)
    {
        if (await ValidateAsync(dto, ct) is { Count: > 0 } errors)
            return FieldValidationProblem(errors);

        var maxOrder = await db.HomepageStrategyDocs.MaxAsync(d => (int?)d.SortOrder, ct) ?? 0;
        var entity = new HomepageStrategyDoc { SortOrder = maxOrder + 1, CreatedBy = CurrentUserId() };
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        db.HomepageStrategyDocs.Add(entity);
        await db.SaveChangesAsync(ct);
        audit.Log("homepage.strategy_doc_create", AuditEntity, entity.Id, after: dto);
        await db.SaveChangesAsync(ct);
        await tx.CommitAsync(ct);

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, await DetailAsync(entity.Id, ct));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.HomepageStrategyDocs.Update)]
    public async Task<IActionResult> Update(int id, HomepageStrategyDocUpsertDto dto, CancellationToken ct)
    {
        if (await ValidateAsync(dto, ct) is { Count: > 0 } errors)
            return FieldValidationProblem(errors);

        var entity = await db.HomepageStrategyDocs.Include(d => d.Translations).SingleOrDefaultAsync(d => d.Id == id, ct);
        if (entity is null)
            return NotFound();

        var before = await DetailAsync(id, ct);
        Apply(entity, dto);
        entity.UpdatedBy = CurrentUserId();

        audit.Log("homepage.strategy_doc_update", AuditEntity, entity.Id, before, dto);
        await db.SaveChangesAsync(ct);
        return Ok(await DetailAsync(id, ct));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.HomepageStrategyDocs.Delete)]
    public async Task<IActionResult> Delete(int id, CancellationToken ct)
    {
        var entity = await db.HomepageStrategyDocs.SingleOrDefaultAsync(d => d.Id == id, ct);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.UpdatedBy = CurrentUserId();
        audit.Log("homepage.strategy_doc_delete", AuditEntity, entity.Id);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPut("order")]
    [RequirePermission(Permissions.HomepageStrategyDocs.Update)]
    public async Task<IActionResult> Reorder([FromBody] HomepageStrategyDocOrderDto dto, CancellationToken ct)
    {
        var docs = await db.HomepageStrategyDocs.OrderBy(d => d.SortOrder).ThenBy(d => d.Id).ToListAsync(ct);
        if (ContentSupport.InvalidOrder(dto.Ids, docs.Select(d => d.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = docs.Select(d => d.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            docs.Single(d => d.Id == dto.Ids[i]).SortOrder = i + 1;

        // The whole list changes, not one document: entity id 0.
        audit.Log("homepage.strategy_doc_reorder", AuditEntity, 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>
    /// The FKs are conditional (0043), so the page and the covers are checked here. The query filters hide deleted pages
    /// and media, so a deleted id counts as unknown.
    /// </summary>
    private async Task<Dictionary<string, string[]>> ValidateAsync(HomepageStrategyDocUpsertDto dto, CancellationToken ct)
    {
        var mediaIds = StrategyDocRules.MediaIds(dto);
        var mimeTypes = mediaIds.Count == 0
            ? []
            : await db.MediaAssets.AsNoTracking()
                .Where(m => mediaIds.Contains(m.Id))
                .ToDictionaryAsync(m => m.Id, m => m.MimeType, ct);
        var pageExists = dto.PageId is { } pageId && await db.Pages.AnyAsync(p => p.Id == pageId, ct);
        return StrategyDocRules.Validate(dto, pageExists, mimeTypes);
    }

    private static void Apply(HomepageStrategyDoc entity, HomepageStrategyDocUpsertDto dto)
    {
        entity.Status = dto.Status;
        entity.PageId = dto.PageId;

        var titled = (dto.Translations ?? [])
            .Where(t => !string.IsNullOrWhiteSpace(t.Value.Title))
            .ToDictionary();
        foreach (var (locale, tr) in titled)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                existing = new HomepageStrategyDocTranslation { Locale = locale };
                entity.Translations.Add(existing);
            }
            existing.Title = tr.Title!.Trim();
            existing.Summary = Blank(tr.Summary);
            existing.CoverMediaId = tr.CoverMediaId;
            existing.Url = Blank(tr.Url);
        }
        entity.Translations.RemoveAll(t => !titled.ContainsKey(t.Locale));
    }

    private static string? Blank(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private async Task<object?> DetailAsync(int id, CancellationToken ct)
    {
        var d = await db.HomepageStrategyDocs.AsNoTracking()
            .Include(x => x.Translations).ThenInclude(t => t.CoverMedia)
            .Include(x => x.Page).ThenInclude(p => p!.Translations)
            .AsSplitQuery()
            .SingleOrDefaultAsync(x => x.Id == id, ct);
        if (d is null)
            return null;
        return new
        {
            d.Id,
            d.SortOrder,
            Status = d.Status.ToString().ToLowerInvariant(),
            d.PageId,
            Page = d.Page is { } page
                ? new { page.Id, Title = page.Translations.OrderBy(t => t.Locale == "az" ? 0 : 1).Select(t => t.Title).FirstOrDefault() }
                : null,
            d.CreatedAt,
            d.UpdatedAt,
            Translations = d.Translations.ToDictionary(t => t.Locale, t => new
            {
                t.Title,
                t.Summary,
                t.Url,
                t.CoverMediaId,
                Cover = t.CoverMedia is { } cover
                    ? new { MediaId = cover.Id, cover.OriginalName, cover.MimeType, cover.SizeBytes }
                    : null,
            }),
        };
    }
}
