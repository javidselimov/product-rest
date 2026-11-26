using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record MeasDocumentUpsertDto(
    int EmitentId,
    int InfoTypeId,
    DateOnly RegDate,
    string? Dqn,
    long? MediaId,
    ContentStatus Status);

[ApiController]
[RequirePermission(Permissions.Meas.Read)]
[Route("api/v1/meas-documents")]
public class MeasDocumentsController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging,
        [FromQuery] string? search = null, [FromQuery] int? emitentId = null,
        [FromQuery] int? infoTypeId = null, [FromQuery] ContentStatus? status = null)
    {
        var query = db.MeasDocuments.AsNoTracking();
        if (emitentId is not null)
            query = query.Where(d => d.EmitentId == emitentId);
        if (infoTypeId is not null)
            query = query.Where(d => d.InfoTypeId == infoTypeId);
        if (status is not null)
            query = query.Where(d => d.Status == status);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(d => d.Dqn != null && EF.Functions.ILike(d.Dqn, $"%{search}%"));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(d => d.RegDate).ThenByDescending(d => d.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(d => new
            {
                d.Id,
                d.EmitentId,
                EmitentName = d.Emitent.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                              ?? d.Emitent.Translations.Select(t => t.Name).FirstOrDefault(),
                d.InfoTypeId,
                InfoTypeName = d.InfoType.Translations.Where(t => t.Locale == "az").Select(t => t.Name).FirstOrDefault()
                               ?? d.InfoType.Translations.Select(t => t.Name).FirstOrDefault(),
                d.RegDate,
                d.Dqn,
                d.MediaId,
                Status = d.Status.ToString().ToLowerInvariant(),
                d.UpdatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> Get(long id)
    {
        var item = await db.MeasDocuments.AsNoTracking()
            .Include(d => d.Media)
            .SingleOrDefaultAsync(d => d.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Meas.Create)]
    public async Task<IActionResult> Create(MeasDocumentUpsertDto dto)
    {
        var validation = await ValidateReferences(dto);
        if (validation is not null)
            return validation;

        var entity = new MeasDocument
        {
            EmitentId = dto.EmitentId,
            InfoTypeId = dto.InfoTypeId,
            RegDate = dto.RegDate,
            Dqn = dto.Dqn,
            MediaId = dto.MediaId,
            Status = dto.Status,
        };

        await using var tx = await db.Database.BeginTransactionAsync();
        db.MeasDocuments.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("meas_documents.create", "meas_document", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:long}")]
    [RequirePermission(Permissions.Meas.Update)]
    public async Task<IActionResult> Update(long id, MeasDocumentUpsertDto dto)
    {
        var entity = await db.MeasDocuments.SingleOrDefaultAsync(d => d.Id == id);
        if (entity is null)
            return NotFound();

        var validation = await ValidateReferences(dto);
        if (validation is not null)
            return validation;

        var before = ToDetailDto(entity);
        entity.EmitentId = dto.EmitentId;
        entity.InfoTypeId = dto.InfoTypeId;
        entity.RegDate = dto.RegDate;
        entity.Dqn = dto.Dqn;
        entity.MediaId = dto.MediaId;
        entity.Status = dto.Status;

        audit.Log("meas_documents.update", "meas_document", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    [HttpDelete("{id:long}")]
    [RequirePermission(Permissions.Meas.Delete)]
    public async Task<IActionResult> Delete(long id)
    {
        var entity = await db.MeasDocuments.SingleOrDefaultAsync(d => d.Id == id);
        if (entity is null)
            return NotFound();

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        audit.Log("meas_documents.delete", "meas_document", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<IActionResult?> ValidateReferences(MeasDocumentUpsertDto dto)
    {
        if (!await db.MeasEmitents.AnyAsync(e => e.Id == dto.EmitentId))
            return BadRequestProblem("Emitent not found.");
        if (!await db.MeasInfoTypes.AnyAsync(t => t.Id == dto.InfoTypeId))
            return BadRequestProblem("Info type not found.");
        if (dto.MediaId is { } mediaId && !await db.MediaAssets.AnyAsync(m => m.Id == mediaId))
            return BadRequestProblem("Media asset not found.");
        return null;
    }

    private static object ToDetailDto(MeasDocument d) => new
    {
        d.Id,
        d.EmitentId,
        d.InfoTypeId,
        d.RegDate,
        d.Dqn,
        d.MediaId,
        Status = d.Status.ToString().ToLowerInvariant(),
        d.UpdatedAt,
        Media = d.Media is null ? null : new
        {
            d.Media.Id,
            d.Media.OriginalName,
            d.Media.MimeType,
            d.Media.SizeBytes,
        },
    };
}
