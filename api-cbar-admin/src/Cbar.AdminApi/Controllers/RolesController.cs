using Cbar.AdminApi.Authorization;
using Cbar.AdminApi.Errors;
using Microsoft.AspNetCore.Mvc;

namespace Cbar.AdminApi.Controllers;

/// <summary>
/// The role → permission matrix, read-only (spec 008 FR-007, FR-008): it changes only through a
/// migration.
/// </summary>
[ApiController]
[RequirePermission(Permissions.Roles.Read)]
[Route("api/v1/roles")]
public class RolesController(PermissionMatrix matrix) : CbarControllerBase
{
    [HttpGet]
    public async Task<IActionResult> List() => Ok(await matrix.RolesAsync());
}
