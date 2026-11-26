using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

/// <summary><c>MenuGroup</c> (spec 054): omitted or null keeps the stored label, <c>""</c> clears it.</summary>
public record PageTranslationDto(string Title, string? Content, string? Slug = null, string? MenuGroup = null);

/// <summary>Per-page settings checkboxes (parity with the legacy admin's Pages form).</summary>
public record PageFlagsDto(
    bool Active = true,
    bool Visible = true,
    bool ShowAz = true,
    bool ShowEn = true,
    bool Readonly = false,
    bool Disabled = false,
    bool Removable = true,
    bool RemovableAll = false,
    bool MovableU = true,
    bool MovableD = true,
    bool MovableL = false,
    bool MovableR = false,
    bool Selected = false,
    bool Collapsed = false,
    // Nullable unlike the rest: an omitted value keeps the stored one on update (spec 041 R4),
    // so a client that does not know the field cannot reset it.
    bool? ShowInSideNav = null,
    // Spec 054: dropdown menus below the section root; null follows ShowInSideNav. Omitted keeps the stored value.
    bool? ShowInDropdownNav = null);

public record PageUpsertDto(
    int? ParentId,
    int SortOrder,
    ContentStatus Status,
    bool ShowInFooter,
    Dictionary<string, PageTranslationDto> Translations,
    string? NavUrl = null,
    PageFlagsDto? Flags = null);

public record PageNodeDto(
    int Id, int? ParentId, int SortOrder, string Status, string? Title, string? Slug,
    string? NavUrl, PageFlagsDto Flags, List<PageNodeDto> Children);

public record PageAssetTranslationDto(string Title);
public record PageAssetAttachDto(long MediaId, Dictionary<string, PageAssetTranslationDto>? Translations, string? GroupLabel);
public record PageAssetUpdateDto(Dictionary<string, PageAssetTranslationDto> Translations, string? GroupLabel);
public record PageAssetOrderDto(List<long> AssetIds);

[ApiController]
[RequirePermission(Permissions.Pages.Read)]
[Route("api/v1/pages")]
public class PagesController(CbarDbContext db, AuditService audit) : CbarControllerBase
{
    /// <summary>The length of <c>page_translation_details.menu_group</c> (0039) and of the panel's input.</summary>
    internal const int MenuGroupMaxLength = 120;

