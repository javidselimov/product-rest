using Cbar.AdminApi.Controllers;
using Cbar.AdminApi.Services;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Validation;

/// <summary>
/// Field rules of a homepage strategy document (spec 057), free of the database so they can be tested on their own. The
/// controller loads what the rules need: whether the linked page exists and the mime types of the referenced covers.
/// Errors are keyed like the panel's form (<c>translations.en.url</c>); messages are Azerbaijani because the panel shows
/// them as they are.
/// </summary>
public static class StrategyDocRules
{
    public const int MaxTitleLength = 300;
    public const int MaxSummaryLength = 500;
    public const int MaxUrlLength = 1000;

    /// <summary>The cover ids of every known locale, titled or not, so each one the request carries is checked.</summary>
    public static IReadOnlyCollection<long> MediaIds(HomepageStrategyDocUpsertDto dto) =>
        (dto.Translations ?? [])
            .Where(kv => ContentSupport.Locales.Contains(kv.Key))
            .Select(kv => kv.Value.CoverMediaId)
            .OfType<long>()
            .Distinct()
            .ToList();

    /// <param name="pageExists">Whether <c>dto.PageId</c> names a page that is not deleted; ignored without a page.</param>
    /// <param name="mediaMimeTypes">
    /// Mime type by id of the media in <see cref="MediaIds"/> that exist and are not deleted; a missing id is unknown.
    /// </param>
    public static Dictionary<string, string[]> Validate(
        HomepageStrategyDocUpsertDto dto, bool pageExists, IReadOnlyDictionary<long, string> mediaMimeTypes)
    {
        var errors = new Dictionary<string, string[]>();
        void Fail(string field, string message) => errors.TryAdd(field, [message]);

        if (dto.Status is not (ContentStatus.Published or ContentStatus.Draft))
            Fail("status", "Sənəd yalnız «Dərc olunub» və ya «Qaralama» ola bilər.");

        var titled = 0;
        var titledUrl = false;
        foreach (var (locale, tr) in dto.Translations ?? [])
        {
            if (!ContentSupport.Locales.Contains(locale))
            {
                Fail("translations", "Yalnız az və en dilləri qəbul olunur.");
                continue;
            }
            var path = $"translations.{locale}";

            var title = tr.Title?.Trim();
            if (title?.Length > MaxTitleLength)
                Fail($"{path}.title", $"Başlıq ən çox {MaxTitleLength} simvol ola bilər.");
            if (tr.Summary?.Trim().Length > MaxSummaryLength)
                Fail($"{path}.summary", $"Qısa mətn ən çox {MaxSummaryLength} simvol ola bilər.");

            var url = tr.Url?.Trim();
            if (!string.IsNullOrEmpty(url))
            {
                if (url.Length > MaxUrlLength)
                    Fail($"{path}.url", $"Ünvan ən çox {MaxUrlLength} simvol ola bilər.");
                else if (!ContentSupport.IsAllowedLink(url))
                    Fail($"{path}.url", "Ünvan http://, https:// və ya / ilə başlamalıdır.");
            }

            if (tr.CoverMediaId is { } coverId
                && (!mediaMimeTypes.TryGetValue(coverId, out var mime)
                    || !mime.StartsWith(MediaUploadRules.ImageMimePrefix, StringComparison.Ordinal)))
                Fail($"{path}.coverMediaId", "Üz qabığı üçün şəkil faylı seçin.");

            if (string.IsNullOrEmpty(title))
                continue;
            titled++;
            // Only a titled locale is stored, so only its url can be the card's link.
            titledUrl |= !string.IsNullOrEmpty(url);
        }

        if (titled == 0)
            Fail("translations.az.title", "Sənədin ən azı bir dildə başlığı olmalıdır.");
        if (dto.PageId is null && !titledUrl)
            Fail("pageId", "Keçid üçün səhifə seçin və ya ünvan yazın.");
        else if (dto.PageId is not null && !pageExists)
            Fail("pageId", "Seçilmiş səhifə tapılmadı.");
        return errors;
    }
}
