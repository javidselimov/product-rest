namespace Cbar.AdminApi.Authorization;

/// <summary>
/// The permission catalog (spec 008, data-model §2): one <c>&lt;module&gt;.&lt;action&gt;</c> code per
/// thing a role may be allowed to do. Controllers name these constants in
/// <see cref="RequirePermissionAttribute"/>; never a string literal.
/// </summary>
/// <remarks>
/// Generated together with <c>db/migrations/0009-rbac-permissions.sql</c> from one list, so the
/// codes match the <c>permissions</c> table exactly. Adding a permission: a constant here, the
/// code in <see cref="All"/>, a new migration that inserts it (and grants it to the roles that
/// need it — never to admin, which holds everything in code) and <c>x-permission</c> in OpenAPI.
/// </remarks>
public static class Permissions
{
    public static class Pages
    {
        public const string Read = "pages.read";
        public const string Create = "pages.create";
        public const string Update = "pages.update";
        public const string Delete = "pages.delete";
        public const string DeleteSubtree = "pages.delete_subtree";
    }

    public static class PressReleases
    {
        public const string Read = "press_releases.read";
        public const string Create = "press_releases.create";
        public const string Update = "press_releases.update";
        public const string Delete = "press_releases.delete";
    }

    public static class Banners
    {
        public const string Read = "banners.read";
        public const string Create = "banners.create";
        public const string Update = "banners.update";
        public const string Delete = "banners.delete";
    }

    public static class Events
    {
        public const string Read = "events.read";
        public const string Create = "events.create";
        public const string Update = "events.update";
        public const string Delete = "events.delete";
    }

    public static class Csr
    {
        public const string Read = "csr.read";
        public const string Create = "csr.create";
        public const string Update = "csr.update";
        public const string Delete = "csr.delete";
    }

    /// <summary>International financial institutions (spec 044) and their membership dates.</summary>
    public static class Ifi
    {
        public const string Read = "ifi.read";
        public const string Create = "ifi.create";
        public const string Update = "ifi.update";
        public const string Delete = "ifi.delete";
    }

    /// <summary>FAQ "Sual-cavab" (spec 051): topics, questions and videos.</summary>
    public static class Faq
    {
        public const string Read = "faq.read";
        public const string Create = "faq.create";
        public const string Update = "faq.update";
        public const string Delete = "faq.delete";
    }

    /// <summary>FinCERT page (spec 053): the settings record, activity directions and memberships.</summary>
    public static class Fincert
    {
        public const string Read = "fincert.read";
        public const string Create = "fincert.create";
        public const string Update = "fincert.update";
        public const string Delete = "fincert.delete";
    }

    /// <summary>Memoranda of Understanding with foreign central banks and supervisors (spec 045).</summary>
    public static class Memorandums
    {
        public const string Read = "memorandums.read";
        public const string Create = "memorandums.create";
        public const string Update = "memorandums.update";
        public const string Delete = "memorandums.delete";
    }

    /// <summary>Monthly reports of the consumer rights pages: complaint indices and infographics (spec 052).</summary>
    public static class MonthlyReports
    {
        public const string Read = "monthly_reports.read";
        public const string Create = "monthly_reports.create";
        public const string Update = "monthly_reports.update";
        public const string Delete = "monthly_reports.delete";
    }

    /// <summary>Working papers of the publications and research section (spec 054).</summary>
    public static class WorkingPapers
    {
        public const string Read = "working_papers.read";
        public const string Create = "working_papers.create";
        public const string Update = "working_papers.update";
        public const string Delete = "working_papers.delete";
    }

    /// <summary>The information disclosure schedule (spec 039): items, groups and periodicities.</summary>
    public static class ReleaseSchedule
    {
        public const string Read = "release_schedule.read";
        public const string Create = "release_schedule.create";
        public const string Update = "release_schedule.update";
        public const string Delete = "release_schedule.delete";
    }

    public static class Galleries
    {
        public const string Read = "galleries.read";
        public const string Create = "galleries.create";
        public const string Update = "galleries.update";
        public const string Delete = "galleries.delete";
    }

    public static class HomepageLinks
    {
        public const string Read = "homepage_links.read";
        public const string Create = "homepage_links.create";
        public const string Update = "homepage_links.update";
        public const string Delete = "homepage_links.delete";
    }

