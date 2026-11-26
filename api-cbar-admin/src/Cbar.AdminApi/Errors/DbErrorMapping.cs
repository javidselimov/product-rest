using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Cbar.AdminApi.Errors;

/// <summary>What a database rejection becomes on the wire (spec 018, contracts/error-response.md).</summary>
public sealed record DbProblem(
    int Status,
    string Type,
    string Message,
    string? Field = null,
    string? Locale = null,
    IReadOnlyDictionary<string, string[]>? Errors = null);

/// <summary>
/// Maps a PostgreSQL rejection of a write to a client error. The controllers check most of
/// these up front; this covers what slips past them — two requests racing between the check
/// and the insert, and inputs nothing validates yet (unknown locale, over-long value; #8b).
/// Nothing from the database (constraint, table, message text) reaches the response.
/// </summary>
public static class DbErrorMapping
{
    private const string UniqueViolation = "urn:cbar:problem:unique-violation";
    private const string ReferenceMissing = "urn:cbar:problem:reference-missing";
    private const string ReferenceInUse = "urn:cbar:problem:reference-in-use";

    private const string UserTaken = "Username or email is already in use.";

    /// <summary>EF wraps it in <see cref="DbUpdateException"/>; ExecuteUpdate/Delete and raw SQL throw it bare.</summary>
    public static PostgresException? FindPostgres(Exception exception)
    {
        for (var e = exception; e is not null; e = e.InnerException)
            if (e is PostgresException pg)
                return pg;
        return null;
    }

    /// <returns><c>null</c> for anything that is not the client's fault — it stays a 500.</returns>
    public static DbProblem? Map(PostgresException pg, string httpMethod, DbUpdateException? update) =>
        pg.SqlState switch
        {
            PostgresErrorCodes.UniqueViolation => MapUnique(pg, httpMethod, update),
            PostgresErrorCodes.ForeignKeyViolation => HttpMethods.IsDelete(httpMethod)
                ? new DbProblem(409, ReferenceInUse, "The item is still referenced by other content.")
                : pg.ConstraintName?.EndsWith("_locale_fkey", StringComparison.Ordinal) == true
                    ? new DbProblem(400, ReferenceMissing, "Unknown locale.")
                    : new DbProblem(400, ReferenceMissing, "A referenced item does not exist."),
            // PostgreSQL names no column for these, so neither can the response.
            PostgresErrorCodes.StringDataRightTruncation =>
                new DbProblem(400, "urn:cbar:problem:value-too-long", "A value is longer than allowed."),
            PostgresErrorCodes.NumericValueOutOfRange =>
                new DbProblem(400, "urn:cbar:problem:value-out-of-range", "A number is out of the allowed range."),
            PostgresErrorCodes.NotNullViolation =>
                new DbProblem(400, "urn:cbar:problem:value-required", "A required value is missing."),
            PostgresErrorCodes.CheckViolation =>
                new DbProblem(400, "urn:cbar:problem:value-rejected", "A value is not allowed."),
            _ => null,
        };

    private static DbProblem MapUnique(PostgresException pg, string httpMethod, DbUpdateException? update)
    {
        var constraint = pg.ConstraintName ?? "";

        // Every slugged translation table has UNIQUE (locale, slug). UniqueSlug picks a free
        // slug before the insert, so this is a concurrent save; saving again picks another.
        if (constraint.EndsWith("_locale_slug_key", StringComparison.Ordinal))
            return new DbProblem(409, UniqueViolation,
                "Another item in this language already uses the same slug. Save again to get a new one.",
                Field: "slug", Locale: SingleLocale(pg.TableName, update));

        // Same texts as UsersController's own checks, which a concurrent create slipped past.
        if (constraint == "users_username_key")
            return new DbProblem(409, UniqueViolation, UserTaken,
                Errors: new Dictionary<string, string[]> { ["Username"] = [UserTaken] });
        if (constraint == "users_email_key")
        {
            var message = HttpMethods.IsPut(httpMethod) ? "Email is already in use." : UserTaken;
            return new DbProblem(409, UniqueViolation, message,
                Errors: new Dictionary<string, string[]> { ["Email"] = [message] });
        }

        return new DbProblem(409, UniqueViolation, "A record with the same unique value already exists.");
    }

    /// <summary>
    /// The locale of the colliding row, if the failed batch holds rows of that table in one
    /// locale only. With several locales the culprit is unknown, so none is named.
    /// </summary>
    private static string? SingleLocale(string? table, DbUpdateException? update)
    {
        if (table is null || update is null)
            return null;

        var locales = update.Entries
            .Where(e => e.Metadata.GetTableName() == table && e.Metadata.FindProperty("Locale") is not null)
            .Select(e => e.Property("Locale").CurrentValue as string)
            .Distinct()
            .ToList();
        return locales is [{ } only] ? only : null;
    }
}
