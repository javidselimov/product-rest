using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

namespace Cbar.AdminApi.Errors;

/// <summary>
/// Turns database rejections into 400/409 problem details (<see cref="DbErrorMapping"/>) and
/// keeps client disconnects out of the error log. Anything else returns <c>false</c> and
/// falls through to the framework: a 500 problem details body and an Error log entry.
/// </summary>
/// <remarks>
/// Since .NET 10 the exception handler middleware does not log what a handler reports as
/// handled, so the mapped cases are logged here — as Warning, not Error: they are the
/// client's mistake or a lost race, not a server fault.
/// </remarks>
public sealed class DbExceptionHandler(IProblemDetailsService problemDetails, ILogger<DbExceptionHandler> logger)
    : IExceptionHandler
{
    /// <summary>nginx's "client closed request"; nobody reads the response.</summary>
    private const int ClientClosedRequest = 499;

    public async ValueTask<bool> TryHandleAsync(HttpContext ctx, Exception exception, CancellationToken ct)
    {
        if (ctx.RequestAborted.IsCancellationRequested && exception is OperationCanceledException or IOException)
        {
            logger.LogDebug("Client closed {Method} {Path}", ctx.Request.Method, ctx.Request.Path);
            ctx.Response.StatusCode = ClientClosedRequest;
            return true;
        }

        if (DbErrorMapping.FindPostgres(exception) is not { } pg
            || DbErrorMapping.Map(pg, ctx.Request.Method, exception as DbUpdateException) is not { } problem)
            return false;

        logger.LogWarning("Database rejected {Method} {Path}: {SqlState} {Constraint} on {Table} -> {Status}",
            ctx.Request.Method, ctx.Request.Path, pg.SqlState, pg.ConstraintName, pg.TableName, problem.Status);

        var pd = new ProblemDetails
        {
            Status = problem.Status,
            Type = problem.Type,
            Title = ReasonPhrases.GetReasonPhrase(problem.Status),
            Detail = problem.Message,
        };
        pd.Extensions["message"] = problem.Message;
        if (problem.Field is not null)
            pd.Extensions["field"] = problem.Field;
        if (problem.Locale is not null)
            pd.Extensions["locale"] = problem.Locale;
        if (problem.Errors is not null)
            pd.Extensions["errors"] = problem.Errors;

        ctx.Response.StatusCode = problem.Status;
        // No Exception on the context: nothing about it may reach the body. TryWriteAsync
        // declines when Accept rules out JSON; the message matters more than Accept here.
        if (!await problemDetails.TryWriteAsync(new ProblemDetailsContext { HttpContext = ctx, ProblemDetails = pd }))
            await ctx.Response.WriteAsJsonAsync(pd, options: null, contentType: "application/problem+json", ct);
        return true;
    }
}
