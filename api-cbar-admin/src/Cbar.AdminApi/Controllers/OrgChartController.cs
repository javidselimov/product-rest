using System.Text.Json;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record OrgChartNodeTranslationDto(string? Title, string? Subtitle);
public record OrgChartNodeUpsertDto(
    int? ParentId,
    short Kind,
    int? StaffId,
    int? DivisionId,
    bool CuratorDirect,
    int SortOrder,
    bool IsActive,
    Dictionary<string, OrgChartNodeTranslationDto> Translations,
    bool? DepartmentsOpen = null);
public record OrgChartOrderDto(int? ParentId, List<int> Ids);
public record OrgChartLayoutDto(decimal X, decimal Y, decimal W, decimal H);
public record OrgChartLayoutItemDto(int Id, OrgChartLayoutDto? Layout, List<decimal[]>? Connector);
public record OrgChartLayoutUpdateDto(List<OrgChartLayoutItemDto> Items);

/// <summary>
/// Organisational chart nodes (db/migrations/0015-org-chart-nodes.sql). The tree comes from
/// <c>parentId</c>, and since spec 060 the desktop chart is laid out from it: the editor gives the
/// sibling order (<c>/order</c>) and, for a block or group, whether its departments are always open
/// (<c>departmentsOpen</c>, companion table 0045). The old canvas positions (<c>/layout</c>) are kept
/// for a rollback but no client reads or writes them.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Organization.Read)]
[Route("api/v1/organization/chart")]
public class OrgChartController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    // numeric(7,2) holds up to 99999.99.
    private const decimal MaxCoordinate = 99999m;
    private const string AuditEntity = "org_chart_node";
    private const short BlockKind = 4;
    private const short GroupKind = 6;

    [HttpGet]
    public async Task<IActionResult> List()
    {
        var items = await WithDetails(db.OrgChartNodes.AsNoTracking())
            .OrderBy(n => n.SortOrder).ThenBy(n => n.Id)
            .ToListAsync();
        return Ok(items.Select(ToDetailDto));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await WithDetails(db.OrgChartNodes.AsNoTracking())
            .SingleOrDefaultAsync(n => n.Id == id);
        return item is null ? NotFound() : Ok(ToDetailDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Organization.Create)]
    public async Task<IActionResult> Create(OrgChartNodeUpsertDto dto)
    {
        if (await ValidateAsync(null, dto) is { } invalid)
            return invalid;

        var entity = new OrgChartNode();
        Apply(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.OrgChartNodes.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("org_chart_nodes.create", AuditEntity,entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(await LoadAsync(entity.Id)));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> Update(int id, OrgChartNodeUpsertDto dto)
    {
        var entity = await db.OrgChartNodes
            .Include(n => n.Translations)
            .Include(n => n.Details)
            .SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();
        if (await ValidateAsync(id, dto) is { } invalid)
            return invalid;

        var before = ToDetailDto(await LoadAsync(id));
        Apply(entity, dto);

        audit.Log("org_chart_nodes.update", AuditEntity,entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(await LoadAsync(id)));
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Organization.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        // Details are loaded so EF deletes the 0045 row too, also where the database has no FK for it.
        var entity = await db.OrgChartNodes.Include(n => n.Details).SingleOrDefaultAsync(n => n.Id == id);
        if (entity is null)
            return NotFound();
        if (await db.OrgChartNodes.AnyAsync(n => n.ParentId == id))
            return ConflictProblem("The node still has child nodes; move or delete them first.");

        db.OrgChartNodes.Remove(entity);
        audit.Log("org_chart_nodes.delete", AuditEntity,entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>
    /// Reorders the children of one node (the roots when <c>parentId</c> is null): <c>ids</c> must name
    /// every child, inactive ones included, once. Writes <c>sortOrder</c> 1…n (spec 060).
    /// </summary>
    [HttpPut("order")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> Reorder([FromBody] OrgChartOrderDto dto)
    {
        if (dto.ParentId is { } parentId && !await db.OrgChartNodes.AnyAsync(n => n.Id == parentId))
            return NotFound();

        var children = await db.OrgChartNodes.Where(n => n.ParentId == dto.ParentId)
            .OrderBy(n => n.SortOrder).ThenBy(n => n.Id).ToListAsync();
        if (ContentSupport.InvalidOrder(dto.Ids, children.Select(n => n.Id).ToList()) is { } message)
            return BadRequestProblem(message);

        var before = children.Select(n => n.Id).ToList();
        for (var i = 0; i < dto.Ids.Count; i++)
            children.Single(n => n.Id == dto.Ids[i]).SortOrder = i + 1;

        // The siblings change, not one node: entity id is the parent (0 for the roots).
        audit.Log("org_chart_nodes.reorder", AuditEntity,dto.ParentId ?? 0, before: new { ids = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Deprecated since spec 060: the admin panel no longer calls it; kept for a rollback.</summary>
    [HttpPut("layout")]
    [RequirePermission(Permissions.Organization.Update)]
    public async Task<IActionResult> UpdateLayout(OrgChartLayoutUpdateDto dto)
    {
        if (dto.Items.Count == 0)
            return BadRequestProblem("At least one item is required.");
        if (dto.Items.Select(i => i.Id).Distinct().Count() != dto.Items.Count)
            return BadRequestProblem("Each node id may appear only once.");
        foreach (var item in dto.Items)
        {
            if (item.Layout is { } l && !IsValidLayout(l))
                return BadRequestProblem($"Node {item.Id}: x and y must be 0–{MaxCoordinate}, w and h above 0.");
            if (item.Connector is { } c && !IsValidConnector(c))
                return BadRequestProblem($"Node {item.Id}: a connector needs at least two [x, y] points within the canvas.");
        }

        var ids = dto.Items.Select(i => i.Id).ToList();
        var nodes = await db.OrgChartNodes.Where(n => ids.Contains(n.Id)).ToDictionaryAsync(n => n.Id);
        if (nodes.Count != ids.Count)
            return BadRequestProblem($"Unknown node id(s): {string.Join(", ", ids.Where(i => !nodes.ContainsKey(i)))}.");

        foreach (var item in dto.Items)
        {
            var node = nodes[item.Id];
            node.X = item.Layout?.X;
            node.Y = item.Layout?.Y;
            node.W = item.Layout?.W;
            node.H = item.Layout?.H;
            node.Connector = item.Connector is null ? null : JsonSerializer.Serialize(item.Connector);
        }

        audit.Log("org_chart_nodes.layout", AuditEntity,0, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task<ObjectResult?> ValidateAsync(int? id, OrgChartNodeUpsertDto dto)
    {
        if (dto.Kind is < 1 or > 6)
            return BadRequestProblem("Kind must be 1–6.");
        if (dto.StaffId is not null && dto.DivisionId is not null)
            return BadRequestProblem("Link a staff member or a division, not both.");
        if (dto.StaffId is { } staffId && !await db.OrganizationStaff.AnyAsync(s => s.Id == staffId))
            return BadRequestProblem("Staff member not found.");
        if (dto.DivisionId is { } divisionId && !await db.OrganizationDivisions.AnyAsync(d => d.Id == divisionId))
            return BadRequestProblem("Division not found.");
        if (dto.StaffId is null && dto.DivisionId is null
            && !dto.Translations.Values.Any(t => !string.IsNullOrWhiteSpace(t.Title)))
            return BadRequestProblem("A node without a linked staff member or division needs a title.");
        if (ValidateDepartmentsOpen(dto.Kind, dto.DepartmentsOpen) is { } open)
            return BadRequestProblem(open);

        return dto.ParentId is { } parentId ? await ValidateParentAsync(id, parentId) : null;
    }

    /// <summary>Only a block or a group can keep its departments always open (spec 060).</summary>
    internal static string? ValidateDepartmentsOpen(short kind, bool? departmentsOpen) =>
        departmentsOpen == true && kind is not (BlockKind or GroupKind)
            ? "Only a block or a group can show its departments always open."
            : null;

    private async Task<ObjectResult?> ValidateParentAsync(int? id, int parentId)
    {
        var parents = await db.OrgChartNodes.AsNoTracking()
            .ToDictionaryAsync(n => n.Id, n => n.ParentId);
        if (!parents.ContainsKey(parentId))
            return BadRequestProblem("Parent node not found.");
        // Walk up from the new parent; meeting the node itself means a cycle. The step cap
        // only guards against a cycle already in the data.
        int? cursor = parentId;
        for (var steps = 0; cursor is { } c && steps <= parents.Count; steps++)
        {
            if (c == id)
                return BadRequestProblem("A node cannot be placed under itself or one of its descendants.");
            cursor = parents.GetValueOrDefault(c);
        }
        return null;
    }

    private static void Apply(OrgChartNode entity, OrgChartNodeUpsertDto dto)
    {
        entity.ParentId = dto.ParentId;
        entity.Kind = dto.Kind;
        entity.StaffId = dto.StaffId;
        entity.DivisionId = dto.DivisionId;
        entity.CuratorDirect = dto.CuratorDirect;
        entity.SortOrder = dto.SortOrder;
        entity.IsActive = dto.IsActive;

        // Null keeps the stored value. A row is written only when it says something (true) or already exists.
        if (dto.DepartmentsOpen is { } open)
        {
            if (entity.Details is { } details)
                details.DepartmentsOpen = open;
            else if (open)
                entity.Details = new OrgChartNodeDetail { DepartmentsOpen = true };
        }

        foreach (var (locale, tr) in dto.Translations)
        {
            var title = Blank(tr.Title);
            var subtitle = Blank(tr.Subtitle);
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                entity.Translations.Add(new OrgChartNodeTranslation { Locale = locale, Title = title, Subtitle = subtitle });
            else
            {
                existing.Title = title;
                existing.Subtitle = subtitle;
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
    }

    private static string? Blank(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    private static bool IsValidLayout(OrgChartLayoutDto l) =>
        l.X is >= 0 and <= MaxCoordinate && l.Y is >= 0 and <= MaxCoordinate
        && l.W is > 0 and <= MaxCoordinate && l.H is > 0 and <= MaxCoordinate;

    private static bool IsValidConnector(List<decimal[]> points) =>
        points.Count >= 2 && points.All(p => p is { Length: 2 } && p.All(v => v is >= 0 and <= MaxCoordinate));

    private static IQueryable<OrgChartNode> WithDetails(IQueryable<OrgChartNode> query) => query
        .Include(n => n.Translations)
        .Include(n => n.Details)
        .Include(n => n.Staff).ThenInclude(s => s!.Translations)
        .Include(n => n.Division).ThenInclude(d => d!.Translations);

    private Task<OrgChartNode> LoadAsync(int id) =>
        WithDetails(db.OrgChartNodes.AsNoTracking()).SingleAsync(n => n.Id == id);

    private static object ToDetailDto(OrgChartNode n) => new
    {
        n.Id,
        n.ParentId,
        n.Kind,
        n.StaffId,
        n.DivisionId,
        n.CuratorDirect,
        n.SortOrder,
        n.IsActive,
        DepartmentsOpen = n.Details?.DepartmentsOpen ?? false,
        Layout = n.X is { } x && n.Y is { } y && n.W is { } w && n.H is { } h
            ? new { X = x, Y = y, W = w, H = h }
            : null,
        Connector = n.Connector is null ? null : JsonSerializer.Deserialize<decimal[][]>(n.Connector),
        n.UpdatedAt,
        Translations = n.Translations.ToDictionary(t => t.Locale, t => new { t.Title, t.Subtitle }),
        Linked = LinkedTexts(n),
    };

    private static Dictionary<string, LinkedText> LinkedTexts(OrgChartNode n)
    {
        if (n.Staff is not null)
            return n.Staff.Translations.ToDictionary(t => t.Locale, t => new LinkedText(t.FullName, t.Position));
        if (n.Division is not null)
            return n.Division.Translations.ToDictionary(t => t.Locale, t => new LinkedText(t.Name, null));
        return [];
    }

    private sealed record LinkedText(string Name, string? Role);
}
