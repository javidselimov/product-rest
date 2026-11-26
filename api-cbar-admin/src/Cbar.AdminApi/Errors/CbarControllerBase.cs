using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;

namespace Cbar.AdminApi.Errors;

/// <summary>
/// Base of every admin controller: error responses are problem details
/// (<c>application/problem+json</c>, spec 018), never hand-written anonymous objects.
/// </summary>
/// <remarks>
/// <c>message</c> repeats <c>detail</c> because the admin panel reads <c>message</c> — the
/// field the earlier <c>{ message }</c> bodies had — so the API can ship before the panel
/// changes. No new <c>code</c> values: the panel prefers <c>code</c> over its own status-based
/// classification, so a new one would change how it treats the error.
/// </remarks>
public abstract class CbarControllerBase : ControllerBase
{
    protected ObjectResult ErrorProblem(
        int status, string message, string? code = null,
        IReadOnlyDictionary<string, object?>? extensions = null)
    {
        var pd = ProblemDetailsFactory.CreateProblemDetails(HttpContext, status, detail: message);
        // The factory runs ProblemDetailsSetup before `message` is added, which drops the title
        // of a 401/403; this response carries a message, so it keeps one.
        pd.Title ??= ReasonPhrases.GetReasonPhrase(status);
        pd.Extensions["message"] = message;
        if (code is not null)
            pd.Extensions["code"] = code;
        if (extensions is not null)
            foreach (var (key, value) in extensions)
                pd.Extensions[key] = value;

        return new ObjectResult(pd) { StatusCode = status, ContentTypes = { "application/problem+json" } };
    }

    protected ObjectResult BadRequestProblem(string message) => ErrorProblem(StatusCodes.Status400BadRequest, message);

    /// <summary>
    /// A 400 naming each failing body field in <c>errors</c> (camelCase, as the panel maps it to
    /// form fields); <c>message</c> is the first failure.
    /// </summary>
    protected ObjectResult FieldValidationProblem(IReadOnlyDictionary<string, string[]> errors) =>
        ErrorProblem(StatusCodes.Status400BadRequest, errors.Values.First()[0],
            extensions: new Dictionary<string, object?> { ["errors"] = errors });

    protected ObjectResult ConflictProblem(string message) => ErrorProblem(StatusCodes.Status409Conflict, message);

    protected ObjectResult NotFoundProblem(string message) => ErrorProblem(StatusCodes.Status404NotFound, message);

    /// <summary>Id of the signed-in user from the JWT <c>sub</c> claim, or null when it is missing or not a number.</summary>
    protected int? CurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return int.TryParse(sub, out var uid) ? uid : null;
    }
}
