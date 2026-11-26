using System.Globalization;
using System.Text;

namespace Cbar.AdminApi.Validation;

/// <summary>
/// What <c>POST /api/v1/media</c> accepts (spec 019): the extension whitelist, the content
/// signature each extension must carry, and how the client's file name is cleaned before it is
/// stored. Pure functions — existing rows are never re-checked; only new uploads go through here.
/// </summary>
public static class MediaUploadRules
{
    /// <summary>How much of the file <see cref="MatchesSignature"/> looks at. PDF allows its header anywhere in the first 1024 bytes.</summary>
    public const int SignatureWindow = 1024;

    /// <summary><c>media_assets.original_name</c> is <c>varchar(255)</c>, which counts code points, not UTF-16 units.</summary>
    public const int MaxNameLength = 255;

    // Mirrors the legacy UploadAssetsBehavior whitelist, minus executables-by-extension risk.
    public static readonly IReadOnlyDictionary<string, string> AllowedTypes =
        new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg", [".png"] = "image/png",
            [".gif"] = "image/gif", [".webp"] = "image/webp", [".svg"] = "image/svg+xml",
            [".pdf"] = "application/pdf",
            [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            [".xls"] = "application/vnd.ms-excel",
            [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            [".doc"] = "application/msword",
            [".zip"] = "application/zip",
            [".rar"] = "application/vnd.rar",
            [".xml"] = "application/xml",
        };

    public const string ImageMimePrefix = "image/";

    /// <summary>
    /// What a document field (a PDF slot) accepts: every upload type that is not an image. Shared by
    /// the FinCERT RFC-2350 field (spec 053) and the working paper PDF (spec 054).
    /// </summary>
    public static readonly IReadOnlySet<string> DocumentMimeTypes = AllowedTypes.Values
        .Where(m => !m.StartsWith(ImageMimePrefix, StringComparison.Ordinal))
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    private static ReadOnlySpan<byte> Jpeg => new byte[] { 0xFF, 0xD8, 0xFF };
    private static ReadOnlySpan<byte> Png => new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
    private static ReadOnlySpan<byte> ZipLocal => new byte[] { 0x50, 0x4B, 0x03, 0x04 };   // PK\3\4
    private static ReadOnlySpan<byte> ZipEmpty => new byte[] { 0x50, 0x4B, 0x05, 0x06 };   // PK\5\6, an archive with no entries
    private static ReadOnlySpan<byte> Ole2 => new byte[] { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };
    private static ReadOnlySpan<byte> Rar => new byte[] { 0x52, 0x61, 0x72, 0x21, 0x1A, 0x07 };   // "Rar!\x1A\x07", v4 and v5
    private static ReadOnlySpan<byte> SevenZip => new byte[] { 0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C };
    private static ReadOnlySpan<byte> Utf8Bom => new byte[] { 0xEF, 0xBB, 0xBF };

    /// <summary>
    /// True when the first bytes of the file are what <paramref name="ext"/> claims. A check of the
    /// start only — not a validation of the whole format, and .zip/.docx/.xlsx are not told apart.
    /// Two tolerances come from a dry run over the test library (spec 019, FR-005): raster images
    /// are one family (6 legacy files were a JPEG named .png or the reverse, and browsers decode
    /// them from content anyway), and .rar also takes 7-Zip (2 legacy archives).
    /// </summary>
    public static bool MatchesSignature(string ext, ReadOnlySpan<byte> head)
    {
        if (head.Length > SignatureWindow)
            head = head[..SignatureWindow];

        return ext.ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" or ".png" or ".gif" or ".webp" => IsRasterImage(head),
            ".pdf" => head.IndexOf("%PDF-"u8) >= 0,
            ".zip" => head.StartsWith(ZipLocal) || head.StartsWith(ZipEmpty),
            ".docx" or ".xlsx" => head.StartsWith(ZipLocal),
            ".doc" or ".xls" => head.StartsWith(Ole2),
            ".rar" => head.StartsWith(Rar) || head.StartsWith(SevenZip),
            ".xml" or ".svg" => LooksLikeMarkup(head),
            _ => false,
        };
    }

