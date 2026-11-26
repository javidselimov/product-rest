# Research — 053 FinCERT səhifəsi

Hər bənd: **Qərar**, **Səbəb**, **Rədd edilən alternativlər**. Mənbələr: spec 044/045/051/052 (məzmun növü nümunələri), Figma `2663:138955`,
`product-host/visitor/config/rules.php`, test bazasının dump-ı `schema-new/cbar-schema-and-data-20260914.sql` (səhifə 133/479).

## R1 — Məlumat forması: tipli cədvəllər, tək qeyd + iki siyahı

**Qərar**: Yeni cədvəllər: `fincert_settings` (tək sətir, `id = 1` CHECK) + `fincert_setting_translations`; `fincert_directions` +
`fincert_direction_translations`; `fincert_memberships` + `fincert_membership_translations`. Migration `0036-fincert.sql`.

**Səbəb**: Hər sahə tipli və yoxlanılan olur (e-poçt, URL, media FK). `api-cbar` digər məzmun növləri kimi `cbar_web_ro` ilə oxuyur. İkidillilik
`*_translations (entity_id, locale)` qaydasıdır (Konstitusiya V.3). Mövcud cədvəllərə `ALTER` yoxdur.

**Rədd edilən**: (a) `settings` key/jsonb cədvəli: tip və FK yoxdur, media silinəndə səssiz qırılır, `api-cbar` jsonb-ni parse etməli olur.
(b) Ümumi "bloklu səhifə" qurucusu: tək səhifə üçün böyük əhatə (spec Assumptions). (c) Redaktor işarələməsi (spec 047 yolu): istifadəçi rədd etdi.

## R2 — Dil üzrə görünürlük: tərcümənin olması, `ShowAz/ShowEn` yox

**Qərar**: İstiqamət və üzvlük həmin dildə başlığı/adı (istiqamətdə həm də mətni) doludursa görünür (FAQ, spec 051 qaydası). Ümumi qeydin
sahələri bölmə-bölmə yoxlanılır: missiya boşdursa Missiya bölməsi yoxdur və s.

**Səbəb**: Redaktor üçün bir qayda: "en-də göstərmək istəmirsənsə, en mətnini boş burax". Ayrıca bayraq ikinci həqiqət mənbəyi olardı.

**Rədd edilən**: IFI kimi `ShowAz/ShowEn` bayraqları: tərcümə boş, bayraq açıq olan yarımçıq vəziyyət yaradır.

## R3 — Saytda yönləndirmə: FAQ nümunəsi (səhifə 133 başlıq və ünvan verir)

**Qərar**: `entities/page-node` `FINCERT_SLUG = { az: 'fincert', en: 'fincert' }` + `isFincertSlug`. `[...slug]/page.tsx` FAQ-dan sonra
`isFincertSlug(last)` olduqda `loadFincertPage(locale, last)` çağırır. `null` (səhifə yoxdur, API xətası, bütün bölmələr boşdur) → adi
`loadCmsPage` yolu (FR-016). `generateMetadata` FinCERT üçün təsviri missiyadan götürür, yoxdursa səhifə mətnindən (bugünkü kimi).

**Səbəb**: Spec 051 ilə eyni, sınanmış axın. CMS səhifəsi başlıq, slug, dərc statusu və ağacdakı yeri (breadcrumb, footer) üçün həqiqət
mənbəyi qalır.

**Rədd edilən**: (a) Ayrıca `/fincert` route-u: CMS ağacı, dil dəyişdiricisi və köhnə ünvan məntiqi ikiləşərdi. (b) `layoutFor` / `AboutLayoutKind`:
bloklar HTML-dən qurulmur, layout guard-ı mənasızdır.

## R4 — "Bu səhifədə" bloku qurulmur

**Qərar**: Figma-da desktop "On this page" `2678:3940`, tablet "Anchors" `2685:3946`, mobil "Anchors" `2685:3983` `visible: false`-dır. İstifadəçi
(2026-11-18) görünən dizaynı seçdi. Bölmələr `<section id="…" aria-labelledby="…">`-dir, sabit ankerlər (`data-model.md`), `scroll-margin-top`
saytın yapışqan header hündürlüyü ilə.

**Səbəb**: Görünən Figma həqiqətdir. Scroll-spy üçün client JS lazım olmur, səhifə tam server komponenti qalır.

**Rədd edilən**: Gizli qatı qurmaq (istifadəçi rədd etdi).

## R5 — İstiqamət akkordionu: native `<details>`, nömrə sıradan

