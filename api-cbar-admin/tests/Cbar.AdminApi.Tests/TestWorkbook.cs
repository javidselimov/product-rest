using System.Globalization;
using System.IO.Compression;
using System.Security;
using System.Text;

namespace Cbar.AdminApi.Tests;

/// <summary>
/// Builds a minimal one-sheet .xlsx in memory, so each reader rule can be tested with exactly the
/// cells it is about. A <see cref="string"/> becomes a shared string, a number a numeric cell.
/// </summary>
internal static class TestWorkbook
{
    private const string MainNs = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";

    /// <param name="cells">Cell reference ("B5") → value.</param>
    public static MemoryStream Build(IReadOnlyDictionary<string, object> cells)
    {
        var strings = new List<string>();
        var rows = cells
            .Select(c => (Ref: c.Key, Row: RowOf(c.Key), Column: ColumnOf(c.Key), c.Value))
            .GroupBy(c => c.Row)
            .OrderBy(g => g.Key);

        var sheet = new StringBuilder($"<?xml version=\"1.0\" encoding=\"UTF-8\"?><worksheet xmlns=\"{MainNs}\"><sheetData>");
        foreach (var row in rows)
        {
            sheet.Append(CultureInfo.InvariantCulture, $"<row r=\"{row.Key}\">");
            foreach (var cell in row.OrderBy(c => c.Column))
            {
                if (cell.Value is string text)
                {
                    strings.Add(text);
                    sheet.Append(CultureInfo.InvariantCulture, $"<c r=\"{cell.Ref}\" t=\"s\"><v>{strings.Count - 1}</v></c>");
                }
                else
                {
                    var number = Convert.ToString(cell.Value, CultureInfo.InvariantCulture);
                    sheet.Append(CultureInfo.InvariantCulture, $"<c r=\"{cell.Ref}\"><v>{number}</v></c>");
                }
            }
            sheet.Append("</row>");
        }
        sheet.Append("</sheetData></worksheet>");

        var shared = new StringBuilder($"<?xml version=\"1.0\" encoding=\"UTF-8\"?><sst xmlns=\"{MainNs}\">");
        foreach (var s in strings)
            shared.Append("<si><t xml:space=\"preserve\">").Append(SecurityElement.Escape(s)).Append("</t></si>");
        shared.Append("</sst>");

        var stream = new MemoryStream();
        using (var zip = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
        {
            Add(zip, "[Content_Types].xml",
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Types xmlns=\"http://schemas.openxmlformats.org/package/2006/content-types\">"
                + "<Default Extension=\"rels\" ContentType=\"application/vnd.openxmlformats-package.relationships+xml\"/>"
                + "<Default Extension=\"xml\" ContentType=\"application/xml\"/>"
                + "<Override PartName=\"/xl/workbook.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml\"/>"
                + "<Override PartName=\"/xl/worksheets/sheet1.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml\"/>"
                + "<Override PartName=\"/xl/sharedStrings.xml\" ContentType=\"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml\"/>"
                + "</Types>");
            Add(zip, "_rels/.rels",
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument\" Target=\"xl/workbook.xml\"/>"
                + "</Relationships>");
            Add(zip, "xl/workbook.xml",
                $"<?xml version=\"1.0\" encoding=\"UTF-8\"?><workbook xmlns=\"{MainNs}\" xmlns:r=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships\">"
                + "<sheets><sheet name=\"Website\" sheetId=\"1\" r:id=\"rId1\"/></sheets></workbook>");
            Add(zip, "xl/_rels/workbook.xml.rels",
                "<?xml version=\"1.0\" encoding=\"UTF-8\"?><Relationships xmlns=\"http://schemas.openxmlformats.org/package/2006/relationships\">"
                + "<Relationship Id=\"rId1\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet\" Target=\"worksheets/sheet1.xml\"/>"
                + "<Relationship Id=\"rId2\" Type=\"http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings\" Target=\"sharedStrings.xml\"/>"
                + "</Relationships>");
            Add(zip, "xl/sharedStrings.xml", shared.ToString());
            Add(zip, "xl/worksheets/sheet1.xml", sheet.ToString());
        }

        stream.Position = 0;
        return stream;
    }

    private static void Add(ZipArchive zip, string path, string content)
    {
        using var writer = new StreamWriter(zip.CreateEntry(path).Open(), new UTF8Encoding(false));
        writer.Write(content);
    }

    private static int RowOf(string reference) =>
        int.Parse(new string(reference.SkipWhile(char.IsLetter).ToArray()), CultureInfo.InvariantCulture);

    private static int ColumnOf(string reference) =>
        reference.TakeWhile(char.IsLetter).Aggregate(0, (index, ch) => index * 26 + (ch - 'A' + 1));
}
