namespace Cbar.Domain.Entities;

/// <summary>
/// An international financial institution the country cooperates with (spec 044). The site shows it
/// as an accordion card on the CMS page "Beynəlxalq maliyyə təşkilatları ilə əməkdaşlıq", so it has
/// no slug and no address of its own.
/// </summary>
public class IfiOrganization
{
    public int Id { get; set; }
    /// <summary>The logo in the card header; a card without one shows the name only.</summary>
    public long? LogoMediaId { get; set; }
    public string? WebsiteUrl { get; set; }
    /// <summary>The year shown as "Üzvlük: 1992" in the card header.</summary>
    public short? MemberSince { get; set; }
    public int SortOrder { get; set; }
    public ContentStatus Status { get; set; } = ContentStatus.Draft;
    public bool ShowAz { get; set; } = true;
    public bool ShowEn { get; set; } = true;
    public int? CreatedBy { get; set; }
    public int? UpdatedBy { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public List<IfiOrganizationTranslation> Translations { get; set; } = [];
    public List<IfiMembership> Memberships { get; set; } = [];
}

public class IfiOrganizationTranslation
{
    public long Id { get; set; }
    public int OrganizationId { get; set; }
    public IfiOrganization Organization { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
    /// <summary>The text of the "Əsas missiya" box.</summary>
    public string? Mission { get; set; }
    /// <summary>The bold line above the membership dates.</summary>
    public string? MembershipIntro { get; set; }
    /// <summary>Rich text below the membership dates.</summary>
    public string? Content { get; set; }
}

/// <summary>An institution of the organization the country joined, with its date.</summary>
public class IfiMembership
{
    public long Id { get; set; }
    public int OrganizationId { get; set; }
    public IfiOrganization Organization { get; set; } = null!;
    public DateOnly JoinedOn { get; set; }
    public int SortOrder { get; set; }
    public List<IfiMembershipTranslation> Translations { get; set; } = [];
}

public class IfiMembershipTranslation
{
    public long Id { get; set; }
    public long MembershipId { get; set; }
    public IfiMembership Membership { get; set; } = null!;
    public string Locale { get; set; } = null!;
    public string Name { get; set; } = null!;
}