    private static bool IsRasterImage(ReadOnlySpan<byte> head) =>
        head.StartsWith(Jpeg)
        || head.StartsWith(Png)
        || head.StartsWith("GIF87a"u8) || head.StartsWith("GIF89a"u8)
        || (head.Length >= 12 && head.StartsWith("RIFF"u8) && head[8..12].SequenceEqual("WEBP"u8));

    /// <summary>
    /// XML and SVG are text: an optional BOM (UTF-8, or UTF-16 in either byte order), whitespace,
    /// then <c>&lt;</c>. Not a search for <c>&lt;svg</c> — comments and a DOCTYPE may come first; what
    /// stops script in an SVG is the public response's CSP, not this check.
    /// </summary>
    private static bool LooksLikeMarkup(ReadOnlySpan<byte> head)
    {
        if (head.Length >= 2 && ((head[0] == 0xFF && head[1] == 0xFE) || (head[0] == 0xFE && head[1] == 0xFF)))
        {
            var littleEndian = head[0] == 0xFF;
            for (var i = 2; i + 1 < head.Length; i += 2)
            {
                var (low, high) = littleEndian ? (head[i], head[i + 1]) : (head[i + 1], head[i]);
                if (high != 0)
                    return false;
                if (IsAsciiWhitespace(low))
                    continue;
                return low == (byte)'<';
            }
            return false;
        }

        var j = head.StartsWith(Utf8Bom) ? Utf8Bom.Length : 0;
        while (j < head.Length && IsAsciiWhitespace(head[j]))
            j++;
        return j < head.Length && head[j] == (byte)'<';
    }

    private static bool IsAsciiWhitespace(byte b) => b is (byte)' ' or (byte)'\t' or (byte)'\n' or (byte)'\r';

    /// <summary>
    /// The client's file name as it may be stored and shown: last path segment only, no control or
    /// bidi-control characters, NFC, trimmed, at most <see cref="MaxNameLength"/> code points with
    /// the extension kept, and <c>file</c> + extension when nothing is left. Ordinary names —
    /// Azerbaijani letters, spaces, brackets, dashes — come out unchanged.
    /// </summary>
    public static string SanitizeFileName(string? raw)
    {
        var name = raw ?? string.Empty;

        // Both separators: on Linux Path.GetFileName treats only '/' as one, and browsers on
        // Windows (or a hand-made request) may send "C:\Users\x\report.pdf".
        var lastSeparator = name.LastIndexOfAny(['/', '\\']);
        if (lastSeparator >= 0)
            name = name[(lastSeparator + 1)..];

        // By rune, so a valid surrogate pair (emoji) survives while a lone surrogate — which would
        // make Normalize throw — arrives as U+FFFD and is dropped. Bidi controls are format (Cf),
        // not control (Cc), characters; they let "report\u202Efdp.exe" display as "reportexe.pdf".
        var kept = new StringBuilder(name.Length);
        foreach (var rune in name.EnumerateRunes())
        {
            if (rune == Rune.ReplacementChar
                || Rune.GetUnicodeCategory(rune) == UnicodeCategory.Control
                || IsBidiControl(rune.Value))
                continue;
            kept.Append(rune.ToString());
        }

        // NFC: macOS sends decomposed names (ş, ö, ç as letter + combining mark), which look the
        // same but miss the media library's ILIKE search.
        name = kept.ToString().Normalize(NormalizationForm.FormC).Trim();

        var ext = Path.GetExtension(name);
        var stem = name[..^ext.Length];

        var extLength = ext.EnumerateRunes().Count();
        var room = MaxNameLength - extLength;
        if (room <= 0)
            // An extension this long is never on the whitelist; just keep the name storable.
            return TakeRunes(name, MaxNameLength);
        if (stem.EnumerateRunes().Count() > room)
            stem = TakeRunes(stem, room);

        return (stem.Length == 0 ? "file" : stem) + ext;
    }

    private static bool IsBidiControl(int codePoint) =>
        codePoint is 0x200E or 0x200F or (>= 0x202A and <= 0x202E) or (>= 0x2066 and <= 0x2069);

    private static string TakeRunes(string value, int count)
    {
        var result = new StringBuilder();
        foreach (var rune in value.EnumerateRunes())
        {
            if (count-- == 0)
                break;
            result.Append(rune.ToString());
        }
        return result.ToString();
    }
}