    public static class HomepagePublications
    {
        public const string Read = "homepage_publications.read";
        public const string Create = "homepage_publications.create";
        public const string Update = "homepage_publications.update";
        public const string Delete = "homepage_publications.delete";
    }

    /// <summary>The homepage "Strategiya və sənədlər" documents (spec 057); <c>Update</c> also reorders them.</summary>
    public static class HomepageStrategyDocs
    {
        public const string Read = "homepage_strategy_docs.read";
        public const string Create = "homepage_strategy_docs.create";
        public const string Update = "homepage_strategy_docs.update";
        public const string Delete = "homepage_strategy_docs.delete";
    }

    public static class ImagePopups
    {
        public const string Read = "image_popups.read";
        public const string Create = "image_popups.create";
        public const string Update = "image_popups.update";
        public const string Delete = "image_popups.delete";
    }

    public static class InfoLines
    {
        public const string Read = "info_lines.read";
        public const string Create = "info_lines.create";
        public const string Update = "info_lines.update";
        public const string Delete = "info_lines.delete";
    }

    public static class RunningLines
    {
        public const string Read = "running_lines.read";
        public const string Create = "running_lines.create";
        public const string Update = "running_lines.update";
        public const string Delete = "running_lines.delete";
    }

    public static class NewsSlider
    {
        public const string Read = "news_slider.read";
        public const string Create = "news_slider.create";
        public const string Update = "news_slider.update";
        public const string Delete = "news_slider.delete";
    }

    public static class Videos
    {
        public const string Read = "videos.read";
        public const string Create = "videos.create";
        public const string Update = "videos.update";
        public const string Delete = "videos.delete";
    }

    public static class VideoStreams
    {
        public const string Read = "video_streams.read";
        public const string Create = "video_streams.create";
        public const string Update = "video_streams.update";
        public const string Delete = "video_streams.delete";
    }

    public static class Laws
    {
        public const string Read = "laws.read";
        public const string Create = "laws.create";
        public const string Update = "laws.update";
        public const string Delete = "laws.delete";
    }

    public static class LawCategories
    {
        public const string Read = "law_categories.read";
        public const string Create = "law_categories.create";
        public const string Update = "law_categories.update";
        public const string Delete = "law_categories.delete";
    }

    public static class MoneyMarks
    {
        public const string Read = "money_marks.read";
        public const string Create = "money_marks.create";
        public const string Update = "money_marks.update";
        public const string Delete = "money_marks.delete";
    }

    public static class Organization
    {
        public const string Read = "organization.read";
        public const string Create = "organization.create";
        public const string Update = "organization.update";
        public const string Delete = "organization.delete";
    }

    public static class Azir
    {
        public const string Read = "azir.read";
        public const string Create = "azir.create";
        public const string Delete = "azir.delete";
    }

    public static class Inflation
    {
        public const string Read = "inflation.read";
        public const string Create = "inflation.create";
        public const string Update = "inflation.update";
        public const string Delete = "inflation.delete";
    }

    public static class YieldCurves
    {
        public const string Read = "yield_curves.read";
        public const string Create = "yield_curves.create";
        public const string Update = "yield_curves.update";
        public const string Delete = "yield_curves.delete";
    }

    public static class Currencies
    {
        public const string Read = "currencies.read";
        public const string Update = "currencies.update";
    }

    public static class CurrencyRates
    {
        public const string Read = "currency_rates.read";
        public const string Prepare = "currency_rates.prepare";
        public const string Approve = "currency_rates.approve";
    }

    public static class Meas
    {
        public const string Read = "meas.read";
        public const string Create = "meas.create";
        public const string Update = "meas.update";
        public const string Delete = "meas.delete";
    }

    public static class Media
    {
        public const string Read = "media.read";
        public const string Create = "media.create";
        public const string Delete = "media.delete";
        public const string DeleteOwn = "media.delete_own";
    }

    public static class Settings
    {
        public const string Read = "settings.read";
        public const string Update = "settings.update";
        public const string Delete = "settings.delete";
    }

    public static class Users
    {
        public const string Read = "users.read";
        public const string Create = "users.create";
        public const string Update = "users.update";
        public const string Delete = "users.delete";
    }