**Qərar**: Hər istiqamət `<details data-accordion>` + `<summary>` (nömrə dairəsi, başlıq, ox ikonu). Hamısı bağlı gəlir, müstəqil açılır, çapda
`data-accordion` ilə açıq çap olunur (spec 044 `ifi-organization-card` nümunəsi). `<details>`-də `gap` yox, gövdəyə `mt` (spec 044 Chrome qeydi).
Nömrə görünən siyahıdakı indeks + 1-dir, bazada saxlanılmır.

**Səbəb**: JS-siz işləyir, klaviatura və ekran oxuyucusu üçün platforma semantikası. Kit `Accordion` client komponenti 4 element üçün lazımsız
hidratasiyadır.

**Rədd edilən**: Kit `Accordion` (client sərhədi, JS-siz açılmır); `name=` atributlu eksklüziv `<details>` (Figma bir neçəsinin açıq ola bilməsini
qadağan etmir, spec 044 ilə uyğunluq).

## R6 — İstiqamət mətni: panelin rich-text redaktoru, saytda `cms-content`

**Qərar**: Admin formada mətn üçün mövcud `RichTextEditor` (TipTap; yeni extension yoxdur). Saytda gövdə `prepareCmsHtml` ilə hazırlanır və yalnız
`widgets/cms-content` ilə render olunur (tək HTML sink). Figma-dakı siyahı nöqtəsi (6 px, `primary`) və 16/26 mətn `cms-content`-ə FinCERT
variantı kimi (`data-variant="fincert"` və ya wrapper class) verilir, `cms-content.css`-də.

**Səbəb**: Mətndə paraqraf + siyahı + qalın + link var (köhnə mətn). Redaktor eyni redaktoru tanıyır. HTML sink qaydası pozulmur.

**Rədd edilən**: (a) Sadə mətn + "bəndlər" siyahısı (struktur): köhnə mətnin iki paraqraf + siyahı + paraqraf formasını əks etdirmir. (b) İkinci
`dangerouslySetInnerHTML`: layihə qaydası.

**Roundtrip**: redaktora extension əlavə/silinmir, `npm run roundtrip` dəyişmir. Yenə də admin MR-da işlədilir (CLAUDE.md qaydası).

## R7 — Əlaqə, portal, RFC, üzvlük kartları

**Qərar**:
- E-poçt kartı `mailto:`; telefon `tel:` + yalnız rəqəmlər və `+` (`(+994 12) 437 00 97` → `tel:+994124370097`); dəyər yazıldığı kimi göstərilir.
- Portal düyməsi kit `Button asChild` + `<a target="_blank" rel="noopener noreferrer">`, mətn "Portala keçid" (i18n), xarici link ikonu.
- RFC kartı: başlıq "RFC-2350" (i18n — sənədin adı Figma-da bölmə başlığı ilə eynidir), fayl növü nişanı media faylının `mimeType`-dan, xarici
  linkdə ünvanın uzantısından (`.pdf` → PDF; tanınmırsa nişan yoxdur). Mövcud fayl nişanı köməkçisi varsa o işlədilir. Bütün kart bir `<a>`-dır
  (Card-as-link): media → `/media/{id}` `download`, xarici link → `target="_blank" rel="noopener noreferrer"`.
- Üzvlük kartı: loqo `SiteImage` (spec 036), ad, təsvir, nişan; `url` varsa bütün kart xarici link.
- İkonlar yalnız `@cbar/lib-react-ui-kit/icons`-dandır (e-poçt, telefon, monitor/portal, endirmə, xarici link). Uyğun ikonun adı tapşırıqda
  `references/icons.md`-dən seçilir.

**Səbəb**: Bir fokus nöqtəsi olan kartlar (spec 051 keçid kartı nümunəsi). Kit ikon dili, ikon paketi yox.

## R8 — Admin bölməsi: üç tab, iki CRUD modulu + bir forma

**Qərar**: Sidebar bəndi `fincert` (`/fincert`, `ShieldIcon` və ya kitdə uyğun ikon), yeni `NavGroup` `fincert` — tək ekranlı qrup olduğu üçün
başlıqsız bənd kimi görünür (spec 046 qaydası). Yer: `faq`-dan sonra, `homepage`-dən əvvəl (saytda FinCERT də FAQ kimi kök səhifədir).
Ekranlar `SectionTabs` ilə (spec 051 FAQ tabları kimi):
- `/fincert` — "Ümumi": xüsusi RHF + Zod forması (CRUD deyil, tək qeyd), az/en tabları, media seçici (RFC faylı).
- `/fincert/directions` — "Fəaliyyət istiqamətləri": `ModuleConfig` (`CrudListPage`/`CrudFormPage`), "Sıranı dəyiş" (`SortableList` dialoqu).
- `/fincert/memberships` — "Beynəlxalq üzvlüklər": `ModuleConfig`, loqo media seçicisi, "Sıranı dəyiş".

