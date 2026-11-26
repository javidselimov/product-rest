using Cbar.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Cbar.Domain;

/// <summary>
/// Shared EF Core model over the redesigned cbar schema (db/schema.sql).
/// Consumed read-only by Cbar.WebApi (cbar_web_ro role) and read-write by Cbar.AdminApi.
/// </summary>
public class CbarDbContext(DbContextOptions<CbarDbContext> options) : DbContext(options)
{
    public DbSet<Locale> Locales => Set<Locale>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<UserSecurityStamp> UserSecurityStamps => Set<UserSecurityStamp>();
    public DbSet<UserSession> UserSessions => Set<UserSession>();
    public DbSet<AuditLogEntry> AuditLog => Set<AuditLogEntry>();
    public DbSet<MediaAsset> MediaAssets => Set<MediaAsset>();
    public DbSet<Page> Pages => Set<Page>();
    public DbSet<PageTranslation> PageTranslations => Set<PageTranslation>();
    public DbSet<PageDetail> PageDetails => Set<PageDetail>();
    public DbSet<PageNavDetail> PageNavDetails => Set<PageNavDetail>();
    public DbSet<PageTranslationDetail> PageTranslationDetails => Set<PageTranslationDetail>();
    public DbSet<MediaAssetDetail> MediaAssetDetails => Set<MediaAssetDetail>();
    public DbSet<WorkingPaper> WorkingPapers => Set<WorkingPaper>();
    public DbSet<WorkingPaperTranslation> WorkingPaperTranslations => Set<WorkingPaperTranslation>();
    public DbSet<PressRelease> PressReleases => Set<PressRelease>();
    public DbSet<PressReleaseTranslation> PressReleaseTranslations => Set<PressReleaseTranslation>();
    public DbSet<Event> Events => Set<Event>();
    public DbSet<EventTranslation> EventTranslations => Set<EventTranslation>();
    public DbSet<EventCategory> EventCategories => Set<EventCategory>();
    public DbSet<EventCategoryTranslation> EventCategoryTranslations => Set<EventCategoryTranslation>();
    public DbSet<CsrProject> CsrProjects => Set<CsrProject>();
    public DbSet<CsrProjectTranslation> CsrProjectTranslations => Set<CsrProjectTranslation>();
    public DbSet<CsrProjectImage> CsrProjectImages => Set<CsrProjectImage>();
    public DbSet<CsrCategory> CsrCategories => Set<CsrCategory>();
    public DbSet<CsrCategoryTranslation> CsrCategoryTranslations => Set<CsrCategoryTranslation>();
    public DbSet<IfiOrganization> IfiOrganizations => Set<IfiOrganization>();
    public DbSet<IfiOrganizationTranslation> IfiOrganizationTranslations => Set<IfiOrganizationTranslation>();
    public DbSet<IfiMembership> IfiMemberships => Set<IfiMembership>();
    public DbSet<IfiMembershipTranslation> IfiMembershipTranslations => Set<IfiMembershipTranslation>();
    public DbSet<Memorandum> Memorandums => Set<Memorandum>();
    public DbSet<MemorandumTranslation> MemorandumTranslations => Set<MemorandumTranslation>();
    public DbSet<MonthlyReportSeries> MonthlyReportSeries => Set<MonthlyReportSeries>();
    public DbSet<MonthlyReportSeriesTranslation> MonthlyReportSeriesTranslations => Set<MonthlyReportSeriesTranslation>();
    public DbSet<MonthlyReport> MonthlyReports => Set<MonthlyReport>();
    public DbSet<MonthlyReportTranslation> MonthlyReportTranslations => Set<MonthlyReportTranslation>();
    public DbSet<FaqTopic> FaqTopics => Set<FaqTopic>();
    public DbSet<FaqTopicTranslation> FaqTopicTranslations => Set<FaqTopicTranslation>();
    public DbSet<FaqTopicPage> FaqTopicPages => Set<FaqTopicPage>();
    public DbSet<FaqQuestion> FaqQuestions => Set<FaqQuestion>();
    public DbSet<FaqQuestionTranslation> FaqQuestionTranslations => Set<FaqQuestionTranslation>();
    public DbSet<FaqVideo> FaqVideos => Set<FaqVideo>();
    public DbSet<FaqVideoTranslation> FaqVideoTranslations => Set<FaqVideoTranslation>();
    public DbSet<FincertSettings> FincertSettings => Set<FincertSettings>();
    public DbSet<FincertSettingsTranslation> FincertSettingsTranslations => Set<FincertSettingsTranslation>();
    public DbSet<FincertDirection> FincertDirections => Set<FincertDirection>();
    public DbSet<FincertDirectionTranslation> FincertDirectionTranslations => Set<FincertDirectionTranslation>();
    public DbSet<FincertMembership> FincertMemberships => Set<FincertMembership>();
    public DbSet<FincertMembershipTranslation> FincertMembershipTranslations => Set<FincertMembershipTranslation>();
    public DbSet<ReleaseScheduleItem> ReleaseScheduleItems => Set<ReleaseScheduleItem>();
    public DbSet<ReleaseScheduleItemTranslation> ReleaseScheduleItemTranslations => Set<ReleaseScheduleItemTranslation>();
    public DbSet<ReleaseScheduleGroup> ReleaseScheduleGroups => Set<ReleaseScheduleGroup>();
    public DbSet<ReleaseScheduleGroupTranslation> ReleaseScheduleGroupTranslations => Set<ReleaseScheduleGroupTranslation>();
    public DbSet<ReleaseSchedulePeriodicity> ReleaseSchedulePeriodicities => Set<ReleaseSchedulePeriodicity>();
    public DbSet<ReleaseSchedulePeriodicityTranslation> ReleaseSchedulePeriodicityTranslations => Set<ReleaseSchedulePeriodicityTranslation>();
    public DbSet<Currency> Currencies => Set<Currency>();
    public DbSet<CurrencyRate> CurrencyRates => Set<CurrencyRate>();
    public DbSet<AzirIndexValue> AzirIndexValues => Set<AzirIndexValue>();
    public DbSet<AzirIndexValueDetail> AzirIndexValueDetails => Set<AzirIndexValueDetail>();
    public DbSet<MonthlyInflationParameter> MonthlyInflationParameters => Set<MonthlyInflationParameter>();
    public DbSet<InflationSetting> InflationSettings => Set<InflationSetting>();
    public DbSet<InfoLine> InfoLines => Set<InfoLine>();
    public DbSet<YcYield> YcYields => Set<YcYield>();
    public DbSet<YcParameters> YcParameters => Set<YcParameters>();
    public DbSet<YcPeriods> YcPeriods => Set<YcPeriods>();
    public DbSet<LawCategory> LawCategories => Set<LawCategory>();
    public DbSet<Law> Laws => Set<Law>();
    public DbSet<MeasEmitent> MeasEmitents => Set<MeasEmitent>();
    public DbSet<MeasInfoType> MeasInfoTypes => Set<MeasInfoType>();
    public DbSet<MeasDocument> MeasDocuments => Set<MeasDocument>();
    public DbSet<OrganizationDivision> OrganizationDivisions => Set<OrganizationDivision>();
    public DbSet<OrganizationOffice> OrganizationOffices => Set<OrganizationOffice>();
    public DbSet<OrganizationStaff> OrganizationStaff => Set<OrganizationStaff>();
    public DbSet<OrgChartNode> OrgChartNodes => Set<OrgChartNode>();
    public DbSet<OrgChartNodeDetail> OrgChartNodeDetails => Set<OrgChartNodeDetail>();
    public DbSet<MoneyMarkCategory> MoneyMarkCategories => Set<MoneyMarkCategory>();
    public DbSet<MoneyMark> MoneyMarks => Set<MoneyMark>();
    public DbSet<MoneyMarkNews> MoneyMarkNews => Set<MoneyMarkNews>();
    public DbSet<Gallery> Galleries => Set<Gallery>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<VideoStream> VideoStreams => Set<VideoStream>();
    public DbSet<Banner> Banners => Set<Banner>();
    public DbSet<ImagePopup> ImagePopups => Set<ImagePopup>();
    public DbSet<NewsSliderItem> NewsSliderItems => Set<NewsSliderItem>();
    public DbSet<RunningLine> RunningLines => Set<RunningLine>();
    public DbSet<HomepageLink> HomepageLinks => Set<HomepageLink>();
    public DbSet<HomepagePublication> HomepagePublications => Set<HomepagePublication>();
    public DbSet<HomepageStrategyDoc> HomepageStrategyDocs => Set<HomepageStrategyDoc>();
    public DbSet<Setting> Settings => Set<Setting>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // EF would otherwise send default(DateTimeOffset) and override the DB defaults.
        var now = DateTimeOffset.UtcNow;
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State is not (EntityState.Added or EntityState.Modified))
                continue;
            if (entry.State == EntityState.Added && entry.Metadata.FindProperty("CreatedAt") is not null)
                entry.Property("CreatedAt").CurrentValue = now;
            if (entry.Metadata.FindProperty("UpdatedAt") is not null)
                entry.Property("UpdatedAt").CurrentValue = now;
        }
        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.HasPostgresEnum<ContentStatus>("content_status");
        b.HasPostgresExtension("ltree");
        b.HasPostgresExtension("citext");

        b.Entity<Locale>(e =>
        {
            e.ToTable("locales");
            e.HasKey(x => x.Code);
        });

        b.Entity<Role>(e =>
        {
            e.ToTable("roles");
            // Column names as migration 0001 created them; by convention EF would look for
            // permissions_id / roles_id and every non-admin role check would fail (42703).
            e.HasMany(x => x.Permissions).WithMany(x => x.Roles)
                .UsingEntity<Dictionary<string, object>>(
                    "role_permissions",
                    right => right.HasOne<Permission>().WithMany().HasForeignKey("permission_id"),
                    left => left.HasOne<Role>().WithMany().HasForeignKey("role_id"),
                    join => join.HasKey("role_id", "permission_id"));
        });

        b.Entity<Permission>(e => e.ToTable("permissions"));

        b.Entity<User>(e =>
        {
            e.ToTable("users");
            e.Property(x => x.Username).HasColumnType("citext");
            e.Property(x => x.Email).HasColumnType("citext");
            e.HasIndex(x => x.Username).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<RefreshToken>(e =>
        {
            // Not refresh_tokens: see db/migrations/0004-admin-refresh-tokens.sql.
            e.ToTable("admin_refresh_tokens");
            e.HasIndex(x => x.TokenHash).IsUnique();
            e.HasIndex(x => x.UserId);
            e.HasIndex(x => x.FamilyId);
        });

        b.Entity<UserSecurityStamp>(e =>
        {
            // Not a users column: see db/migrations/0007-admin-user-security-stamps.sql.
            e.ToTable("admin_user_security_stamps");
            e.HasKey(x => x.UserId);
            e.Property(x => x.UserId).ValueGeneratedNever();
        });

        b.Entity<UserSession>(e =>
        {
            e.ToTable("user_sessions");
            e.HasIndex(x => x.SessionKey).IsUnique();
        });

        b.Entity<AuditLogEntry>(e =>
        {
            e.ToTable("audit_log");
            e.Property(x => x.Before).HasColumnType("jsonb");
            e.Property(x => x.After).HasColumnType("jsonb");
        });

        b.Entity<MediaAsset>(e =>
        {
            e.ToTable("media_assets");
            e.HasIndex(x => x.StorageKey).IsUnique();
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<Page>(e =>
        {
            e.ToTable("pages");
            e.Property(x => x.Path).HasColumnType("ltree");
            e.HasOne(x => x.Parent).WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<PageDetail>(d => d.PageId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.NavDetails).WithOne()
                .HasForeignKey<PageNavDetail>(d => d.PageId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.TranslationDetails).WithOne()
                .HasForeignKey(d => d.PageId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PageDetail>(e =>
        {
            // Not a pages column: see db/migrations/0024-page-details.sql.
            e.ToTable("page_details");
            e.HasKey(x => x.PageId);
            e.Property(x => x.PageId).ValueGeneratedNever();
        });

        b.Entity<PageNavDetail>(e =>
        {
            // Not a pages column: see db/migrations/0039-page-nav-details.sql.
            e.ToTable("page_nav_details");
            e.HasKey(x => x.PageId);
            e.Property(x => x.PageId).ValueGeneratedNever();
        });

        b.Entity<PageTranslationDetail>(e =>
        {
            // Keyed by (page, locale), not by translation id: see db/migrations/0039-page-nav-details.sql.
            e.ToTable("page_translation_details");
            e.HasKey(x => new { x.PageId, x.Locale });
        });

        b.Entity<MediaAssetDetail>(e =>
        {
            // Not a media_assets column: see db/migrations/0040-media-asset-details.sql.
            e.ToTable("media_asset_details");
            e.HasKey(x => x.MediaId);
            e.Property(x => x.MediaId).ValueGeneratedNever();
        });

        b.Entity<PageTranslation>(e =>
        {
            e.ToTable("page_translations");
            e.HasIndex(x => new { x.PageId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<PageAsset>(e => e.ToTable("page_assets"));
        b.Entity<PageAssetTranslation>(e => e.ToTable("page_asset_translations"));

        b.Entity<PressRelease>(e =>
        {
            e.ToTable("press_releases");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<PressReleaseTranslation>(e =>
        {
            e.ToTable("press_release_translations");
            e.HasIndex(x => new { x.PressReleaseId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<PressReleaseAsset>(e =>
        {
            e.ToTable("press_release_assets");
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<PressReleaseAssetDetail>(d => d.AssetId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<PressReleaseAssetDetail>(e =>
        {
            // Not a press_release_assets column: see db/migrations/0017-press-release-asset-details.sql.
            e.ToTable("press_release_asset_details");
            e.HasKey(x => x.AssetId);
            e.Property(x => x.AssetId).ValueGeneratedNever();
        });

        b.Entity<Currency>(e =>
        {
            e.ToTable("currencies");
            e.HasKey(x => x.Code);
            e.Property(x => x.Code).HasMaxLength(3).IsFixedLength();
        });

        b.Entity<CurrencyTranslation>(e => e.ToTable("currency_translations"));

        b.Entity<CurrencyRate>(e =>
        {
            e.ToTable("currency_rates");
            e.Property(x => x.Rate).HasPrecision(12, 4);
            e.HasIndex(x => new { x.RateDate, x.CurrencyCode }).IsUnique();
        });

        b.Entity<Event>(e =>
        {
            e.ToTable("events");
            e.HasQueryFilter(x => x.DeletedAt == null);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Gallery).WithMany().HasForeignKey(x => x.GalleryId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.PressRelease).WithMany().HasForeignKey(x => x.PressReleaseId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Page).WithMany().HasForeignKey(x => x.PageId).OnDelete(DeleteBehavior.SetNull);
        });

        b.Entity<EventTranslation>(e =>
        {
            e.ToTable("event_translations");
            e.HasOne(x => x.Event).WithMany(x => x.Translations).HasForeignKey(x => x.EventId);
            e.HasIndex(x => new { x.EventId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<EventCategory>(e => e.ToTable("event_categories"));

        b.Entity<EventCategoryTranslation>(e =>
        {
            e.ToTable("event_category_translations");
            e.HasOne(x => x.Category).WithMany(x => x.Translations).HasForeignKey(x => x.CategoryId);
            e.HasIndex(x => new { x.CategoryId, x.Locale }).IsUnique();
        });

        b.Entity<CsrProject>(e =>
        {
            e.ToTable("csr_projects");
            e.HasQueryFilter(x => x.DeletedAt == null);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<CsrProjectTranslation>(e =>
        {
            e.ToTable("csr_project_translations");
            e.HasOne(x => x.Project).WithMany(x => x.Translations).HasForeignKey(x => x.ProjectId);
            e.HasIndex(x => new { x.ProjectId, x.Locale }).IsUnique();
        });

        b.Entity<CsrProjectImage>(e =>
        {
            e.ToTable("csr_project_images");
            e.HasOne(x => x.Project).WithMany(x => x.Images).HasForeignKey(x => x.ProjectId);
            e.HasOne(x => x.Media).WithMany().HasForeignKey(x => x.MediaId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.ProjectId, x.MediaId }).IsUnique();
        });

        b.Entity<CsrCategory>(e => e.ToTable("csr_categories"));

        b.Entity<CsrCategoryTranslation>(e =>
        {
            e.ToTable("csr_category_translations");
            e.HasOne(x => x.Category).WithMany(x => x.Translations).HasForeignKey(x => x.CategoryId);
            e.HasIndex(x => new { x.CategoryId, x.Locale }).IsUnique();
        });

        b.Entity<IfiOrganization>(e =>
        {
            e.ToTable("ifi_organizations");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<IfiOrganizationTranslation>(e =>
        {
            e.ToTable("ifi_organization_translations");
            e.HasOne(x => x.Organization).WithMany(x => x.Translations).HasForeignKey(x => x.OrganizationId);
            e.HasIndex(x => new { x.OrganizationId, x.Locale }).IsUnique();
        });

        b.Entity<IfiMembership>(e =>
        {
            e.ToTable("ifi_memberships");
            e.HasOne(x => x.Organization).WithMany(x => x.Memberships).HasForeignKey(x => x.OrganizationId);
        });

        b.Entity<IfiMembershipTranslation>(e =>
        {
            e.ToTable("ifi_membership_translations");
            e.HasOne(x => x.Membership).WithMany(x => x.Translations).HasForeignKey(x => x.MembershipId);
            e.HasIndex(x => new { x.MembershipId, x.Locale }).IsUnique();
        });

        b.Entity<Memorandum>(e =>
        {
            e.ToTable("memorandums");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<MemorandumTranslation>(e =>
        {
            e.ToTable("memorandum_translations");
            e.HasOne(x => x.Memorandum).WithMany(x => x.Translations).HasForeignKey(x => x.MemorandumId);
            e.HasIndex(x => new { x.MemorandumId, x.Locale }).IsUnique();
        });

        b.Entity<MonthlyReportSeries>(e =>
        {
            e.ToTable("monthly_report_series");
            e.HasIndex(x => x.Key).IsUnique();
        });

        b.Entity<MonthlyReportSeriesTranslation>(e =>
        {
            e.ToTable("monthly_report_series_translations");
            e.HasOne(x => x.Series).WithMany(x => x.Translations).HasForeignKey(x => x.SeriesId);
            e.HasIndex(x => new { x.SeriesId, x.Locale }).IsUnique();
        });

        b.Entity<MonthlyReport>(e =>
        {
            e.ToTable("monthly_reports");
            e.HasOne(x => x.Series).WithMany().HasForeignKey(x => x.SeriesId);
            e.HasIndex(x => new { x.SeriesId, x.Year, x.Month }).IsUnique().HasFilter("deleted_at IS NULL");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<MonthlyReportTranslation>(e =>
        {
            e.ToTable("monthly_report_translations");
            e.HasOne(x => x.Report).WithMany(x => x.Translations).HasForeignKey(x => x.ReportId);
            e.HasIndex(x => new { x.ReportId, x.Locale }).IsUnique();
        });

        b.Entity<WorkingPaper>(e =>
        {
            e.ToTable("working_papers");
            e.Property(x => x.JelCodes).HasColumnType("text[]");
            e.HasIndex(x => new { x.Number, x.Year }).IsUnique().HasFilter("deleted_at IS NULL");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<WorkingPaperTranslation>(e =>
        {
            e.ToTable("working_paper_translations");
            e.HasOne(x => x.Paper).WithMany(x => x.Translations).HasForeignKey(x => x.PaperId);
            e.HasIndex(x => new { x.PaperId, x.Locale }).IsUnique();
            e.Property(x => x.Authors).HasColumnType("text[]");
            e.Property(x => x.Keywords).HasColumnType("text[]");
        });

        b.Entity<FaqTopic>(e =>
        {
            e.ToTable("faq_topics");
            e.HasIndex(x => x.Slug).IsUnique();
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<FaqTopicTranslation>(e =>
        {
            e.ToTable("faq_topic_translations");
            e.HasOne(x => x.Topic).WithMany(x => x.Translations).HasForeignKey(x => x.TopicId);
            e.HasIndex(x => new { x.TopicId, x.Locale }).IsUnique();
        });

        b.Entity<FaqTopicPage>(e =>
        {
            e.ToTable("faq_topic_pages");
            e.HasKey(x => new { x.TopicId, x.PageId });
            e.HasOne(x => x.Topic).WithMany(x => x.Pages).HasForeignKey(x => x.TopicId);
        });

        b.Entity<FaqQuestion>(e =>
        {
            e.ToTable("faq_questions");
            e.HasOne(x => x.Topic).WithMany(x => x.Questions).HasForeignKey(x => x.TopicId);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<FaqQuestionTranslation>(e =>
        {
            e.ToTable("faq_question_translations");
            e.Property(x => x.Text).HasColumnName("question");
            e.HasOne(x => x.Question).WithMany(x => x.Translations).HasForeignKey(x => x.QuestionId);
            e.HasIndex(x => new { x.QuestionId, x.Locale }).IsUnique();
        });

        b.Entity<FaqVideo>(e =>
        {
            e.ToTable("faq_videos");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<FaqVideoTranslation>(e =>
        {
            e.ToTable("faq_video_translations");
            e.HasOne(x => x.Video).WithMany(x => x.Translations).HasForeignKey(x => x.VideoId);
            e.HasIndex(x => new { x.VideoId, x.Locale }).IsUnique();
        });

        b.Entity<FincertSettings>(e =>
        {
            e.ToTable("fincert_settings");
            e.Property(x => x.Id).ValueGeneratedNever();
        });

        b.Entity<FincertSettingsTranslation>(e =>
        {
            e.ToTable("fincert_setting_translations");
            e.HasOne(x => x.Settings).WithMany(x => x.Translations).HasForeignKey(x => x.SettingsId);
            e.HasOne(x => x.RfcMedia).WithMany().HasForeignKey(x => x.RfcMediaId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.SettingsId, x.Locale }).IsUnique();
        });

        b.Entity<FincertDirection>(e =>
        {
            e.ToTable("fincert_directions");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<FincertDirectionTranslation>(e =>
        {
            e.ToTable("fincert_direction_translations");
            e.HasOne(x => x.Direction).WithMany(x => x.Translations).HasForeignKey(x => x.DirectionId);
            e.HasIndex(x => new { x.DirectionId, x.Locale }).IsUnique();
        });

        b.Entity<FincertMembership>(e =>
        {
            e.ToTable("fincert_memberships");
            e.HasOne(x => x.LogoMedia).WithMany().HasForeignKey(x => x.LogoMediaId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<FincertMembershipTranslation>(e =>
        {
            e.ToTable("fincert_membership_translations");
            e.HasOne(x => x.Membership).WithMany(x => x.Translations).HasForeignKey(x => x.MembershipId);
            e.HasIndex(x => new { x.MembershipId, x.Locale }).IsUnique();
        });

        b.Entity<ReleaseScheduleItem>(e =>
        {
            e.ToTable("release_schedule_items");
            e.HasQueryFilter(x => x.DeletedAt == null);
            e.Property(x => x.TimingMode).HasConversion<short>();
            e.HasOne(x => x.Group).WithMany().HasForeignKey(x => x.GroupId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Periodicity).WithMany().HasForeignKey(x => x.PeriodicityId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ReleaseScheduleItemTranslation>(e =>
        {
            e.ToTable("release_schedule_item_translations");
            e.HasOne(x => x.Item).WithMany(x => x.Translations).HasForeignKey(x => x.ItemId);
            e.HasIndex(x => new { x.ItemId, x.Locale }).IsUnique();
        });

        b.Entity<ReleaseScheduleGroup>(e => e.ToTable("release_schedule_groups"));

        b.Entity<ReleaseScheduleGroupTranslation>(e =>
        {
            e.ToTable("release_schedule_group_translations");
            e.HasOne(x => x.Group).WithMany(x => x.Translations).HasForeignKey(x => x.GroupId);
            e.HasIndex(x => new { x.GroupId, x.Locale }).IsUnique();
        });

        b.Entity<ReleaseSchedulePeriodicity>(e => e.ToTable("release_schedule_periodicities"));

        b.Entity<ReleaseSchedulePeriodicityTranslation>(e =>
        {
            e.ToTable("release_schedule_periodicity_translations");
            e.HasOne(x => x.Periodicity).WithMany(x => x.Translations).HasForeignKey(x => x.PeriodicityId);
            e.HasIndex(x => new { x.PeriodicityId, x.Locale }).IsUnique();
        });

        b.Entity<PressReleaseQuestion>(e =>
        {
            e.ToTable("press_release_questions");
            e.HasOne(x => x.PressRelease).WithMany(x => x.Questions)
                .HasForeignKey(x => x.PressReleaseId);
        });

        b.Entity<PressReleaseQuestionTranslation>(e =>
        {
            e.ToTable("press_release_question_translations");
            e.Property(x => x.QuestionText).HasColumnName("question");
            e.HasOne(x => x.Question).WithMany(x => x.Translations)
                .HasForeignKey(x => x.QuestionId);
            e.HasIndex(x => new { x.QuestionId, x.Locale }).IsUnique();
        });

        b.Entity<PressReleaseVote>(e =>
        {
            e.ToTable("press_release_votes");
            e.HasOne(x => x.Question).WithMany(x => x.Votes)
                .HasForeignKey(x => x.QuestionId);
            e.HasIndex(x => new { x.QuestionId, x.VoterHash }).IsUnique();
        });

        b.Entity<AzirIndexValue>(e =>
        {
            e.ToTable("azir_index_values");
            e.Property(x => x.Rate).HasPrecision(8, 4);
            e.HasIndex(x => new { x.ValueDate, x.Term }).IsUnique();
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<AzirIndexValueDetail>(d => d.AzirIndexValueId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<AzirIndexValueDetail>(e =>
        {
            // Not azir_index_values columns: see db/migrations/0008-azir-index-value-details.sql.
            e.ToTable("azir_index_value_details");
            e.HasKey(x => x.AzirIndexValueId);
            e.Property(x => x.AzirIndexValueId).ValueGeneratedNever();
            e.Property(x => x.DealVolume).HasPrecision(12, 2);
            e.Property(x => x.MinRate).HasPrecision(8, 4);
            e.Property(x => x.MaxRate).HasPrecision(8, 4);
        });

        b.Entity<MonthlyInflationParameter>(e =>
        {
            e.ToTable("monthly_inflation_parameters");
            e.Property(x => x.Value).HasPrecision(10, 4);
            e.HasIndex(x => new { x.Year, x.Month, x.ParameterCode }).IsUnique();
        });

        b.Entity<InflationSetting>(e =>
        {
            e.ToTable("inflation_settings");
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.CurrentInflation).HasPrecision(6, 2);
            e.Property(x => x.TargetInflation).HasMaxLength(255);
        });

        b.Entity<InfoLine>(e =>
        {
            e.ToTable("info_lines");
            e.HasIndex(x => new { x.Alias, x.Year });
        });

        b.Entity<InfoLineTranslation>(e =>
        {
            e.ToTable("info_line_translations");
            e.HasIndex(x => new { x.InfoLineId, x.Locale }).IsUnique();
        });

        b.Entity<YcYield>(e =>
        {
            e.ToTable("yc_yields");
            e.Property(x => x.Yield).HasPrecision(8, 4);
            e.HasIndex(x => new { x.CurveDate, x.Period }).IsUnique();
        });

        b.Entity<YcParameters>(e =>
        {
            e.ToTable("yc_parameters");
            e.Property(x => x.Beta0).HasPrecision(12, 6);
            e.Property(x => x.Beta1).HasPrecision(12, 6);
            e.Property(x => x.Beta2).HasPrecision(12, 6);
            e.Property(x => x.Lambda).HasPrecision(12, 6);
            e.HasIndex(x => x.CurveDate).IsUnique();
        });

        b.Entity<YcPeriods>(e =>
        {
            e.ToTable("yc_periods");
            e.Property(x => x.ThreeMonth).HasPrecision(8, 4);
            e.Property(x => x.SixMonth).HasPrecision(8, 4);
            e.Property(x => x.NineMonth).HasPrecision(8, 4);
            e.Property(x => x.OneYear).HasPrecision(8, 4);
            e.Property(x => x.TwoYear).HasPrecision(8, 4);
            e.Property(x => x.ThreeYear).HasPrecision(8, 4);
            e.Property(x => x.FourYear).HasPrecision(8, 4);
            e.HasIndex(x => x.CurveDate).IsUnique();
        });

        b.Entity<LawCategory>(e => e.ToTable("law_categories"));

        b.Entity<LawCategoryTranslation>(e =>
        {
            e.ToTable("law_category_translations");
            e.HasOne(x => x.Category).WithMany(x => x.Translations)
                .HasForeignKey(x => x.CategoryId);
            e.HasIndex(x => new { x.CategoryId, x.Locale }).IsUnique();
        });

        b.Entity<Law>(e =>
        {
            e.ToTable("laws");
            e.HasOne(x => x.Category).WithMany(x => x.Laws)
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<LawTranslation>(e =>
        {
            e.ToTable("law_translations");
            e.HasIndex(x => new { x.LawId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<LawAsset>(e => e.ToTable("law_assets"));

        b.Entity<MeasEmitent>(e => e.ToTable("meas_emitents"));

        b.Entity<MeasEmitentTranslation>(e =>
        {
            e.ToTable("meas_emitent_translations");
            e.HasOne(x => x.Emitent).WithMany(x => x.Translations)
                .HasForeignKey(x => x.EmitentId);
            e.HasIndex(x => new { x.EmitentId, x.Locale }).IsUnique();
        });

        b.Entity<MeasInfoType>(e => e.ToTable("meas_info_types"));

        b.Entity<MeasInfoTypeTranslation>(e =>
        {
            e.ToTable("meas_info_type_translations");
            e.HasOne(x => x.InfoType).WithMany(x => x.Translations)
                .HasForeignKey(x => x.InfoTypeId);
            e.HasIndex(x => new { x.InfoTypeId, x.Locale }).IsUnique();
        });

        b.Entity<MeasDocument>(e =>
        {
            e.ToTable("meas_documents");
            e.HasOne(x => x.Emitent).WithMany()
                .HasForeignKey(x => x.EmitentId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.InfoType).WithMany()
                .HasForeignKey(x => x.InfoTypeId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<OrganizationDivision>(e => e.ToTable("organization_divisions"));

        b.Entity<OrganizationDivisionTranslation>(e =>
        {
            e.ToTable("organization_division_translations");
            e.HasOne(x => x.Division).WithMany(x => x.Translations)
                .HasForeignKey(x => x.DivisionId);
            e.HasIndex(x => new { x.DivisionId, x.Locale }).IsUnique();
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<OrganizationDivisionTranslationDetail>(d => d.TranslationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrganizationDivisionTranslationDetail>(e =>
        {
            // Not an organization_division_translations column: see db/migrations/0016-organization-division-translation-details.sql.
            e.ToTable("organization_division_translation_details");
            e.HasKey(x => x.TranslationId);
            e.Property(x => x.TranslationId).ValueGeneratedNever();
        });

        b.Entity<OrganizationOffice>(e =>
        {
            e.ToTable("organization_offices");
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<OrganizationOfficeDetail>(d => d.OfficeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrganizationOfficeDetail>(e =>
        {
            // Not organization_offices columns: see db/migrations/0014-organization-office-detail-tables.sql.
            e.ToTable("organization_office_details");
            e.HasKey(x => x.OfficeId);
            e.Property(x => x.OfficeId).ValueGeneratedNever();
        });

        b.Entity<OrganizationOfficeTranslation>(e =>
        {
            e.ToTable("organization_office_translations");
            e.HasOne(x => x.Office).WithMany(x => x.Translations)
                .HasForeignKey(x => x.OfficeId);
            e.HasIndex(x => new { x.OfficeId, x.Locale }).IsUnique();
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<OrganizationOfficeTranslationDetail>(d => d.TranslationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrganizationOfficeTranslationDetail>(e =>
        {
            // Not organization_office_translations columns: see db/migrations/0014-organization-office-detail-tables.sql.
            e.ToTable("organization_office_translation_details");
            e.HasKey(x => x.TranslationId);
            e.Property(x => x.TranslationId).ValueGeneratedNever();
        });

        b.Entity<OrganizationStaff>(e => e.ToTable("organization_staff"));

        b.Entity<OrganizationStaffTranslation>(e =>
        {
            e.ToTable("organization_staff_translations");
            e.HasOne(x => x.Staff).WithMany(x => x.Translations)
                .HasForeignKey(x => x.StaffId);
            e.HasIndex(x => new { x.StaffId, x.Locale }).IsUnique();
        });

        b.Entity<OrganizationStaffPhoto>(e =>
        {
            e.ToTable("organization_staff_photos");
            e.HasOne(x => x.Staff).WithMany(x => x.Photos)
                .HasForeignKey(x => x.StaffId);
            e.HasIndex(x => new { x.StaffId, x.MediaId }).IsUnique();
        });

        b.Entity<OrgChartNode>(e =>
        {
            e.ToTable("org_chart_nodes");
            e.HasOne(x => x.Parent).WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
            // The database FKs to staff/divisions exist only where 0015 could add them.
            e.HasOne(x => x.Staff).WithMany()
                .HasForeignKey(x => x.StaffId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Division).WithMany()
                .HasForeignKey(x => x.DivisionId).OnDelete(DeleteBehavior.SetNull);
            e.Property(x => x.X).HasPrecision(7, 2);
            e.Property(x => x.Y).HasPrecision(7, 2);
            e.Property(x => x.W).HasPrecision(7, 2);
            e.Property(x => x.H).HasPrecision(7, 2);
            e.Property(x => x.Connector).HasColumnType("jsonb");
            e.HasOne(x => x.Details).WithOne()
                .HasForeignKey<OrgChartNodeDetail>(d => d.NodeId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<OrgChartNodeDetail>(e =>
        {
            // Not an org_chart_nodes column: see db/migrations/0045-org-chart-node-details.sql.
            e.ToTable("org_chart_node_details");
            e.HasKey(x => x.NodeId);
            e.Property(x => x.NodeId).ValueGeneratedNever();
        });

        b.Entity<OrgChartNodeTranslation>(e =>
        {
            e.ToTable("org_chart_node_translations");
            e.HasOne(x => x.Node).WithMany(x => x.Translations)
                .HasForeignKey(x => x.NodeId);
            e.HasIndex(x => new { x.NodeId, x.Locale }).IsUnique();
        });

        b.Entity<MoneyMarkCategory>(e => e.ToTable("money_mark_categories"));

        b.Entity<MoneyMarkCategoryTranslation>(e =>
        {
            e.ToTable("money_mark_category_translations");
            e.HasOne(x => x.Category).WithMany(x => x.Translations)
                .HasForeignKey(x => x.CategoryId);
            e.HasIndex(x => new { x.CategoryId, x.Locale }).IsUnique();
        });

        b.Entity<MoneyMark>(e =>
        {
            e.ToTable("money_marks");
            e.HasOne(x => x.Category).WithMany(x => x.MoneyMarks)
                .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<MoneyMarkTranslation>(e =>
        {
            e.ToTable("money_mark_translations");
            e.HasIndex(x => new { x.MoneyMarkId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<MoneyMarkNews>(e =>
        {
            e.ToTable("money_mark_news");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<MoneyMarkNewsTranslation>(e =>
        {
            e.ToTable("money_mark_news_translations");
            e.HasOne(x => x.News).WithMany(x => x.Translations)
                .HasForeignKey(x => x.NewsId);
            e.HasIndex(x => new { x.NewsId, x.Locale }).IsUnique();
            e.HasIndex(x => new { x.Locale, x.Slug }).IsUnique();
        });

        b.Entity<Gallery>(e =>
        {
            e.ToTable("galleries");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<GalleryTranslation>(e =>
        {
            e.ToTable("gallery_translations");
            e.HasIndex(x => new { x.GalleryId, x.Locale }).IsUnique();
        });

        b.Entity<GalleryImage>(e => e.ToTable("gallery_images"));

        b.Entity<Video>(e =>
        {
            e.ToTable("videos");
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<VideoTranslation>(e =>
        {
            e.ToTable("video_translations");
            e.HasIndex(x => new { x.VideoId, x.Locale }).IsUnique();
        });

        b.Entity<VideoStream>(e => e.ToTable("video_streams"));

        b.Entity<VideoStreamTranslation>(e =>
        {
            e.ToTable("video_stream_translations");
            e.HasOne(x => x.Stream).WithMany(x => x.Translations)
                .HasForeignKey(x => x.StreamId);
            e.HasIndex(x => new { x.StreamId, x.Locale }).IsUnique();
        });

        b.Entity<Banner>(e => e.ToTable("banners"));

        b.Entity<BannerTranslation>(e =>
        {
            e.ToTable("banner_translations");
            e.HasIndex(x => new { x.BannerId, x.Locale }).IsUnique();
        });

        b.Entity<ImagePopup>(e => e.ToTable("image_popups"));

        b.Entity<ImagePopupTranslation>(e =>
        {
            e.ToTable("image_popup_translations");
            e.HasOne(x => x.Popup).WithMany(x => x.Translations)
                .HasForeignKey(x => x.PopupId);
            e.HasIndex(x => new { x.PopupId, x.Locale }).IsUnique();
        });

        b.Entity<NewsSliderItem>(e => e.ToTable("news_slider"));

        b.Entity<NewsSliderItemTranslation>(e =>
        {
            e.ToTable("news_slider_translations");
            e.Property(x => x.SliderId).HasColumnName("slider_id");
            e.HasOne(x => x.Slider).WithMany(x => x.Translations)
                .HasForeignKey(x => x.SliderId);
            e.HasIndex(x => new { x.SliderId, x.Locale }).IsUnique();
        });

        b.Entity<RunningLine>(e => e.ToTable("running_lines"));

        b.Entity<RunningLineTranslation>(e =>
        {
            e.ToTable("running_line_translations");
            e.HasIndex(x => new { x.RunningLineId, x.Locale }).IsUnique();
        });

        b.Entity<HomepageLink>(e => e.ToTable("homepage_links"));

        b.Entity<HomepageLinkTranslation>(e =>
        {
            e.ToTable("homepage_link_translations");
            e.Property(x => x.LinkId).HasColumnName("link_id");
            e.HasOne(x => x.Link).WithMany(x => x.Translations)
                .HasForeignKey(x => x.LinkId);
            e.HasIndex(x => new { x.LinkId, x.Locale }).IsUnique();
        });

        b.Entity<HomepagePublication>(e => e.ToTable("homepage_publications"));

        b.Entity<HomepagePublicationTranslation>(e =>
        {
            e.ToTable("homepage_publication_translations");
            e.Property(x => x.PublicationId).HasColumnName("publication_id");
            e.HasOne(x => x.Publication).WithMany(x => x.Translations)
                .HasForeignKey(x => x.PublicationId);
            e.HasIndex(x => new { x.PublicationId, x.Locale }).IsUnique();
        });

        b.Entity<HomepageStrategyDoc>(e =>
        {
            e.ToTable("homepage_strategy_docs");
            e.HasOne(x => x.Page).WithMany().HasForeignKey(x => x.PageId).OnDelete(DeleteBehavior.SetNull);
            e.HasQueryFilter(x => x.DeletedAt == null);
        });

        b.Entity<HomepageStrategyDocTranslation>(e =>
        {
            e.ToTable("homepage_strategy_doc_translations");
            e.Property(x => x.DocId).HasColumnName("doc_id");
            e.HasOne(x => x.Doc).WithMany(x => x.Translations).HasForeignKey(x => x.DocId);
            e.HasOne(x => x.CoverMedia).WithMany().HasForeignKey(x => x.CoverMediaId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.DocId, x.Locale }).IsUnique();
        });

        b.Entity<Setting>(e =>
        {
            e.ToTable("settings");
            e.HasKey(x => x.Key);
            e.Property(x => x.Value).HasColumnType("jsonb");
        });
    }
}
