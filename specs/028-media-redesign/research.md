# Research: "Media" giriş səhifəsi və ümumi şablon

**Tarix**: 2026-11-02 | **Spec**: [spec.md](./spec.md)

Faktlar 2026-11-02-də ölçülüb: Figma körpüsü (`figma_node` / `figma_text`, "cbar website (Copy)"
→ Media), test API (`https://api-cbar-test.cbar.az`), `web-cbar-new` kodu.

## R1 — Şablon: yeni widget, yoxsa mövcudun ümumiləşməsi

**Fakt**: Figma Media frame-lərinin bütün ölçüləri (`1045:17245` alətlər sırası 1320×100 py30;
`1559:62331` menyu 312, p20, r4, `#F5F5F5`, gap16, link 16/600 lh28; `1045:17249` məzmun 984,
gap36; başlıq 32/600 lh44; tablet `1658:12852` px40 py24 gap10, `1658:12886` px40 pb32, menyu
664; `1658:12912` px40 pb80; mobil `1658:13251` px24 pt16 pb64 gap32, menyu 342, `Page tools`
gap12) spec 024 `contracts/ui-contract.md` §2 ilə üst-üstə düşür. `widgets/about-shell` bunları
artıq həyata keçirir və `visual-diff.md`-də ölçülüb.

**Fərq**: `about-shell/model.ts` bölmə kökünü `aboutSection(tree)` ilə, Kopyanı `isAboutCopy`
ilə tapır; etiketlər `getT(locale, 'about')`-dan gəlir.

**Decision**: `widgets/about-shell` → `widgets/section-shell` (git mv, tarixçə qalır).
`buildSectionShell({ section: 'about' | 'media', ... })`. Kök tapma `tree.ts`-də
`SECTION_TITLES: Record<SectionKey, ReadonlySet<string>>` + `sectionRoot(tree, key)`,
`isSectionCopy(node, key)`, `sectionKeyOf(tree, root)`. Mövcud `aboutSection` / `isAboutCopy` /
`ABOUT_SECTION_TITLES` export-ları `about` açarı ilə bu funksiyaların üstündən saxlanır ki,
`features/about-content` və testlər toxunulmasın.

**Alternatives**: ayrıca `media-shell` — kod ikiləşir, Figma eyni komponentdir (`subcategories`);
rədd edildi. `about-shell` adını saxlayıb `section` parametri əlavə etmək — ad yanıldır,
növbəti bölmələr (Statistika, Nəşrlər) də gələcək; rədd edildi.

## R2 — `/media` statik route ilə CMS slug toqquşması

**Fakt**: CMS "Media" kökü id 77, slug `media` **hər iki dildə**; `content` 952/778 simvol,
`assets` 0. `app/[locale]/(content)/media/page.tsx` statik route `[...slug]`-dan üstündür, ona
görə `/az/media` heç vaxt CMS view-a düşmür.

**Decision**: route qalır (`/media/galleries/[id]` altındadır, yolu dəyişmək legacy linkləri
sındırardı). Loader `getPage(locale, 'media')` + `getPagesTree(locale)` çağırır
(`Promise.allSettled` — ağac uğursuzsa menyu boş). Slug hər iki dildə eyni olduğu üçün sabit
`'media'`; dəyişsə `features/pages` tərəfdə id ilə axtarış lazım olar (hazırda API slug ilə
işləyir).

**Alternatives**: `/media` route-unu silib CMS view-a buraxmaq — `/media/galleries/[id]`
qalmalıdır, `(content)/media/` qovluğu onsuz da lazımdır; CMS view-da isə "Media" üçün xüsusi
şərt gərəkərdi. Rədd edildi.

## R3 — Qalereya/video grid-ləri hara gedir

**Fakt**: `views/media/index.tsx` üç blok render edir: canlı yayım (`getVideoStreams`), qalereya
(`getGalleries`, 10), video (`getVideos`, 10). CMS `navUrl`-ları `/media#galleries`,
`/media#videos`. `isCurrentNode` hash ünvanı heç vaxt cari saymır. `views/home` qalereya
kartlarını `/media/galleries/{id}`-ə bağlayır (dəyişmir).