**Səbəb**: Tək qeyd CRUD şablonuna sığmır (siyahı yoxdur). Siyahılar standart şablondadır (Duplicate Code qaçılır). `/fincert` prefiksi
`isNavItemActive` ilə alt route-ları da aktiv edir.

**Rədd edilən**: Hər şeyi bir uzun formada (siyahıları formanın içində): sıralama və silmə üçün ikinci CRUD yazmaq olardı.

## R9 — Sol menyu aktivliyi idarə olunan səhifənin formasında

**Qərar**: `shared/model/ui-store` yeni sahə: `activeNavOverride: string | null` + `setActiveNavOverride`. Səhifə formu (`features/pages`) səhifə
yüklənəndən sonra `managedSectionFor(slug)` `kind: 'link'` qaytarırsa, `item` açarını (`nav` namespace açarı = `NavKey`) yazır, unmount-da və
slug dəyişəndə təmizləyir. `app/routes/nav.ts`-də `activeNavKey(pathname, override)`: override məlum `NavKey`-dirsə o, yoxsa route uyğunluğu.
Sidebar (həm desktop, həm mobil `Sheet` — eyni komponent) aktiv bəndi və açıq qrupu ondan hesablayır. `document.title` və breadcrumb dəyişmir
(ekran hələ də səhifə formasıdır).

**Səbəb**: Slug yalnız səhifə yüklənəndən sonra bilinir, ona görə route-dan hesablana bilməz. Mövcud Zustand UI store (açıq qruplar) artıq
paylaşılan client state yeridir (frontend-standards: paylaşılan client = Zustand). `features → shared` importu FSD-yə uyğundur; `app` layer
store-u oxuyur. Yeni idarə olunan səhifə yalnız `MANAGED_SECTIONS`-ə sətir əlavə etməklə bu davranışı alır (spec Assumption).

**Rədd edilən**: (a) URL parametri `?section=`: ünvanı çirkləndirir, birbaşa açılışda yoxdur. (b) Route `staticData`: slug-dan asılıdır, statik
deyil. (c) React context: sidebar route ağacından kənardadır (shell), store-a ehtiyac yenə də var.

**Kənar hallar**: "(Kopya)" slug-ı `managedSectionFor` artıq `-copy` suffiksini atır. `kind: 'note'` (554) override yazmır. Səhifə yüklənərkən
(slug bilinmir) "Səhifələr" aktiv qalır, sonra keçir — layout effekti ilə qrup açılır (mövcud `useLayoutEffect` nümunəsi).

## R10 — Köçürmə (seed `0037-fincert-seed.sql`): ədəbi dəyərlər, köhnə mətndən çıxarılmış

**Qərar**: Köhnə mətn sabit və məlumdur (dump-dakı səhifə 133 az/en). Mətnlər bir dəfə çıxarılır (`specs/053-fincert-page/seed/extract.mjs`
test API-dən `GET /api/v1/pages/fincert?locale=` oxuyur, `fincert-az.json`/`fincert-en.json` yazır, `build-seed.mjs` SQL qurur — spec 051 R9
alətləri kimi) və `0037`-yə ədəbi dəyər kimi yazılır. Seed bir `DO` blokudur və yalnız bu halda işləyir: az slug-ı `fincert` olan səhifə var
**və** `fincert_settings`, `fincert_directions`, `fincert_memberships` boşdur (silinmişlər daxil).

Çıxarma qaydaları:
- Missiya: az "FinCERT-in missiyası" başlığından sonrakı paraqrafın "Bu məqsədlə …" cümləsindən əvvəlki hissəsi (Figma mətni ilə eyni); en
  `h2`-dən sonrakı paraqrafın "To this end …"-dan əvvəlki hissəsi.
- İstiqamətlər: az — bir bəndli `<ol><li><strong>` başlıqları, gövdə növbəti belə başlığa qədər; ilk 4 (sonrakılar "Əlaqə", "Portal", "RFC");
  en — `h3` "1."–"4.", nömrə prefiksi atılır. Gövdə HTML olduğu kimi qalır (paraqraf, `ul`).
