using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record HomepageLinkTranslationDto(string Title, string Url);
public record HomepageLinkUpsertDto(
    int SortOrder,
    bool IsActive,
    Dictionary<string, HomepageLinkTranslationDto> Translations);

[ApiController]
[RequirePermission(Permissions.HomepageLinks.Read)]
[Route("api/v1/homepage-links")]
public class HomepageLinksController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await db.HomepageLinks.AsNoTracking()
            .Include(l => l.Translations)
            .OrderBy(l => l.SortOrder).ThenBy(l => l.Id)
            .ToListAsync();
        return Ok(new { items = items.Select(ToDetailDto) });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.HomepageLinks.AsNoTracking()
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.HomepageLinks.Create)]
    public async Task<IActionResult> Create(HomepageLinkUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = new HomepageLink { SortOrder = dto.SortOrder, IsActive = dto.IsActive };
        ApplyTranslations(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.HomepageLinks.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("homepage_links.create", "homepage_link", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.HomepageLinks.Update)]
    public async Task<IActionResult> Update(int id, HomepageLinkUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var entity = await db.HomepageLinks
            .Include(l => l.Translations)
            .SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;
        ApplyTranslations(entity, dto);

        audit.Log("homepage_links.update", "homepage_link", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.HomepageLinks.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.HomepageLinks.SingleOrDefaultAsync(l => l.Id == id);
        if (entity is null)
            return NotFound();

        db.HomepageLinks.Remove(entity);   // hard delete
        audit.Log("homepage_links.delete", "homepage_link", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static void ApplyTranslations(HomepageLink entity, HomepageLinkUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
            {
                entity.Translations.Add(new HomepageLinkTranslation { Locale = locale, Title = tr.Title, Url = tr.Url });
            }
            else
            {
                existing.Title = tr.Title;
                existing.Url = tr.Url;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static object ToDetailDto(HomepageLink l) => new
    {
        l.Id,
        l.SortOrder,
        l.IsActive,
        l.UpdatedAt,
        Translations = l.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Url }),
    };
}
