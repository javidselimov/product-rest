using Cbar.Domain;
using Cbar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace Cbar.WebApi.Controllers;

/// <summary>
/// FAQ "Sual-cavab" (spec 051). One response carries the whole FAQ page: the site filters by search and topic itself
/// (Postgres does not fold the Azerbaijani İ/ı pair). A second route lists the topics linked to a CMS page, which shows
/// them as link cards.
/// </summary>
[ApiController]
public class FaqController(CbarDbContext db) : ControllerBase
{
    /// <summary>Published topics with the questions filled in the locale, and the videos.</summary>
    [HttpGet("api/v1/faq")]
    public async Task<IActionResult> Get([FromQuery] string locale = "az")
    {
        locale = Normalize(locale);

        var topics = await db.FaqTopics.AsNoTracking()
            .Where(t => t.Status == ContentStatus.Published && t.Translations.Any(x => x.Locale == locale))
            .OrderBy(t => t.SortOrder).ThenBy(t => t.Id)
            .Select(t => new
            {
                t.Slug,
                Name = t.Translations.Where(x => x.Locale == locale).Select(x => x.Name).First(),
                // A question with a blank question or answer in this locale is left out rather than shown half-done.
                Questions = t.Questions
                    .Where(q => q.Status == ContentStatus.Published)
                    .OrderBy(q => q.SortOrder).ThenBy(q => q.Id)
                    .SelectMany(q => q.Translations
                        .Where(x => x.Locale == locale && x.Text.Trim() != "" && x.Answer.Trim() != "")
                        .Select(x => new { q.Id, Question = x.Text, x.Answer }))
                    .ToList(),
            })
            .AsSplitQuery()
            .ToListAsync();

        var videos = await db.FaqVideos.AsNoTracking()
            .Where(v => v.Status == ContentStatus.Published)
            .OrderBy(v => v.SortOrder).ThenBy(v => v.Id)
            .SelectMany(v => v.Translations
                .Where(x => x.Locale == locale && x.Title.Trim() != "")
                .Select(x => new { v.Id, v.YoutubeUrl, x.Title }))
            .ToListAsync();

        return Ok(new { topics = topics.Where(t => t.Questions.Count > 0), videos });
    }

    /// <summary>Topics linked to a CMS page, with the number of questions visible in the locale.</summary>
    [HttpGet("api/v1/faq/topics")]
    public async Task<IActionResult> GetForPage([FromQuery, BindRequired] int pageId, [FromQuery] string locale = "az")
    {
        if (pageId < 1)
        {
            ModelState.AddModelError(nameof(pageId), "pageId must be a positive page id.");
            return ValidationProblem();
        }
        locale = Normalize(locale);

        var rows = await db.FaqTopicPages.AsNoTracking()
            .Where(p => p.PageId == pageId
                && p.Topic.Status == ContentStatus.Published
                && p.Topic.DeletedAt == null)
            .OrderBy(p => p.SortOrder).ThenBy(p => p.TopicId)
            .Select(p => new
            {
                p.Topic.Slug,
                Name = p.Topic.Translations.Where(x => x.Locale == locale).Select(x => x.Name).FirstOrDefault(),
                QuestionCount = p.Topic.Questions.Count(q => q.Status == ContentStatus.Published
                    && q.Translations.Any(x => x.Locale == locale && x.Text.Trim() != "" && x.Answer.Trim() != "")),
            })
            .ToListAsync();

        return Ok(rows.Where(r => r.Name != null && r.QuestionCount > 0));
    }

    private static string Normalize(string? locale) => locale == "en" ? "en" : "az";
}
