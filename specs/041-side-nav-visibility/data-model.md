# Data Model: "Sol menyuda göstər" (spec 041)

## Cədvəl `page_details` (yeni, miqrasiya `0024-page-details.sql`, sahibi `api-cbar-admin`)

| Sütun | Tip | Qayda |
|---|---|---|
| `page_id` | `integer` PK | `pages.id`. FK `ON DELETE CASCADE` yalnız `REFERENCES` hüququ olanda (research R2) |
| `show_in_side_nav` | `boolean NOT NULL DEFAULT true` | `false`: bölmənin sol menyusunda göstərilmir |

- Sətir yoxdursa bütün sütunlar default sayılır (FR-002). Mövcud səhifələr üçün backfill yoxdur.
- Sətir yalnız dəyər `false` olanda və ya sətir artıq varsa yazılır (R5).
- `cbar_web_ro` üçün `SELECT` (rol varsa).
- Soft-delete olunmuş səhifənin sətri qalır, görünmür (R3).

## EF modeli (`src/Cbar.Domain`, iki nüsxədə bayt-bayt eyni)

- `PageDetail { int PageId; bool ShowInSideNav = true; }`, `Entities/Content.cs`-də `Page`-in yanında.
- `Page.Detail` (`PageDetail?`), 1:1.
- `CbarDbContext`: `DbSet<PageDetail> PageDetails`; `b.Entity<PageDetail>`: `ToTable("page_details")`, `HasKey(PageId)`,
  `ValueGeneratedNever`. `Page`-də `HasOne(x => x.Detail).WithOne().HasForeignKey<PageDetail>(d => d.PageId)
  .OnDelete(Cascade)`. Şərhdə miqrasiyaya istinad (`0017` nümunəsi).
- Oxuma ifadəsi hər yerdə eynidir: `ShowInSideNav = p.Detail == null || p.Detail.ShowInSideNav`.

## Admin API DTO (`PagesController.cs`)

- `PageFlagsDto` sona `bool? ShowInSideNav = null` alır. Input-da `null` mövcud dəyəri saxlayır (R4). Cavablarda həmişə dolu olur.
- Üç proyeksiya: `Tree`, `ToDetailDto` və `ToDetailDto`-ya gedən `Update`/`Create` entity-si (`Include(p => p.Detail)`).
- Audit: `pages.update` `before` (`ToDetailDto`) və `dto`-nu artıq yazır, bayraq oraya avtomatik düşür (FR-006).

## İctimai ağac node-u (`api-cbar` `PagesController.PageNode`)

`record PageNode(int Id, string Title, string Slug, string? NavUrl, bool ShowInSideNav, List<PageNode> Children)`.
JSON sahə sırası `id, title, slug, navUrl, showInSideNav, children` olur. Süzgəc şərtləri (`Status`, `Active`, `Visible`, dil)
dəyişmir.

## web-cbar-new

- `entities/page-node/model/schemas.ts`: `PageNode.showInSideNav?: boolean`, sxemdə `z.boolean().optional()`. Yoxdursa görünür.
- `entities/page-node/lib/tree.ts`: `isInSideNav(node: PageNode, open: ReadonlySet<number>): boolean`, yəni
  `node.showInSideNav !== false || open.has(node.id)`.

## web-cbar-admin-new

- `features/pages/model/schemas.ts`: `PAGE_FLAG_KEYS`-ə `showInSideNav`, `DEFAULT_PAGE_FLAGS.showInSideNav = true`. Sxem
  default-u köhnə API cavabını da qəbul edir.
- `menu-visibility.ts`:
  - `MenuHiddenReason`-a `sectionRoot`, `sideNavOff`, `parentSideNavOff` əlavə olunur;
  - `MenuPlacement`-ə `sideNavHiddenAncestor: boolean`;
  - nəticə `{ top: LocaleMenuVisibility; side: LocaleMenuVisibility & { openOnly: boolean } }` olur (R7).

## Vəziyyət cədvəli (sol menyu, bir dil üçün)

| Üst menyuda | Dərinlik | Öz bayrağı | Əcdadda söndürülüb | Sol menyu |
|---|---|---|---|---|
| yox | — | — | — | yox (üst menyunun səbəbləri) |
| var | 1 | — | — | yox, `sectionRoot` |
| var | ≥2 | açıq | yox | var |
| var | ≥2 | söndürülüb | — | yalnız özü/alt ağacı açıq olanda (`sideNavOff`) |
| var | ≥2 | açıq | bəli | yalnız özü/alt ağacı açıq olanda (`parentSideNavOff`) |