- E-poçt `fincert@cbar.az`, telefon Figma formasında `(+994 12) 437 00 97`, portal ünvanı `https://portal.e-cbar.az/`.
- Portal başlığı/təsviri: az Figma mətni ("Vahid Elektron Hesabatlılıq Portalı", "Yüksək kateqoriyalı insidentlər üzrə hesabatlar nəzarət
  subyektləri tərəfindən Mərkəzi Banka bu portal vasitəsilə göndərilir."); en köhnə en mətnindən ("Unified Electronic Reporting Portal", "…").
- RFC faylı: köhnə mətn `uploads.cbar.az/assets/<ad>.pdf` linkidir (az `f7322827bd3688a2be3136204.pdf`, en `02c3d655e376515419c623ce2.pdf`).
  Test API-də (2026-11-18) səhifə 133-ün `assets` siyahısı hər iki dildə boşdur, yəni fayl media kitabxanasında deyil. Ona görə RFC dil üzrə
  **media faylı və ya xarici link** saxlayır (`rfc_media_id`, `rfc_url`; ikisi də ola bilər, media üstündür). Seed `media_assets`-də
  `original_name = <ad>` olan silinməmiş faylı axtarır: tapılırsa `rfc_media_id`, tapılmırsa köhnə linki `rfc_url`-ə yazır. Deploy günü RFC
  bölməsi itmir (paritet). Redaktor faylı yükləyəndə media üstün olur (təlimatda yazılır).
- FIRST üzvlüyü: az Figma mətni (ad, təsvir, nişan), en qaralama ("Forum of Incident Response and Security Teams", "International forum of incident
  response and security teams", "Full member since 2026"), `url` `https://www.first.org/`, loqo `NULL`, status `published`.
- "FinCERT (Kopya)" (`fincert-copy`): `page_details.show_in_side_nav = false` (INSERT … ON CONFLICT DO UPDATE, 0030 nümunəsi). Spec 048-ə görə
  kökdən aşağıda bu bayraq açılan menyulardan da çıxarır. Səhifə silinmir.
- Səhifə mətnləri dəyişmir (fallback, FR-021).

**Səbəb**: Deterministik, PGlite-də yoxlanılan, mühitdən asılı olmayan SQL. Mətni SQL-də parse etmək (0035 kimi regex) az mətnin qeyri-standart
formasında (`<strong>` parçalanmış "Y"+"üksək") kövrəkdir.

**Rədd edilən**: SQL-də HTML parse (kövrək); seed-siz deploy (redaktor iki dildə 4 istiqaməti əllə yazmalı olardı).

## R11 — Köhnə ünvan

**Qərar**: `src/proxy.ts` `LEGACY_FINCERT_PAGE = /^\/(?:(az|en)\/)?page-893(?:\/.*)?$/i` → `/${legacyLocale}/fincert` (308), FAQ-ın `page-131`
qaydası kimi. Köhnə qayda `page-<id>/<slug>` (`product-host/visitor/config/rules.php:13`), FinCERT-in köhnə id-si 893
(`api-cbar-admin/scripts/seed_sections.py:255`).

**Rədd edilən**: Ümumi `page-N` → slug xəritəsi: bu spec-in əhatəsindən kənardır (ayrıca miqrasiya işi).

## R12 — API endpoint-ləri, icazələr, audit

**Qərar**: Admin: `GET|PUT /api/v1/fincert/settings`; `/api/v1/fincert/directions` CRUD + `PUT …/order`; `/api/v1/fincert/memberships` CRUD +
`PUT …/order`. İcazələr `fincert.read|create|update|delete` (`moderator` rolu, 0034 nümunəsi, `INSERT` icazəsi yoxdursa xəbərdarlıq). Audit
`fincert.settings_update`, `fincert.direction_*`, `fincert.membership_*`. Public: `GET /api/v1/fincert?locale=` bir cavabla hamısı. Spec-first:
hər iki API-nin `openapi/paths/fincert.yaml` əvvəl, `/api-endpoint` skill axını, hook route-ları yoxlayır.

**Səbəb**: Spec 051/052 ilə eyni forma; bir səhifə = bir public sorğu.

## R13 — Sabitlər, i18n, rənglər

**Qərar**: Sayt: `features/fincert/model/constants.ts` (anker id-ləri, nömrə ölçüləri deyil — Tailwind dəyərləri qaydadan kənardır),
`locales/{az,en}/fincert.json` (bölmə başlıqları, kart etiketləri, "Portala keçid", "Endir" aria). Rənglər: `#222222` → `text-foreground`,
`#004976` → `primary`, `#787878`/`#a3a3a3` → `muted-foreground` variantları, `#e5e5e5`/`#d4d4d4` → `border`, `#e6eef4` (nömrə dairəsi, ikon fonu)
və `#f5f5f5` → mövcud `--site-*` token varsa o, yoxdursa `--site-fincert-*` (spec 047 `--site-literacy-*` nümunəsi), `#c74040` PDF nişanı →
mövcud fayl nişanı tokeni. Admin: `locales/{az,en}/fincert.json`, `nav.json` (`fincert.label`, `groups.fincert`).

**Səbəb**: Spec 032 sabit standartı və ui-kit-usage qayda 5 (semantik rənglər).