    [HttpGet("tree")]
    public async Task<IActionResult> Tree([FromQuery] string locale = "az")
    {
        var pages = await db.Pages.AsNoTracking()
            .OrderBy(p => p.SortOrder)
            .Select(p => new
            {
                p.Id,
                p.ParentId,
                p.SortOrder,
                Status = p.Status.ToString().ToLowerInvariant(),
                Title = p.Translations.Where(t => t.Locale == locale).Select(t => t.Title).FirstOrDefault(),
                Slug = p.Translations.Where(t => t.Locale == locale).Select(t => t.Slug).FirstOrDefault(),
                p.NavUrl,
                Flags = new PageFlagsDto(
                    p.Active, p.Visible, p.ShowAz, p.ShowEn, p.Readonly, p.Disabled,
                    p.Removable, p.RemovableAll, p.MovableU, p.MovableD, p.MovableL, p.MovableR,
                    p.Selected, p.Collapsed, p.Details == null || p.Details.ShowInSideNav,
                    p.NavDetails == null ? null : p.NavDetails.ShowInDropdownNav),
            })
            .ToListAsync();

        var byParent = pages.ToLookup(p => p.ParentId);
        List<PageNodeDto> Build(int? parentId) =>
            byParent[parentId]
                .Select(p => new PageNodeDto(p.Id, p.ParentId, p.SortOrder, p.Status, p.Title, p.Slug,
                    p.NavUrl, p.Flags, Build(p.Id)))
                .ToList();

        return Ok(Build(null));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var page = await db.Pages.AsNoTracking()
            .Include(p => p.Translations)
            .Include(p => p.Details)
            .Include(p => p.NavDetails)
            .Include(p => p.TranslationDetails)
            .Include(p => p.Assets).ThenInclude(a => a.Media)
            .Include(p => p.Assets).ThenInclude(a => a.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        return page is null ? NotFound() : Ok(ToDetailDto(page));
    }

    [HttpPost]
    [RequirePermission(Permissions.Pages.Create)]
    public async Task<IActionResult> Create(PageUpsertDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");
        if (ValidateMenuGroups(dto) is { Count: > 0 } errors)
            return FieldValidationProblem(errors);

        string parentPath = "";
        if (dto.ParentId is { } parentId)
        {
            var parent = await db.Pages.AsNoTracking().SingleOrDefaultAsync(p => p.Id == parentId);
            if (parent is null)
                return BadRequestProblem("Parent page not found.");
            parentPath = parent.Path + ".";
        }

        var entity = new Page
        {
            ParentId = dto.ParentId,
            SortOrder = dto.SortOrder,
            Status = dto.Status,
            ShowInFooter = dto.ShowInFooter,
            Path = "0", // placeholder until id is known
        };
        ApplySettings(entity, dto, isCreate: true);
        await ApplyTranslationsAsync(entity, dto);

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Pages.Add(entity);
        await db.SaveChangesAsync();
        entity.Path = parentPath + entity.Id;
        audit.Log("pages.create", "page", entity.Id, after: dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDetailDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> Update(int id, PageUpsertDto dto)
    {
        var entity = await db.Pages
            .Include(p => p.Translations)
            .Include(p => p.Details)
            .Include(p => p.NavDetails)
            .Include(p => p.TranslationDetails)
            .Include(p => p.Assets).ThenInclude(a => a.Media)
            .Include(p => p.Assets).ThenInclude(a => a.Translations)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();
        if (dto.ParentId is { } newParent && newParent != entity.ParentId)
            return BadRequestProblem("Moving pages is not supported yet (Phase 2: tree move endpoint).");
        if (ValidateMenuGroups(dto) is { Count: > 0 } errors)
            return FieldValidationProblem(errors);

        var before = ToDetailDto(entity);
        entity.SortOrder = dto.SortOrder;
        entity.Status = dto.Status;
        entity.ShowInFooter = dto.ShowInFooter;
        ApplySettings(entity, dto);
        await ApplyTranslationsAsync(entity, dto);

        audit.Log("pages.update", "page", entity.Id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToDetailDto(entity));
    }

    public record MoveDto(int? NewParentId, int SortOrder);

    [HttpPost("{id:int}/move")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> Move(int id, MoveDto dto)
    {
        var entity = await db.Pages.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();

        // movable_u/d = reorder among siblings; movable_l/r = change parent (legacy semantics)
        var changesParent = dto.NewParentId != entity.ParentId;
        if (changesParent && entity is { MovableL: false, MovableR: false })
            return ConflictProblem("This page cannot be moved to another parent (movable flags).");
        if (!changesParent && dto.SortOrder != entity.SortOrder && entity is { MovableU: false, MovableD: false })
            return ConflictProblem("This page cannot be reordered (movable flags).");

        var oldPath = entity.Path;
        string newPath;
        if (dto.NewParentId is { } parentId)
        {
            if (parentId == id)
                return BadRequestProblem("A page cannot be its own parent.");
            var parent = await db.Pages.AsNoTracking().SingleOrDefaultAsync(p => p.Id == parentId);
            if (parent is null)
                return BadRequestProblem("Parent page not found.");
            if (parent.Path.StartsWith(oldPath + ".") )
                return BadRequestProblem("Cannot move a page under its own descendant.");
            newPath = parent.Path + "." + id;
        }
        else
        {
            newPath = id.ToString();
        }

        await using var tx = await db.Database.BeginTransactionAsync();
        entity.ParentId = dto.NewParentId;
        entity.SortOrder = dto.SortOrder;
        entity.Path = newPath;
        // Rewrite descendant paths: replace the old prefix with the new one.
        await db.Database.ExecuteSqlAsync($"""
            UPDATE pages
            SET path = {newPath}::ltree || subpath(path, nlevel({oldPath}::ltree))
            WHERE path <@ {oldPath}::ltree AND id <> {id}
            """);
        audit.Log("pages.move", "page", id, new { oldPath }, dto);
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Pages.Delete)]
    public async Task<IActionResult> Delete(int id, [FromServices] PermissionChecker perms)
    {
        var entity = await db.Pages.SingleOrDefaultAsync(p => p.Id == id);
        if (entity is null)
            return NotFound();
        if (!entity.Removable)
            return ConflictProblem("This page is protected from deletion (removable flag).");

        var now = DateTimeOffset.UtcNow;
        if (await db.Pages.AnyAsync(p => p.ParentId == id))
        {
            if (!entity.RemovableAll)
                return ConflictProblem("Page has children; delete or move them first.");
            // A whole subtree is a separate, admin-level permission (spec 008 FR-019);
            // checked before anything is changed.
            if (!await perms.HasAsync(Permissions.Pages.DeleteSubtree))
                return await perms.DenyAsync(Permissions.Pages.DeleteSubtree, "pages", id);
            // Soft-delete the whole subtree (legacy "removable with descendants").
            // Raw SQL with the ltree <@ operator: EF would translate StartsWith to
            // LIKE, which Postgres has no operator for on an ltree column.
            // The ids go into the audit entry (spec 008 US3). Read with a plain SELECT, then
            // updated by the same predicate in one transaction: an UPDATE … RETURNING through
            // SqlQuery would break as soon as EF wraps it in a subquery.
            var path = entity.Path;
            await using var tx = await db.Database.BeginTransactionAsync();
            var ids = await db.Database.SqlQuery<int>($"""
                SELECT id AS "Value" FROM pages
                WHERE path <@ {path}::ltree AND deleted_at IS NULL
                ORDER BY id
                FOR UPDATE
                """).ToListAsync();
            await db.Database.ExecuteSqlAsync($"""
                UPDATE pages SET deleted_at = {now}
                WHERE path <@ {path}::ltree AND deleted_at IS NULL
                """);
            audit.Log("pages.delete_subtree", "page", entity.Id, after: new { ids });
            await db.SaveChangesAsync();
            await tx.CommitAsync();
            return NoContent();
        }

        entity.DeletedAt = now;   // soft delete
        audit.Log("pages.delete", "page", entity.Id);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id:int}/assets")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> AttachAsset(int id, [FromBody] PageAssetAttachDto dto)
    {
        var page = await db.Pages.Include(p => p.Assets)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (page is null)
            return NotFound();
        var media = await db.MediaAssets.SingleOrDefaultAsync(m => m.Id == dto.MediaId);
        if (media is null)
            return BadRequestProblem("Media asset not found.");
        if (page.Assets.Any(a => a.MediaId == dto.MediaId))
            return ConflictProblem("Already attached.");

        var maxOrder = page.Assets.Count == 0 ? 0 : page.Assets.Max(a => a.SortOrder);
        var asset = new PageAsset
        {
            Media = media,
            MediaId = media.Id,
            SortOrder = maxOrder + 1,
            GroupLabel = NormalizeGroup(dto.GroupLabel),
        };

        var translations = dto.Translations ?? [];
        if (translations.Count == 0)
            translations = new Dictionary<string, PageAssetTranslationDto>
            {
                ["az"] = new(media.OriginalName),
                ["en"] = new(media.OriginalName),
            };
        foreach (var (locale, tr) in translations)
            asset.Translations.Add(new PageAssetTranslation { Locale = locale, Title = tr.Title });

        page.Assets.Add(asset);
        audit.Log("pages.attach_asset", "page", id, after: dto);
        await db.SaveChangesAsync();
        return Ok(ToAssetDto(asset));
    }

    [HttpPut("{id:int}/assets/{assetId:long}")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> UpdateAsset(int id, long assetId, [FromBody] PageAssetUpdateDto dto)
    {
        if (dto.Translations.Count == 0)
            return BadRequestProblem("At least one translation is required.");

        var asset = await db.Set<PageAsset>()
            .Include(a => a.Media)
            .Include(a => a.Translations)
            .SingleOrDefaultAsync(a => a.PageId == id && a.Id == assetId);
        if (asset is null)
            return NotFound();

        var before = ToAssetDto(asset);
        asset.GroupLabel = NormalizeGroup(dto.GroupLabel);
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = asset.Translations.SingleOrDefault(t => t.Locale == locale);
            if (existing is null)
                asset.Translations.Add(new PageAssetTranslation { Locale = locale, Title = tr.Title });
            else
                existing.Title = tr.Title;
        }
        asset.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));

        audit.Log("pages.update_asset", "page", id, before, dto);
        await db.SaveChangesAsync();
        return Ok(ToAssetDto(asset));
    }

    [HttpPut("{id:int}/assets/order")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> ReorderAssets(int id, [FromBody] PageAssetOrderDto dto)
    {
        var page = await db.Pages.Include(p => p.Assets)
            .SingleOrDefaultAsync(p => p.Id == id);
        if (page is null)
            return NotFound();

        var current = page.Assets.Select(a => a.Id).ToHashSet();
        if (dto.AssetIds.Count != current.Count || !current.SetEquals(dto.AssetIds))
            return BadRequestProblem("assetIds must contain exactly the page's asset ids.");

        var before = page.Assets.OrderBy(a => a.SortOrder).Select(a => a.Id).ToList();
        for (var i = 0; i < dto.AssetIds.Count; i++)
            page.Assets.Single(a => a.Id == dto.AssetIds[i]).SortOrder = i + 1;

        audit.Log("pages.reorder_assets", "page", id,
            before: new { assetIds = before }, after: dto);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}/assets/{assetId:long}")]
    [RequirePermission(Permissions.Pages.Update)]
    public async Task<IActionResult> DetachAsset(int id, long assetId)
    {
        var asset = await db.Set<PageAsset>()
            .SingleOrDefaultAsync(a => a.PageId == id && a.Id == assetId);
        if (asset is null)
            return NotFound();

        db.Remove(asset);
        audit.Log("pages.detach_asset", "page", id, before: new { assetId, asset.MediaId });
        await db.SaveChangesAsync();
        return NoContent();
    }

    private async Task ApplyTranslationsAsync(Page entity, PageUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            var existing = entity.Translations.SingleOrDefault(t => t.Locale == locale);
            var requestedSlug = string.IsNullOrWhiteSpace(tr.Slug) ? null : tr.Slug;
            if (existing is null)
            {
                // New translation: use the editor's slug if given, else derive from the title.
                entity.Translations.Add(new PageTranslation
                {
                    Locale = locale,
                    Title = tr.Title,
                    Slug = await UniqueSlugAsync(locale, requestedSlug ?? tr.Title, excludeTranslationId: null),
                    Content = tr.Content,
                });
            }
            else
            {
                // Slug is the page's permanent URL: it stays stable when the title
                // changes, and only moves when the editor explicitly edits the slug.
                existing.Title = tr.Title;
                existing.Content = tr.Content;
                if (requestedSlug != null && Slug.From(requestedSlug) != existing.Slug)
                    existing.Slug = await UniqueSlugAsync(locale, requestedSlug, existing.Id);
            }
        }
        entity.Translations.RemoveAll(t => !dto.Translations.ContainsKey(t.Locale));
        ApplyMenuGroups(entity, dto);
    }

    /// <summary>
    /// The trimmed label must fit its column; checked here so the panel gets a field error rather than the database's
    /// unnamed "value too long". Keyed like the panel's form field (<c>translations.az.menuGroup</c>).
    /// </summary>
    internal static Dictionary<string, string[]> ValidateMenuGroups(PageUpsertDto dto)
    {
        var errors = new Dictionary<string, string[]>();
        foreach (var (locale, tr) in dto.Translations)
            if (tr.MenuGroup?.Trim().Length > MenuGroupMaxLength)
                errors[$"translations.{locale}.menuGroup"] = [$"Menyu qrupu ən çox {MenuGroupMaxLength} simvol ola bilər."];
        return errors;
    }

    /// <summary>
    /// The menu group label of each locale (spec 054, page_translation_details): null keeps it, "" clears it. A locale
    /// whose translation is removed loses its label too.
    /// </summary>
    private static void ApplyMenuGroups(Page entity, PageUpsertDto dto)
    {
        foreach (var (locale, tr) in dto.Translations)
        {
            if (tr.MenuGroup is null)
                continue;
            var label = tr.MenuGroup.Trim();
            var detail = entity.TranslationDetails.SingleOrDefault(d => d.Locale == locale);
            if (label.Length == 0)
            {
                if (detail is not null)
                    entity.TranslationDetails.Remove(detail);
                continue;
            }
            if (detail is null)
            {
                detail = new PageTranslationDetail { Locale = locale };
                entity.TranslationDetails.Add(detail);
            }
            detail.MenuGroup = label;
        }
        entity.TranslationDetails.RemoveAll(d => !dto.Translations.ContainsKey(d.Locale));
    }

    /// <summary>Section titles repeat across the tree (e.g. "Kredit təşkilatları"), so slugs get a -N suffix on collision.</summary>
    private async Task<string> UniqueSlugAsync(string locale, string title, long? excludeTranslationId)
    {
        var baseSlug = Slug.From(title);
        var taken = await db.PageTranslations
            .Where(t => t.Locale == locale && t.Slug.StartsWith(baseSlug)
                        && (excludeTranslationId == null || t.Id != excludeTranslationId))
            .Select(t => t.Slug)
            .ToListAsync();

        if (!taken.Contains(baseSlug))
            return baseSlug;
        for (var n = 2; ; n++)
        {
            var candidate = $"{baseSlug}-{n}";
            if (!taken.Contains(candidate))
                return candidate;
        }
    }

    /// <summary>
    /// Both <c>flags</c> and <c>navUrl</c> are optional in the payload. On update they are
    /// left untouched when omitted — mapping a missing <c>flags</c> to the defaults would
    /// silently clear protection flags (removable/movable) on a partial edit. Inside <c>flags</c>,
    /// every omitted field takes its default except <c>showInSideNav</c>, which is left as stored.
    /// </summary>
    internal static void ApplySettings(Page entity, PageUpsertDto dto, bool isCreate = false)
    {
        if (isCreate || dto.NavUrl is not null)
            entity.NavUrl = string.IsNullOrWhiteSpace(dto.NavUrl) ? null : dto.NavUrl.Trim();
        if (!isCreate && dto.Flags is null)
            return;
        var f = dto.Flags ?? new PageFlagsDto();
        entity.Active = f.Active;
        entity.Visible = f.Visible;
        entity.ShowAz = f.ShowAz;
        entity.ShowEn = f.ShowEn;
        entity.Readonly = f.Readonly;
        entity.Disabled = f.Disabled;
        entity.Removable = f.Removable;
        entity.RemovableAll = f.RemovableAll;
        entity.MovableU = f.MovableU;
        entity.MovableD = f.MovableD;
        entity.MovableL = f.MovableL;
        entity.MovableR = f.MovableR;
        entity.Selected = f.Selected;
        entity.Collapsed = f.Collapsed;
        // A row is written only when the flag is off or one exists already (spec 041 R5).
        if (f.ShowInSideNav is { } showInSideNav && (!showInSideNav || entity.Details is not null))
        {
            entity.Details ??= new PageDetail();
            entity.Details.ShowInSideNav = showInSideNav;
        }
        // Spec 054: a row is written only when the value differs from the left-menu flag it would follow, or one exists.
        var followed = entity.Details?.ShowInSideNav ?? true;
        if (f.ShowInDropdownNav is { } showInDropdownNav && (showInDropdownNav != followed || entity.NavDetails is not null))
        {
            entity.NavDetails ??= new PageNavDetail();
            entity.NavDetails.ShowInDropdownNav = showInDropdownNav;
        }
    }

    private static object ToDetailDto(Page p) => new
    {
        p.Id,
        p.ParentId,
        p.SortOrder,
        Status = p.Status.ToString().ToLowerInvariant(),
        p.ShowInFooter,
        p.NavUrl,
        Flags = new PageFlagsDto(
            p.Active, p.Visible, p.ShowAz, p.ShowEn, p.Readonly, p.Disabled,
            p.Removable, p.RemovableAll, p.MovableU, p.MovableD, p.MovableL, p.MovableR,
            p.Selected, p.Collapsed, p.Details == null || p.Details.ShowInSideNav,
                    p.NavDetails == null ? null : p.NavDetails.ShowInDropdownNav),
        Translations = p.Translations.ToDictionary(
            t => t.Locale,
            t => new { t.Title, t.Slug, t.Content, p.TranslationDetails.FirstOrDefault(d => d.Locale == t.Locale)?.MenuGroup }),
        Assets = p.Assets
            .OrderBy(a => a.SortOrder)
            .Select(ToAssetDto),
    };

    private static object ToAssetDto(PageAsset a) => new
    {
        a.Id,
        a.MediaId,
        a.Media?.OriginalName,
        a.Media?.MimeType,
        SizeBytes = a.Media?.SizeBytes,
        a.SortOrder,
        a.GroupLabel,
        Translations = a.Translations.ToDictionary(t => t.Locale, t => new { t.Title }),
    };

    private static string? NormalizeGroup(string? groupLabel)
    {
        var trimmed = groupLabel?.Trim();
        return string.IsNullOrEmpty(trimmed) ? null : trimmed;
    }
}
