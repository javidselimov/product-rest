using System.Security.Claims;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Cbar.AdminApi.Services;
using Cbar.AdminApi.Validation;
using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Controllers;

public record UserCreateDto(string Username, string Email, string Password, short RoleId);
public record UserUpdateDto(string Email, short RoleId, bool IsActive);
public record UserPasswordResetDto(string NewPassword);

[ApiController]
// User administration is admin-only (users.* is granted to no other role, spec 008): without
// it any authenticated user could create an admin account or reset an admin's password.
[RequirePermission(Permissions.Users.Read)]
[Route("api/v1/users")]
public class UsersController(
    CbarDbContext db, AuditService audit, RefreshTokenService refreshTokens, SecurityStampService stamps)
    : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] PagingQuery paging, [FromQuery] string? search = null)
    {
        var query = db.Users.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(u =>
                EF.Functions.ILike(u.Username, $"%{search}%") ||
                EF.Functions.ILike(u.Email, $"%{search}%"));

        var w = paging.Resolve(20);
        var total = await query.CountAsync();
        var items = await query
            .OrderBy(u => u.Id)
            .Skip(w.Skip).Take(w.PageSize)
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.Email,
                RoleCode = u.Role.Code,
                u.IsActive,
                u.CreatedAt,
            })
            .ToListAsync();

        return Ok(new { items, total, page = w.Page, pageSize = w.PageSize });
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Get(int id)
    {
        var item = await db.Users.AsNoTracking()
            .Include(u => u.Role)
            .SingleOrDefaultAsync(u => u.Id == id);
        return item is null ? NotFound() : Ok(ToDto(item));
    }

    [HttpPost]
    [RequirePermission(Permissions.Users.Create)]
    public async Task<IActionResult> Create(UserCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Username))
            return BadRequestProblem("Username is required.");
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequestProblem("Email is required.");
        if (PasswordPolicyError(dto.Password) is { } policyError)
            return BadRequestProblem(policyError);

        var role = await db.Roles.SingleOrDefaultAsync(r => r.Id == dto.RoleId);
        if (role is null)
            return BadRequestProblem("Role not found.");

        // Include soft-deleted rows: username/email unique indexes apply to the whole table.
        var taken = await db.Users.IgnoreQueryFilters()
            .AnyAsync(u => u.Username == dto.Username || u.Email == dto.Email);
        if (taken)
            return ConflictProblem("Username or email is already in use.");

        var entity = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, workFactor: PasswordHashing.WorkFactor),
            RoleId = dto.RoleId,
        };

        await using var tx = await db.Database.BeginTransactionAsync();
        db.Users.Add(entity);
        await db.SaveChangesAsync();
        audit.Log("users.create", "user", entity.Id,
            after: new { dto.Username, dto.Email, dto.RoleId });   // never log the password
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        entity.Role = role;
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, ToDto(entity));
    }

    [HttpPut("{id:int}")]
    [RequirePermission(Permissions.Users.Update)]
    public async Task<IActionResult> Update(int id, UserUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequestProblem("Email is required.");
        var newRoleCode = await db.Roles
            .Where(r => r.Id == dto.RoleId).Select(r => r.Code).SingleOrDefaultAsync();
        if (newRoleCode is null)
            return BadRequestProblem("Role not found.");

        var entity = await db.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Id == id);
        if (entity is null)
            return NotFound();

        var emailTaken = await db.Users.IgnoreQueryFilters()
            .AnyAsync(u => u.Id != id && u.Email == dto.Email);
        if (emailTaken)
            return ConflictProblem("Email is already in use.");

        // The Update side of Delete's last-admin rule (spec 015): checked before any
        // change, so a refused edit saves nothing, logs nothing and revokes nothing.
        var losesAdmin = entity.IsActive && entity.Role.Code == "admin"
            && (!dto.IsActive || newRoleCode != "admin");
        if (losesAdmin && !await HasOtherActiveAdminAsync(id))
            return ConflictProblem("Cannot deactivate or demote the last active administrator.");

        var before = new { entity.Email, entity.RoleId, entity.IsActive };
        entity.Email = dto.Email;
        entity.RoleId = dto.RoleId;
        entity.IsActive = dto.IsActive;
        if (!before.IsActive && dto.IsActive)
        {
            // Reactivation starts clean (spec 012 FR-007).
            entity.FailedLogins = 0;
            entity.LockedUntil = null;
        }

        await using var tx = await db.Database.BeginTransactionAsync();
        audit.Log("users.update", "user", entity.Id, before, dto);
        await db.SaveChangesAsync();
        // Same transaction as the change (spec 020): if the database rejects the save, the
        // stamp is not rotated either.
        if ((before.IsActive && !dto.IsActive) || before.RoleId != dto.RoleId)
            await stamps.RotateAsync(entity.Id);
        await tx.CommitAsync();
        // Deactivation ends the user's sessions; a role change only revokes the access
        // token (spec 020), not the refresh tokens, so the next refresh issues a token
        // with the new role and the user stays signed in.
        if (before.IsActive && !dto.IsActive)
            await refreshTokens.RevokeAllForUserAsync(entity.Id);

        await db.Entry(entity).Reference(u => u.Role).LoadAsync();
        return Ok(ToDto(entity));
    }

    [HttpPut("{id:int}/password")]
    [RequirePermission(Permissions.Users.Update)]
    public async Task<IActionResult> ResetPassword(int id, UserPasswordResetDto dto)
    {
        if (PasswordPolicyError(dto.NewPassword) is { } policyError)
            return BadRequestProblem(policyError);

        var entity = await db.Users.SingleOrDefaultAsync(u => u.Id == id);
        if (entity is null)
            return NotFound();

        entity.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword, workFactor: PasswordHashing.WorkFactor);
        // The lock is invisible from outside (spec 012 Q1), so a locked editor's support
        // path is a password reset — it must clear the lock too.
        entity.FailedLogins = 0;
        entity.LockedUntil = null;
        await using var tx = await db.Database.BeginTransactionAsync();
        audit.Log("users.reset_password", "user", entity.Id);   // never log the password
        await db.SaveChangesAsync();
        await stamps.RotateAsync(entity.Id);   // old access tokens die on the next request (spec 020)
        await tx.CommitAsync();
        await refreshTokens.RevokeAllForUserAsync(entity.Id);
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    [RequirePermission(Permissions.Users.Delete)]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await db.Users.Include(u => u.Role).SingleOrDefaultAsync(u => u.Id == id);
        if (entity is null)
            return NotFound();

        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (int.TryParse(sub, out var callerId) && callerId == id)
            return ConflictProblem("You cannot delete your own account.");

        if (entity.Role.Code == "admin" && entity.IsActive && !await HasOtherActiveAdminAsync(id))
            return ConflictProblem("Cannot delete the last active administrator.");

        entity.DeletedAt = DateTimeOffset.UtcNow;   // soft delete
        entity.IsActive = false;
        await using var tx = await db.Database.BeginTransactionAsync();
        audit.Log("users.delete", "user", entity.Id);
        await db.SaveChangesAsync();
        await stamps.RotateAsync(entity.Id);   // spec 020
        await tx.CommitAsync();
        await refreshTokens.RevokeAllForUserAsync(entity.Id);
        return NoContent();
    }

    // Delete and Update share this rule so neither can leave the panel without an admin.
    // The Users query filter already excludes soft-deleted accounts.
    private Task<bool> HasOtherActiveAdminAsync(int exceptUserId) =>
        db.Users.AnyAsync(u => u.Id != exceptUserId && u.IsActive && u.Role.Code == "admin");

    private static string? PasswordPolicyError(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            return "Password must be at least 8 characters long.";
        if (!password.Any(char.IsUpper))
            return "Password must contain an uppercase letter.";
        if (!password.Any(char.IsLower))
            return "Password must contain a lowercase letter.";
        if (!password.Any(char.IsDigit))
            return "Password must contain a digit.";
        if (password.All(char.IsLetterOrDigit))
            return "Password must contain a special character.";
        return null;
    }

    private static object ToDto(User u) => new
    {
        u.Id,
        u.Username,
        u.Email,
        u.RoleId,
        RoleCode = u.Role.Code,
        u.IsActive,
        u.CreatedAt,
        u.UpdatedAt,
    };
}
