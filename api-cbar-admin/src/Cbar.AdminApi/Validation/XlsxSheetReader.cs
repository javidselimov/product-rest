using System.Globalization;
using System.IO.Compression;
using System.Text;
using System.Xml;

namespace Cbar.AdminApi.Validation;

/// <summary>A workbook the reader refuses; <see cref="Code"/> is the problem's <c>code</c>.</summary>
public sealed class XlsxReadException(string code, string message) : Exception(message)
{
    public string Code { get; } = code;
}

/// <summary>
/// A cell's stored value — for a formula, its cached result — as the legacy importers read it
/// (PhpSpreadsheet with formatting off). <paramref name="IsNumeric"/> is false when the cell is
/// text, a boolean or an error.
/// </summary>
public sealed record XlsxCell(string? Value, bool IsNumeric);

/// <summary>One sheet row: its 1-based number and the requested columns it has (A = 1).</summary>
public sealed record XlsxRow(int Row, IReadOnlyDictionary<int, XlsxCell> Cells)
{
    public XlsxCell? this[int column] => Cells.GetValueOrDefault(column);
}

/// <summary>
/// Reads cells of an .xlsx workbook's active sheet — the one that opens first. Plain BCL zip +
/// XML rather than a spreadsheet package: the importers need a few columns, and the size and XML
/// limits stay in our hands. Pure functions, nothing is stored. Used by
/// <see cref="RateBulletinReader"/> (spec 025) and the yield curve imports.
/// </summary>
public static class XlsxSheetReader
{
    /// <summary>Per part, decompressed. The sample workbooks' largest part is ~100 KB; this only stops a zip bomb.</summary>
    public const long MaxPartBytes = 20 * 1024 * 1024;

    public const string NotXlsx = "not_xlsx";
    public const string FileTooLarge = "file_too_large";

    private const string MainNs = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    private const string RelNs = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    private const string PackageRelNs = "http://schemas.openxmlformats.org/package/2006/relationships";

    // No DTDs, no external resolution: an .xlsx never needs either, and both are how XML attacks start.
    private static readonly XmlReaderSettings XmlSettings = new()
    {
        DtdProcessing = DtdProcessing.Prohibit,
        XmlResolver = null,
        IgnoreComments = true,
        IgnoreProcessingInstructions = true,
    };

    /// <summary>
    /// Rows <paramref name="firstRow"/>–<paramref name="lastRow"/> of the active sheet in sheet
    /// order, each with the cells it has among <paramref name="columns"/>. Rows with none of them
    /// are left out. Throws <see cref="XlsxReadException"/>.
    /// </summary>
    public static IReadOnlyList<XlsxRow> Read(Stream xlsx, int firstRow, int lastRow, IReadOnlySet<int> columns)
    {
        try
        {
            using var zip = new ZipArchive(xlsx, ZipArchiveMode.Read, leaveOpen: true);
            var sheetPath = ActiveSheetPath(zip);
            var sharedStrings = ReadSharedStrings(zip);
            return ReadRows(zip, sheetPath, sharedStrings, firstRow, lastRow, columns);
        }
        catch (Exception e) when (e is InvalidDataException or XmlException or FormatException or OverflowException)
        {
            throw new XlsxReadException(NotXlsx, "The file is not a readable .xlsx workbook.");
        }
    }

    /// <summary>
    /// A number as the legacy importers stored it: PHP <c>round($value, $decimals)</c>, which first
    /// rounds to 15 significant digits and then rounds half away from zero. So
    /// <c>0.56379999999999997 → 0.5638</c> and <c>0.12344999999999999 → 0.1235</c> at 4 decimals
    /// (a plain round would give 0.1234). Parsed as <see cref="decimal"/> from the file's text,
    /// never through <see cref="double"/>. Null when the text is not a number.
    /// </summary>
    public static decimal? NormalizeNumber(string? raw, int decimals)
    {
        if (!decimal.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var value))
            return null;
        if (value == 0)
            return 0;

        var integerDigits = (int)Math.Floor(Math.Log10((double)Math.Abs(value))) + 1;
        var significant = 15 - integerDigits;
        if (significant is >= 0 and <= 28)
            value = Math.Round(value, significant, MidpointRounding.AwayFromZero);