**Decision**: iki yeni view: `views/media-galleries` (qalereya grid-i, mövcud markup),
`views/media-videos` (canlı yayım kartı + video grid-i). Hər ikisi `SectionShell` içində,
`current: { href: '/{locale}/media/galleries' }` ilə — redaktor `navUrl`-ı dəyişəndən sonra
menyu bəndi aktiv olur. H1 ağacda uyğun bəndin adıdır (`findChainBy(isCurrent)`), tapılmasa
`media.json` etiketi. `FEATURE_ROUTES` `fotoqalereya`/`videoqalereya` yeni yollara.

**Alternatives**: grid-ləri giriş mətninin altında saxlamaq — Figma landing-i ilə uyğun gəlmir,
sonrakı Qalereya spec-ində yenə köçürülməli olardı. Rədd edildi.

## R4 — Proxy matcher

**Fakt**: `config.matcher = ['/((?!_next|api|media|.*\\..*).*)']`. `media` istisnası `/media/12`
fayl proxy-si üçündür (spec 003 FR-006), amma `/media`, `/media/galleries` də kənarda qalır →
locale yönləndirməsi olmur, Next 404 verir (route yalnız `[locale]` altındadır).

**Decision**: istisna `media/\d+` olur: `'/((?!_next|api|media/\\d+|.*\\..*).*)'`. `proxy.test.ts`
"matcher əhatəsi" bloku: `/media`, `/media/galleries`, `/media/videos` düşür; `/media/12`,
`/media/1809` kənarda.

## R5 — i18n namespace

**Fakt**: `about.json`-da şablon açarları (`breadcrumb.*`, `share.*`, `nav.label`) About-a
məxsus açarlarla (`history`, `board`, `staff`, `photos`, `divisions`) birgədir. Şablon
komponentləri `getT(locale, 'about')` çağırır.

**Decision**: yeni `locales/{az,en}/section.json` yalnız şablon açarları ilə; `about.json`-dan
həmin açarlar silinir. `NAMESPACES`-ə `'section'`. `key-parity.test.ts` və `utf8-guard` keçir.

## R6 — Köhnə ünvanlar

**Fakt**: `product-host` `config/rules.php`: qalereya `/gallery/photos`,
`/gallery/photos/detail/<id>`; videolar `/videos`. Dil `?language=` ilə və ya `/az|en/` prefiksi.
`notdoneyet.md` §"Köhnə URL-lər" bunları açıq bənd kimi saxlayır.

**Decision**: `legacyRedirect()`-ə iki regex: `^/(?:(az|en)/)?gallery/photos(?:/detail/(\d+))?/?$`
→ `/{locale}/media/galleries[/{id}]`; `^/(?:(az|en)/)?videos/?$` → `/{locale}/media/videos`.
Locale AZIR qaydası ilə (`?language=` → prefiks → `az`). Digər parametrlər atılır.
`press-release-*` yönləndirmələri bu spec-də deyil (Xəbərlər spec-i).

## R7 — Media ağacının CMS səhifələri

**Fakt**: `views/cms-page/loader.ts` `isAbout = aboutSection(tree)?.id === section.id`;
view About olanda `AboutShell` + `AboutBlocks`, yoxsa köhnə `SectionSidebar`. `layoutFor(slug)`
About slug-larına görədir, Media slug-ları üçün `plain` qaytarır.

**Decision**: `sectionKeyOf(tree, section)` → `'about' | 'media' | null`. `about` → bugünkü yol
(layout + bloklar); `media` → şablon + `blocks = [{ kind: 'html', html }]` (parser çağırılmır,
`layout = 'plain'`). `null` → köhnə görünüş (digər bölmələr dəyişmir — Maddə I.3, əhatə).
`CmsPageViewData.about` sahəsi `shellPage` kimi adlanır, `section: SectionKey` daşıyır.

## R8 — Qalereya detalı şablonda

**Fakt**: `views/gallery` `PageTitle` + `BackLink('/media')`. Figma `Qalereya - Foto` detalı
sonrakı spec-dir, amma `/media`-ya qayıdan link giriş səhifəsinə aparacaqdı (grid orada yoxdur).

**Decision**: minimal: `SectionShell` (breadcrumb "… › Fotoqalereya › {ad}", `trail` = qalereya
adı, `current: { href: '/{locale}/media/galleries' }`), şəkil grid-i olduğu kimi, `BackLink`
silinir. Detalın Figma dizaynı Qalereya spec-ində.
