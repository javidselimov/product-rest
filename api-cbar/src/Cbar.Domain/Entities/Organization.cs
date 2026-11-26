namespace Cbar.Domain.Entities;

public class OrganizationDivision
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public long? MediaId { get; set; }
    public MediaAsset? Media { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<OrganizationDivisionTranslation> Translations { get; set; } = [];
}

public class OrganizationDivisionTranslation
{
    public long Id { get; set; }
    public int DivisionId { get; set; }
    public OrganizationDivision Division { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public OrganizationDivisionTranslationDetail? Details { get; set; }
}

/// <summary>Per-locale extras of a division translation — companion table, see migration 0016.</summary>
public class OrganizationDivisionTranslationDetail
{
    public long TranslationId { get; set; }
    /// <summary>Regulation document ("Əsasnamə") shown as a file row on the department page (Figma `1003:12461`).</summary>
    public long? RegulationMediaId { get; set; }
    public MediaAsset? RegulationMedia { get; set; }
}

public class OrganizationOffice
{
    public int Id { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public OrganizationOfficeDetail? Details { get; set; }
    public List<OrganizationOfficeTranslation> Translations { get; set; } = [];
}

/// <summary>Card fields of an office; an office without one reads as nulls.</summary>
public class OrganizationOfficeDetail
{
    public int OfficeId { get; set; }
    /// <summary>Photo of the office building on the public card (legacy `photo`).</summary>
    public long? PhotoMediaId { get; set; }
    public MediaAsset? PhotoMedia { get; set; }
}

public class OrganizationOfficeTranslation
{
    public long Id { get; set; }
    public int OfficeId { get; set; }
    public OrganizationOffice Office { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public OrganizationOfficeTranslationDetail? Details { get; set; }
}

/// <summary>Per-locale card fields of an office; a translation without one reads as nulls.</summary>
public class OrganizationOfficeTranslationDetail
{
    public long TranslationId { get; set; }
    /// <summary>Head of the office ("Rəhbər"; legacy `director_name_{az,en}`).</summary>
    public string? DirectorName { get; set; }
    /// <summary>Regulation document ("Əsasnamə") per locale (legacy `filename_{az,en}`).</summary>
    public long? RegulationMediaId { get; set; }
    public MediaAsset? RegulationMedia { get; set; }
}

public class OrganizationStaff
{
    public int Id { get; set; }
    public short Type { get; set; } = 1;          // 1 = board, 2 = management
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public string? Phone { get; set; }
    public long? PhotoMediaId { get; set; }
    public MediaAsset? PhotoMedia { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<OrganizationStaffTranslation> Translations { get; set; } = [];
    public List<OrganizationStaffPhoto> Photos { get; set; } = [];
}

public class OrganizationStaffTranslation
{
    public long Id { get; set; }
    public int StaffId { get; set; }
    public OrganizationStaff Staff { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string FullName { get; set; } = null!;
    public string? Position { get; set; }
    public string? ReceptionDays { get; set; }
    public string? Bio { get; set; }
}

/// <summary>Press photo offered for download under the biography; the header portrait is <see cref="OrganizationStaff.PhotoMediaId"/>.</summary>
public class OrganizationStaffPhoto
{
    public long Id { get; set; }
    public int StaffId { get; set; }
    public OrganizationStaff Staff { get; set; } = null!;
    public long MediaId { get; set; }
    public MediaAsset Media { get; set; } = null!;
    public int SortOrder { get; set; }
}

/// <summary>
/// One card of the organisational chart. Links to a staff member or a division (name, position
/// and the public link come from there) or stands alone with its own title; see
/// db/migrations/0015-org-chart-nodes.sql.
/// </summary>
public class OrgChartNode
{
    public int Id { get; set; }
    public int? ParentId { get; set; }
    public OrgChartNode? Parent { get; set; }
    public List<OrgChartNode> Children { get; set; } = [];
    /// <summary>1 governor, 2 deputy, 3 director general, 4 block, 5 department, 6 group.</summary>
    public short Kind { get; set; }
    public int? StaffId { get; set; }
    public OrganizationStaff? Staff { get; set; }
    public int? DivisionId { get; set; }
    public OrganizationDivision? Division { get; set; }
    public bool CuratorDirect { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
    /// <summary>
    /// Desktop position on the old 984 px canvas; all four null until placed. Unused since
    /// spec 060 (the chart is laid out from the tree), kept for a rollback.
    /// </summary>
    public decimal? X { get; set; }
    public decimal? Y { get; set; }
    public decimal? W { get; set; }
    public decimal? H { get; set; }
    /// <summary>JSON array of [x, y] points to the parent; null for the automatic line. Unused since spec 060.</summary>
    public string? Connector { get; set; }   // jsonb
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public List<OrgChartNodeTranslation> Translations { get; set; } = [];
    public OrgChartNodeDetail? Details { get; set; }
}

/// <summary>Companion row of a chart node: see db/migrations/0045-org-chart-node-details.sql.</summary>
public class OrgChartNodeDetail
{
    public int NodeId { get; set; }
    /// <summary>A block or group shows its departments always open instead of a dropdown (spec 060).</summary>
    public bool DepartmentsOpen { get; set; }
}

public class OrgChartNodeTranslation
{
    public long Id { get; set; }
    public int NodeId { get; set; }
    public OrgChartNode Node { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string? Title { get; set; }
    public string? Subtitle { get; set; }
}