    public static class Roles
    {
        public const string Read = "roles.read";
    }

    public static class Audit
    {
        public const string Read = "audit.read";
    }

    /// <summary>Every code in the catalog (114); admin's permission set.</summary>
    public static readonly IReadOnlyList<string> All =
    [
        Pages.Read,
        Pages.Create,
        Pages.Update,
        Pages.Delete,
        Pages.DeleteSubtree,
        PressReleases.Read,
        PressReleases.Create,
        PressReleases.Update,
        PressReleases.Delete,
        Banners.Read,
        Banners.Create,
        Banners.Update,
        Banners.Delete,
        Events.Read,
        Events.Create,
        Events.Update,
        Events.Delete,
        Csr.Read,
        Csr.Create,
        Csr.Update,
        Csr.Delete,
        Ifi.Read,
        Ifi.Create,
        Ifi.Update,
        Ifi.Delete,
        Faq.Read,
        Faq.Create,
        Faq.Update,
        Faq.Delete,
        Fincert.Read,
        Fincert.Create,
        Fincert.Update,
        Fincert.Delete,
        Memorandums.Read,
        Memorandums.Create,
        Memorandums.Update,
        Memorandums.Delete,
        MonthlyReports.Read,
        MonthlyReports.Create,
        MonthlyReports.Update,
        MonthlyReports.Delete,
        WorkingPapers.Read,
        WorkingPapers.Create,
        WorkingPapers.Update,
        WorkingPapers.Delete,
        ReleaseSchedule.Read,
        ReleaseSchedule.Create,
        ReleaseSchedule.Update,
        ReleaseSchedule.Delete,
        Galleries.Read,
        Galleries.Create,
        Galleries.Update,
        Galleries.Delete,
        HomepageLinks.Read,
        HomepageLinks.Create,
        HomepageLinks.Update,
        HomepageLinks.Delete,
        HomepagePublications.Read,
        HomepagePublications.Create,
        HomepagePublications.Update,
        HomepagePublications.Delete,
        HomepageStrategyDocs.Read,
        HomepageStrategyDocs.Create,
        HomepageStrategyDocs.Update,
        HomepageStrategyDocs.Delete,
        ImagePopups.Read,
        ImagePopups.Create,
        ImagePopups.Update,
        ImagePopups.Delete,
        InfoLines.Read,
        InfoLines.Create,
        InfoLines.Update,
        InfoLines.Delete,
        RunningLines.Read,
        RunningLines.Create,
        RunningLines.Update,
        RunningLines.Delete,
        NewsSlider.Read,
        NewsSlider.Create,
        NewsSlider.Update,
        NewsSlider.Delete,
        Videos.Read,
        Videos.Create,
        Videos.Update,
        Videos.Delete,
        VideoStreams.Read,
        VideoStreams.Create,
        VideoStreams.Update,
        VideoStreams.Delete,
        Laws.Read,
        Laws.Create,
        Laws.Update,
        Laws.Delete,
        LawCategories.Read,
        LawCategories.Create,
        LawCategories.Update,
        LawCategories.Delete,
        MoneyMarks.Read,
        MoneyMarks.Create,
        MoneyMarks.Update,
        MoneyMarks.Delete,
        Organization.Read,
        Organization.Create,
        Organization.Update,
        Organization.Delete,
        Azir.Read,
        Azir.Create,
        Azir.Delete,
        Inflation.Read,
        Inflation.Create,
        Inflation.Update,
        Inflation.Delete,
        YieldCurves.Read,
        YieldCurves.Create,
        YieldCurves.Update,
        YieldCurves.Delete,
        Currencies.Read,
        Currencies.Update,
        CurrencyRates.Read,
        CurrencyRates.Prepare,
        CurrencyRates.Approve,
        Meas.Read,
        Meas.Create,
        Meas.Update,
        Meas.Delete,
        Media.Read,
        Media.Create,
        Media.Delete,
        Media.DeleteOwn,
        Settings.Read,
        Settings.Update,
        Settings.Delete,
        Users.Read,
        Users.Create,
        Users.Update,
        Users.Delete,
        Roles.Read,
        Audit.Read,
    ];
}
