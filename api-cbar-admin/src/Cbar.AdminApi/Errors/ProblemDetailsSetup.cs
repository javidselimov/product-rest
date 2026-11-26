namespace Cbar.AdminApi.Errors;

/// <summary>
/// One customisation point for every problem details body the API writes — controller
/// helpers (<see cref="CbarControllerBase"/>), MVC's client-error mapping and validation 400s,
/// status code pages and the exception handler (spec 018).
/// </summary>
public static class ProblemDetailsSetup
{
    public static void Customize(ProblemDetailsOptions options) =>
        options.CustomizeProblemDetails = ctx =>
        {
            var pd = ctx.ProblemDetails;
            var status = pd.Status ?? ctx.HttpContext.Response.StatusCode;

            // Transitional, until the admin panel picks its own text by status: the panel shows
            // `message`, else `title`, else its localised fallback. 401/403/5xx used to have no
            // body, so a default English title here would replace that fallback. A response
            // that does carry `message` keeps its title. Drop this once the panel is adapted.
            if (status is (401 or 403 or >= 500) && !pd.Extensions.ContainsKey("message"))
                pd.Title = null;

            if (status >= 500 && string.IsNullOrEmpty(pd.Detail))
                pd.Detail = "An unexpected error occurred.";
        };

    /// <summary>
    /// Kestrel's own request failures (body too large, malformed request) keep their status
    /// instead of becoming 500.
    /// </summary>
    public static int SelectStatusCode(Exception exception) =>
        exception is BadHttpRequestException bad ? bad.StatusCode : StatusCodes.Status500InternalServerError;
}
