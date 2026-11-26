namespace Cbar.AdminApi.Validation;

/// <summary>
/// <c>?page=&amp;pageSize=</c> of every paged list, bound with <c>[FromQuery]</c>. Nothing is
/// rejected: out-of-range values are clamped by <see cref="Resolve"/>, so a stale panel URL or
/// <c>page=0</c> still answers 200 (spec 016). The limits match api-cbar's
/// <c>Math.Clamp(page, 1, 100_000)</c> / <c>Math.Clamp(pageSize, 1, 100)</c>, except that a
/// page size below 1 means "not given" and falls back to the endpoint's default rather than 1.
/// Settable properties rather than a positional record, so an absent parameter simply stays null.
/// </summary>
public sealed record PagingQuery
{
    public const int MaxPage = 100_000;
    public const int MaxPageSize = 100;

    public int? Page { get; init; }
    public int? PageSize { get; init; }

    /// <param name="defaultPageSize">The endpoint's own default (20, 24 or 50); also capped at <see cref="MaxPageSize"/>.</param>
    public PageWindow Resolve(int defaultPageSize)
    {
        var page = Page is null or < 1 ? 1 : Math.Min(Page.Value, MaxPage);
        var size = PageSize is null or < 1 ? defaultPageSize : PageSize.Value;
        return new PageWindow(page, Math.Min(size, MaxPageSize));
    }
}

/// <summary>The page actually served; lists echo <see cref="Page"/> and <see cref="PageSize"/> back.</summary>
public readonly record struct PageWindow(int Page, int PageSize)
{
    /// <summary>At most 99_999 × 100, so the offset never overflows.</summary>
    public int Skip => (Page - 1) * PageSize;
}
