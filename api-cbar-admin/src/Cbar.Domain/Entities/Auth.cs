using System.Net;

namespace Cbar.Domain.Entities;

public class Locale
{
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public bool IsDefault { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Role
{
    public short Id { get; set; }
    public string Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public List<Permission> Permissions { get; set; } = [];
}

public class Permission
{
    public int Id { get; set; }
    public string Code { get; set; } = null!;
    public string? Description { get; set; }
    public List<Role> Roles { get; set; } = [];
}

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public short RoleId { get; set; }
    public Role Role { get; set; } = null!;
    public string? TotpSecret { get; set; }
    public bool IsActive { get; set; } = true;
    public long? AvatarMediaId { get; set; }
    public MediaAsset? AvatarMedia { get; set; }
    public short FailedLogins { get; set; }
    public DateTimeOffset? LockedUntil { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
}

public class RefreshToken
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string TokenHash { get; set; } = null!;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public IPAddress? Ip { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public Guid FamilyId { get; set; }
    public DateTimeOffset FamilyCreatedAt { get; set; }
    public long? ReplacedById { get; set; }
}

public class UserSecurityStamp
{
    public int UserId { get; set; }
    public Guid Stamp { get; set; }
    public DateTimeOffset ChangedAt { get; set; }
}

public class UserSession
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string SessionKey { get; set; } = null!;
    public IPAddress? Ip { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastSeenAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
}

public class AuditLogEntry
{
    public long Id { get; set; }
    public int? ActorId { get; set; }
    public User? Actor { get; set; }
    public string Action { get; set; } = null!;
    public string? EntityType { get; set; }
    public long? EntityId { get; set; }
    public string? Before { get; set; }   // jsonb
    public string? After { get; set; }    // jsonb
    public IPAddress? Ip { get; set; }
    public string? UserAgent { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