        return Math.Round(value, decimals, MidpointRounding.AwayFromZero);
    }

    /// <summary>1 → "A", 27 → "AA".</summary>
    public static string ColumnName(int column)
    {
        var name = string.Empty;
        for (; column > 0; column = (column - 1) / 26)
            name = (char)('A' + (column - 1) % 26) + name;
        return name;
    }

    /// <summary>
    /// The part of the sheet that opens first: <c>workbookView/@activeTab</c> (0 when absent) picks a
    /// <c>sheet</c>, whose relationship names the part.
    /// </summary>
    private static string ActiveSheetPath(ZipArchive zip)
    {
        var activeTab = 0;
        var sheetRelIds = new List<string>();
        using (var reader = OpenXml(zip, "xl/workbook.xml"))
        {
            while (reader.Read())
            {
                if (reader.NodeType != XmlNodeType.Element || reader.NamespaceURI != MainNs)
                    continue;
                if (reader.LocalName == "workbookView"
                    && int.TryParse(reader.GetAttribute("activeTab"), CultureInfo.InvariantCulture, out var tab))
                    activeTab = tab;
                else if (reader.LocalName == "sheet" && reader.GetAttribute("id", RelNs) is { } relId)
                    sheetRelIds.Add(relId);
            }
        }

        if (activeTab < 0 || activeTab >= sheetRelIds.Count)
            throw new XlsxReadException(NotXlsx, "The workbook has no active sheet.");

        string? target = null;
        using (var reader = OpenXml(zip, "xl/_rels/workbook.xml.rels"))
        {
            while (reader.Read())
            {
                if (reader.NodeType == XmlNodeType.Element && reader.LocalName == "Relationship"
                    && reader.NamespaceURI == PackageRelNs && reader.GetAttribute("Id") == sheetRelIds[activeTab])
                {
                    target = reader.GetAttribute("Target");
                    break;
                }
            }
        }

        if (string.IsNullOrEmpty(target))
            throw new XlsxReadException(NotXlsx, "The workbook has no active sheet.");

        // Relative to xl/ ("worksheets/sheet1.xml"), or absolute in the package ("/xl/worksheets/sheet1.xml").
        return target.StartsWith('/') ? target[1..] : "xl/" + target;
    }

    /// <summary>The shared string table; a rich-text item is its runs joined, phonetic hints (<c>rPh</c>) left out.</summary>
    private static List<string> ReadSharedStrings(ZipArchive zip)
    {
        var strings = new List<string>();
        if (zip.GetEntry("xl/sharedStrings.xml") is null)
            return strings;

        using var reader = OpenXml(zip, "xl/sharedStrings.xml");
        while (reader.Read())
        {
            if (reader.NodeType == XmlNodeType.Element && reader.LocalName == "si" && reader.NamespaceURI == MainNs)
                strings.Add(ReadText(reader));
        }
        return strings;
    }

    private static List<XlsxRow> ReadRows(ZipArchive zip, string sheetPath, List<string> sharedStrings,
        int firstRow, int lastRow, IReadOnlySet<int> columns)
    {
        var rows = new List<XlsxRow>();
        using var reader = OpenXml(zip, sheetPath);

        var rowNumber = 0;
        while (reader.Read())
        {
            if (reader.NodeType != XmlNodeType.Element || reader.LocalName != "row" || reader.NamespaceURI != MainNs)
                continue;

            // `r` may be left out, and then the row follows the previous one.
            rowNumber = int.TryParse(reader.GetAttribute("r"), CultureInfo.InvariantCulture, out var r) ? r : rowNumber + 1;
            if (rowNumber > lastRow)
                break;
            if (rowNumber < firstRow || reader.IsEmptyElement)
                continue;

            var cells = ReadRow(reader, sharedStrings, columns);
            if (cells.Count > 0)
                rows.Add(new XlsxRow(rowNumber, cells));
        }
        return rows;
    }

    /// <summary>The requested cells of the row the reader is on; leaves the reader on its end tag.</summary>
    private static Dictionary<int, XlsxCell> ReadRow(XmlReader reader, List<string> sharedStrings, IReadOnlySet<int> columns)
    {
        var cells = new Dictionary<int, XlsxCell>();
        var column = 0;

        using var row = reader.ReadSubtree();
        row.Read();
        row.Read();
        // Skip() already moves to the next node, so the loop advances only when nothing else did.
        while (!row.EOF)
        {
            if (row.NodeType == XmlNodeType.Element && row.LocalName == "c" && row.NamespaceURI == MainNs)
            {
                // `r` ("G7") may be left out too; then the cell follows the previous one.
                var reference = row.GetAttribute("r");
                column = reference is null ? column + 1 : ColumnIndex(reference);
                if (!columns.Contains(column))
                {
                    row.Skip();
                    continue;
                }

                cells[column] = ReadCell(row, sharedStrings);
            }
            row.Read();
        }
        return cells;
    }

    /// <summary>A cell's stored value. Only an untyped or <c>n</c> cell is a number.</summary>
    private static XlsxCell ReadCell(XmlReader reader, List<string> sharedStrings)
    {
        var type = reader.GetAttribute("t") ?? "n";
        string? value = null;
        string? inline = null;

        if (!reader.IsEmptyElement)
        {
            using var cell = reader.ReadSubtree();
            cell.Read();
            cell.Read();
            while (!cell.EOF)
            {
                if (cell.NodeType == XmlNodeType.Element && cell.NamespaceURI == MainNs && cell.LocalName == "v")
                {
                    // Leaves the reader on the node after </v>.
                    value = cell.ReadElementContentAsString();
                    continue;
                }
                if (cell.NodeType == XmlNodeType.Element && cell.NamespaceURI == MainNs && cell.LocalName == "is")
                    inline = ReadText(cell);
                cell.Read();
            }
        }

        return type switch
        {
            "s" => new XlsxCell(
                int.TryParse(value, CultureInfo.InvariantCulture, out var i) && i >= 0 && i < sharedStrings.Count
                    ? sharedStrings[i] : null,
                false),
            "inlineStr" => new XlsxCell(inline, false),
            "n" => new XlsxCell(value, value is not null),
            _ => new XlsxCell(value, false), // str, b, e
        };
    }

    /// <summary>The text of an <c>si</c> or <c>is</c> element the reader is on: every <c>t</c>, phonetic runs skipped.</summary>
    private static string ReadText(XmlReader reader)
    {
        if (reader.IsEmptyElement)
            return string.Empty;

        var text = new StringBuilder();
        using var item = reader.ReadSubtree();
        item.Read();
        while (!item.EOF)
        {
            if (item.NodeType == XmlNodeType.Element && item.NamespaceURI == MainNs)
            {
                if (item.LocalName == "rPh")
                {
                    item.Skip();
                    continue;
                }
                if (item.LocalName == "t")
                {
                    text.Append(item.ReadElementContentAsString());
                    continue;
                }
            }
            item.Read();
        }
        return text.ToString();
    }

    /// <summary>"G7" → 7 (A = 1).</summary>
    private static int ColumnIndex(string reference)
    {
        var index = 0;
        foreach (var ch in reference)
        {
            if (ch is < 'A' or > 'Z')
                break;
            index = index * 26 + (ch - 'A' + 1);
        }
        return index;
    }

    private static XmlReader OpenXml(ZipArchive zip, string path)
    {
        var entry = zip.GetEntry(path)
                    ?? throw new XlsxReadException(NotXlsx, "The file is not a readable .xlsx workbook.");
        if (entry.Length > MaxPartBytes)
            throw TooLarge();

        // The declared size can lie; the bound counts what is actually inflated.
        return XmlReader.Create(new BoundedReadStream(entry.Open(), MaxPartBytes), XmlSettings);
    }

    private static XlsxReadException TooLarge() =>
        new(FileTooLarge, $"A part of the workbook exceeds {MaxPartBytes / (1024 * 1024)} MB when decompressed.");

    /// <summary>A read-only stream that throws once more than <c>limit</c> bytes have come through.</summary>
    private sealed class BoundedReadStream(Stream inner, long limit) : Stream
    {
        private long _read;

        public override int Read(byte[] buffer, int offset, int count) => Count(inner.Read(buffer, offset, count));

        public override int Read(Span<byte> buffer) => Count(inner.Read(buffer));

        private int Count(int n)
        {
            _read += n;
            if (_read > limit)
                throw TooLarge();
            return n;
        }

        public override bool CanRead => true;
        public override bool CanSeek => false;
        public override bool CanWrite => false;
        public override long Length => throw new NotSupportedException();
        public override long Position { get => _read; set => throw new NotSupportedException(); }
        public override void Flush() { }
        public override long Seek(long offset, SeekOrigin origin) => throw new NotSupportedException();
        public override void SetLength(long value) => throw new NotSupportedException();
        public override void Write(byte[] buffer, int offset, int count) => throw new NotSupportedException();

        protected override void Dispose(bool disposing)
        {
            if (disposing)
                inner.Dispose();
            base.Dispose(disposing);
        }
    }
}
