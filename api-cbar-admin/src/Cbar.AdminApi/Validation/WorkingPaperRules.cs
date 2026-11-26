using System.Text.RegularExpressions;
using Cbar.AdminApi.Controllers;
using Cbar.AdminApi.Services;
using Cbar.Domain.Entities;

namespace Cbar.AdminApi.Validation;

/// <summary>
/// Field rules of a working paper (spec 054), free of the database so they can be tested on their own. The controller
/// loads what the rules need (the mime types of the referenced media) and adds the uniqueness checks, which need the
/// table. Errors are keyed like the panel's form (<c>translations.en.authors</c>); messages are Azerbaijani because the
/// panel shows them as they are.
/// </summary>
public static partial class WorkingPaperRules
{
    public const short MinNumber = 1;
    public const short MaxNumber = 99;
    public const short MinYear = 1990;
    public const int MaxTitleLength = 500;
    private static readonly string[] PaperLanguages = ["az", "en", "other"];

    /// <summary>
    /// The media ids of every locale the request may store, titled or not: <c>Apply</c> keeps a file on an untitled
    /// translation too, so each of them must be checked.
    /// </summary>
    public static IReadOnlyCollection<long> MediaIds(WorkingPaperUpsertDto dto) =>
        (dto.Translations ?? [])
            .Where(kv => ContentSupport.Locales.Contains(kv.Key))
            .Select(kv => kv.Value.MediaId)
            .OfType<long>()
            .Distinct()
            .ToList();

    /// <param name="currentYear">The UTC year now; a paper may be entered up to a year ahead.</param>
    /// <param name="mediaMimeTypes">
    /// Mime type by id of the media in <see cref="MediaIds"/> that exist and are not deleted; a missing id is unknown.
    /// </param>
    public static Dictionary<string, string[]> Validate(
        WorkingPaperUpsertDto dto, int currentYear, IReadOnlyDictionary<long, string> mediaMimeTypes)
    {
        var errors = new Dictionary<string, string[]>();
        void Fail(string field, string message) => errors.TryAdd(field, [message]);

        if (dto.Number is < MinNumber or > MaxNumber)
            Fail("number", $"Nömrə {MinNumber} ilə {MaxNumber} arasında olmalıdır.");
        var maxYear = currentYear + 1;
        if (dto.Year < MinYear || dto.Year > maxYear)
            Fail("year", $"İl {MinYear} ilə {maxYear} arasında olmalıdır.");
        if (!PaperLanguages.Contains(dto.PaperLanguage))
            Fail("paperLanguage", "Məqalənin dilini seçin.");
        if (dto.Status == ContentStatus.Scheduled)
            Fail("status", "Məqalə planlaşdırıla bilməz.");
        if (Normalize(dto.JelCodes, upper: true).FirstOrDefault(code => !JelCode().IsMatch(code)) is { } badCode)
            Fail("jelCodes", $"\"{badCode}\" JEL kodu deyil: hərf və 1–2 rəqəm olmalıdır (məs. E58).");
        if (dto.LegacyPageId is <= 0)
            Fail("legacyPageId", "Köhnə səhifə nömrəsi müsbət olmalıdır.");

        var titled = 0;
        foreach (var (locale, tr) in dto.Translations ?? [])
        {
            var path = $"translations.{locale}";
            if (!ContentSupport.Locales.Contains(locale))
            {
                Fail("translations", "Yalnız az və en dilləri qəbul olunur.");
                continue;
            }
            // Before the blank-title skip: an untitled translation still stores its file.
            if (tr.MediaId is { } mediaId
                && (!mediaMimeTypes.TryGetValue(mediaId, out var mime) || !MediaUploadRules.DocumentMimeTypes.Contains(mime)))
                Fail($"{path}.mediaId", "Sənəd faylı seçin (PDF, Word, Excel, ZIP).");

            var title = tr.Title?.Trim();
            if (string.IsNullOrEmpty(title))
                continue;
            titled++;
            if (title.Length > MaxTitleLength)
                Fail($"{path}.title", $"Başlıq ən çox {MaxTitleLength} simvol ola bilər.");
            if (Normalize(tr.Authors).Count == 0)
                Fail($"{path}.authors", "Başlığı olan dildə ən azı bir müəllif yazın.");
        }
        if (titled == 0)
            Fail("translations", "Ən azı bir dildə başlıq yazın.");
        return errors;
    }

    /// <summary>Trimmed, without blank items and without repeats (case-insensitive), in the given order.</summary>
    public static List<string> Normalize(List<string>? items, bool upper = false) =>
        (items ?? [])
            .Select(item => item?.Trim() ?? "")
            .Where(item => item.Length > 0)
            .Select(item => upper ? item.ToUpperInvariant() : item)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

    [GeneratedRegex(@"^[A-Z][0-9]{1,2}$")]
    private static partial Regex JelCode();
}
