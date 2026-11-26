using System.Security.Claims;
using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Microsoft.AspNetCore.Mvc;

namespace Cbar.AdminApi.Controllers;

/// <summary>Data about the caller themself; open to every authenticated user (spec 008 FR-007).</summary>
[ApiController]
[AnyAuthenticatedUser]
[Route("api/v1/me")]
public class MeController(PermissionMatrix matrix) : CbarControllerBase
{
    [HttpGet("permissions")]
    public async Task<IActionResult> GetPermissions()
    {
        var role = User.FindFirstValue(ClaimTypes.Role) ?? "";
        var permissions = (await matrix.ForRoleAsync(role)).Order(StringComparer.Ordinal).ToList();
        return Ok(new { role, permissions });
    }
}
