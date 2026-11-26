using System.Text.Json;
using Cbar.WebApi.Controllers;
using static Cbar.WebApi.Controllers.WorkingPapersController;

namespace Cbar.WebApi.Tests;

public class WorkingPapersTests
{
    private static WorkingPaperDetail Detail(string title = "Inflation", string? @abstract = "Text", WorkingPaperFile? file = null) =>
        new(7, 2, 2025, "en", title, ["A. Author"], ["inflation"], @abstract, ["E58"], file);

    /// <summary>Serialises the way MVC does: declared as object, so the runtime type and the web defaults apply.</summary>
    private static JsonElement Json(object value) =>
        JsonSerializer.SerializeToElement(value, JsonSerializerOptions.Web);

    private static string[] PropertyNames(JsonElement element) =>
        element.EnumerateObject().Select(p => p.Name).Order(StringComparer.Ordinal).ToArray();

    [Theory]
    [InlineData("02-2025", 2, 2025)]
    [InlineData("99-1999", 99, 1999)]
    [InlineData("00-0000", 0, 0)]
    public void A_well_formed_key_is_read(string key, short number, short year)
    {
        Assert.True(TryParseKey(key, out var n, out var y));
        Assert.Equal((number, year), (n, y));
    }

    [Theory]
    [InlineData("")]
    [InlineData("2-2025")]
    [InlineData("002-2025")]
    [InlineData("02-25")]
    [InlineData("02/2025")]
    [InlineData(" 02-2025")]
    [InlineData("02-2025 ")]
    [InlineData("02-2025\n")]
    [InlineData("ab-cdef")]
    [InlineData("٠٢-٢٠٢٥")] // Arabic-Indic digits: \d matches them, short.Parse throws.
    [InlineData("０２-２０２５")] // Fullwidth digits.
    public void A_malformed_key_is_rejected_without_throwing(string key) =>
        Assert.False(TryParseKey(key, out _, out _));

    [Fact]
    public void Code_and_key_pad_the_number() =>
        Assert.Equal(("02/2025", "02-2025"), (FormatCode(2, 2025), FormatKey(2, 2025)));

    [Fact]
    public void A_list_item_has_the_schema_fields()
    {
        var json = Json(new WorkingPaperListItem(7, 2, 2025, "en", "  Inflation  ", ["A. Author"], ["inflation"]));

        Assert.Equal(
            ["authors", "code", "id", "key", "keywords", "language", "number", "title", "year"],
            PropertyNames(json));
        Assert.Equal("Inflation", json.GetProperty("title").GetString());
        Assert.Equal("02/2025", json.GetProperty("code").GetString());
        Assert.Equal("02-2025", json.GetProperty("key").GetString());
    }

    [Fact]
    public void A_detail_has_the_list_fields_and_its_own()
    {
        var json = Json(Detail(file: new WorkingPaperFile(42, "wp.pdf", "application/pdf", 1024)));

        Assert.Equal(
            ["abstract", "authors", "code", "file", "id", "jelCodes", "key", "keywords", "language", "number", "title", "year"],
            PropertyNames(json));
        var file = json.GetProperty("file");
        Assert.Equal(["mediaId", "mimeType", "originalName", "sizeBytes", "url"], PropertyNames(file));
        Assert.Equal("/media/42", file.GetProperty("url").GetString());
    }

    [Fact]
    public void A_detail_without_a_file_sends_null() =>
        Assert.Equal(JsonValueKind.Null, Json(Detail()).GetProperty("file").ValueKind);

    [Fact]
    public void Adding_the_file_with_with_keeps_the_trimmed_values()
    {
        var detail = Detail(title: " Inflation ", @abstract: " Text ") with { File = new WorkingPaperFile(1, "a.pdf", "application/pdf", 1) };

        Assert.Equal(("Inflation", "Text"), (detail.Title, detail.Abstract));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  \n ")]
    public void A_blank_abstract_is_null(string? @abstract) =>
        Assert.Null(Detail(@abstract: @abstract).Abstract);
}
