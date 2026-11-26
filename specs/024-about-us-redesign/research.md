# Research: "Haqqımızda" bölməsinin Figma dizaynına keçidi

**Tarix**: 2026-10-14 | **Spec**: [spec.md](./spec.md)

Bütün faktlar 2026-10-14-də ölçülüb: Figma körpüsü (`tools/figma-bridge/out/about-*.json`),
test API (`https://api-cbar-test.cbar.az`), `web-cbar-new` və `web-cbar-admin-new` kodu.

## R1 — CMS redaktoru hansı markup-ı qoruyur

**Fakt**: `web-cbar-admin-new/src/features/rich-text/model/extensions.ts` extension siyahısı:
StarterKit (p, h1–h6, ul/ol/li, blockquote, hr, br, strong/em/s/u/code, codeBlock), `MediaLink`
(`<a>` + `data-media-link`), `<details data-accordion>` + `<summary>` +
`<div data-type="details-content">`, TableKit (`table/colgroup/tbody/tr/th/td`, hücrədə blok
məzmun), inline `Image` (`src`, `alt`, `title`, `width`, `height`), Youtube, ümumi `<iframe>`,
TextAlign (`style="text-align"` yalnız p/h), TextStyleKit (`<span style>` rəng/fon/font).

**Nəticə**: istənilən elementdəki `class` və (yuxarıdakılardan başqa) `data-*` atributu
redaktor açılıb saxlananda **səssizcə silinir**. Spec FR-007 buna görədir.

**Decision**: razılaşdırılmış formalar yalnız bunlardan qurulur: `table`, `blockquote`,
`details`, `h2`/`h3`, "yalnız qalın mətndən ibarət paraqraf", `img`, `strong`. Tam kontrakt:
[contracts/cms-markup.md](./contracts/cms-markup.md).

**Alternatives considered**:

- `class="timeline"` və ya `data-block="…"`: TipTap silir. Rədd edildi.
- Mətn shortcode-u (`[timeline]…[/timeline]`): forma tanınmayanda (FR-008) shortcode ziyarətçiyə
  görünür, redaktorda da səhvə açıqdır. Rədd edildi.
- Admin paneldə yeni TipTap extension-ları (`timelineEvent` node və s.): `web-cbar-admin-new`
  dəyişir, istifadəçi qərarı (backend/admin dəyişmir) ilə ziddir. Gələcək spec üçün qeyd olunur.

## R2 — Hansı səhifəyə hansı layout

**Decision**: layout **səhifə slug-ı ilə** seçilir, sabit reyestrdə (`features/about-content/model/layouts.ts`):

| Layout | az slug | en slug |
|---|---|---|
| `about-main` | `haqqimizda`, `haqqimizda-copy` | `about-us`, `about-us-copy` |
| `history` | `tarixi`, `tarix-copy` | `history`, `history-copy` |
| `mission` | `missiya-ve-deyerler`, `missiya-ve-deyerler-copy` | `mission-and-values`, `mission-and-values-copy` |

Qalan "Haqqımızda" səhifələri (Komitə, Təşkilati struktur, Əlaqə) `plain` layout-dadır: ümumi
şablon + Figma tipoqrafiyası. `-copy` slug-ları qəsdən daxildir: "Haqqımızda (Kopya)" ağacı
redaktorlara məzmunu canlı səhifəyə toxunmadan yeni formada hazırlamaq imkanı verir.

**Rationale**: `shell/nav.ts`-dəki `FEATURE_ROUTES` ilə eyni üsul (slug → davranış). Proqnoz
edilə bilir: başqa bölmədəki cədvəl heç vaxt timeline-a çevrilmir.

**Alternatives considered**:

- Bütün CMS səhifələrində formanı avtomatik tanımaq: başqa bölmələrdə yüzlərlə legacy cədvəl var,
  yanlış tanınma riski. Rədd edildi.
- CMS-də "şablon" sahəsi: backend dəyişikliyi. Rədd edildi (istifadəçi qərarı).

## R3 — HTML-i DOM-suz necə bölmək

**Fakt**: `shared/lib/cms-html.ts` regex əsaslı, DOM-suzdur ("serverdə `DOMParser` yoxdur,
sanitizasiya kitabxanası gətirilmir"). Runtime dependency-lər arasında HTML parser yoxdur.
TipTap çıxışı normallaşdırılmışdır: hər element bağlanır, atributlar `"…"` içindədir, yuxarı
səviyyə blok elementlər ardıcıllığıdır.

**Decision**: `shared/lib/html-blocks.ts` — kiçik, asılılıqsız tokenizer. `<tag …>` / `</tag>`
/ void elementlər (`img`, `br`, `hr`, `col`) üzrə dərinlik sayaraq HTML-i **dayaz ağaca**
(`{ tag, attrs, inner, outer, children }`) bölür. Yalnız lazım olan səviyyələrə enir: yuxarı
səviyyə bloklar, `table → tr → td/th`, `blockquote`, `details`. Balanssız teq və ya
gözlənilməz quruluş `null` qaytarır və layout `plain`-ə düşür (FR-008). Mətnə toxunmur.
Şərhlər (`<!-- -->`) və `<script>` artıq `prepareCmsHtml` ilə silinmiş olur.

**Rationale**: Maddə II (yeni runtime dependency yalnız spec ilə) və mövcud DOM-suz yanaşma ilə
uyğundur. Giriş redaktorun nəzarətindədir və normallaşdırılmışdır. Tam HTML parser lazım deyil.

**Alternatives considered**:

- `htmlparser2` / `parse5`: düzgün, amma yeni dependency, `npm audit` səthi, bu iş üçün artıqdır.
  Tokenizer test fikstürlərində (real test-mühit HTML-i) uğursuz olsa yenidən baxılır.
- Brauzerdə `DOMParser`: SSR və JS-siz render pozulur. Rədd edildi.

## R4 — Strukturlu blokların təhlükəsiz render-i

**Decision**: sıra `prepareCmsHtml(html)` → `splitBlocks()` → view model. Sanitizasiya **bir
dəfə, bölmədən əvvəl** olur. Hər fraqment (hücrə mətni, accordion gövdəsi, dəyər mətni) view-da
`<CmsContent html>` ilə render olunur. `dangerouslySetInnerHTML` yalnız `widgets/cms-content`-də
qalır (D2, CLAUDE.md). Strukturlu sahələr (il, tarix, başlıq mətni, şəkil `src`) düz mətn kimi
çıxarılır və React-in escaping-i ilə göstərilir. Şəkil `src`-i yalnız `/media/` və ya `https:`
olarsa qəbul olunur (Maddə X.1).

**Alternatives considered**: hər fraqmenti ayrıca sanitizasiya etmək. Lazımsız iş, bir dəfə
kifayətdir və idempotentdir.

## R5 — Ümumi şablon harada yaşayır

**Fakt**: `widgets/section-sidebar` bütün CMS bölmələrində istifadə olunur (`max-lg:hidden`,
`w-80`, mavi başlıq). Figma "subcategories" yalnız About üçün çəkilib.

**Decision**: yeni `widgets/about-shell/` (server komponenti):

- `AboutShell` — breadcrumb + paylaşma sırası, sol menyu, məzmun slotu. Desktop-da 312 + 24 + 984
  grid. `tab`-dan `desk`-ə qədər və mobildə alt-alta: alətlər, menyu, başlıq, məzmun (Figma
  `1345:24722`, `1342:22407`).
- `AboutNav` — "subcategories" (16/600 üst səviyyə, 14/400 `#787878` alt səviyyə, caret,
  `bg-site-surface-muted`, r4, p20). Aktiv zəncir açıq qalır. `SectionSidebar`-ın `markChain`
  məntiqi `entities/page-node`-a çıxarılır və hər ikisi onu işlədir.
- `PageTools` — kit `Breadcrumb` + `ShareButtons`.

`CmsPageView` bölmə kökü "Haqqımızda" olanda `AboutShell`-i işlədir. `OrganizationView`,
`StaffMemberView` və yeni `DivisionView` həmişə onu işlədir. Digər bölmələr dəyişmir.

**Alternatives considered**: `SectionSidebar`-ı hər yerdə yeni dizayna keçirmək. Figma digər
bölmələri əhatə etmir və onları yoxlamaq bu spec-in işi deyil. Sonradan `AboutNav` ümumiləşdirilə
bilər.

## R6 — Breadcrumb mənbəyi

**Decision**: `entities/page-node`-a `findChainByHref(tree, href)` əlavə olunur (`navUrl`
uyğunluğu, `?section=` daxil). Zəncir: "Ana səhifə" (i18n) → CMS zənciri → (əməkdaş və ya şöbə
adı). Son element `<span aria-current="page">`-dir. Kit `Breadcrumb` subpath importu.
Ayırıcı Figma `Caret right` 16px ikonudur.

## R7 — Paylaşma düymələri

**Decision**: `widgets/about-shell/share-buttons.tsx`. Facebook
(`https://www.facebook.com/sharer/sharer.php?u=`), LinkedIn
(`https://www.linkedin.com/sharing/share-offsite/?url=`), WhatsApp (`https://wa.me/?text=`),
e-poçt (`mailto:?subject=&body=`) adi `<a target="_blank" rel="noopener noreferrer">`-dir və
serverdə render olunur. Tam ünvan loader-də `headers()`-dən (`x-forwarded-proto`,
`x-forwarded-host` / `host`) və pathname-dən qurulur. Çap düyməsi yeganə client hissədir
(`print-button.tsx`, `'use client'`, `window.print()` klikdə). JS söndürüləndə gizlənir
(`<noscript>`-siz: düymə `hidden` ilə render olunur, effekt onu göstərir).

**Rationale**: kənar SDK/skript yoxdur (Maddə X.4), CSP dəyişmir. İkonlar kit `icons`-dandır.
Kitdə brend ikonu yoxdursa (Facebook, LinkedIn, WhatsApp) statik SVG `public/site/icons/`-da
saxlanılır (spec 022-dəki footer sosial ikonları kimi).

## R8 — Tarix il naviqasiyası

**Decision**: serverdə render olunan `<nav>` + `<a href="#year-1919">` linkləri. Hər ilin ilk
hadisəsi `id="year-{yyyy}"` alır. Desktop-da sağ sütun `position: sticky`, planşet/mobildə
timeline üstündə üfüqi sürüşən sıra (`overflow-x-auto`, Figma `Chronology navigation`).
Aktiv ilin izlənməsi kiçik client komponentidir (`year-nav-spy.tsx`, `IntersectionObserver`,
yalnız `aria-current` və vurğu dəyişir). JS-siz linklər işləyir (US3 #6). `scroll-margin-top`
yapışqan header-in hündürlüyü qədərdir.

## R9 — İdarə Heyəti üçün hansı Figma variantı

**Fakt**: iki variant var. `1148:13724`-də "Sədr" və "Sədr müavinləri" başlıqları və üfüqi sədr
kartı (`management` Default, 984×248) var. `1189:15956` (sonra çəkilib) mərkəzdə 424×378 sədr
kartı və başlıqsız şəbəkədir. Hər iki variantda kartlarda kölgə var.

**Decision** (istifadəçi təsdiqi, 2026-10-14): vizual olaraq `1189:15956`. "Sədr" və "Sədr
müavinləri" `h2`-ləri ekran oxuyucu üçün qalır (`sr-only`), FR-012 və başlıq iyerarxiyası
(FR-022) qorunur. `1148:13724` istifadə olunmur.

## R10 — Struktur bölmələr, şöbə səhifəsi

**Fakt**: `struktur-bolmeler` CMS səhifəsi mövcuddur (`content: null`, `assets: []`). Ağac
qovşağının `navUrl`-u `/organization?section=divisions`-dır. Şöbə açıqlaması HTML-dir
(`<p> Direktor: <span>…</span></p>`). 42 şöbə, ayrıca endpoint yoxdur.

**Decision**:

- `section=divisions` olanda loader ağacda `navUrl`-u bu bölməyə uyğun qovşağı tapır, onun
  slug-ı ilə `getPage` çağırır (bir əlavə sorğu, SC-007). `content` sxem/qeyd kimi, `assets`
  Figma fayl sətirləri kimi şöbə siyahısının üstündə göstərilir. Səhifə yoxdursa və ya boşdursa
  hissə gizlənir. Sxem şəkli `<a href={src} target="_blank">` ilə sarılır (US5 #2).
- Şöbə siyahısı kart-linklərdir. Yeni route `/[locale]/organization/divisions/[id]`. Loader
  `cache()` ilə sarılmış `getDivisions` siyahısından `id`-ni tapır, tapmayanda `notFound()`.
  Açıqlama HTML-i Figma məlumat kartında (`border-site-divider`, p24) `CmsContent` ilə göstərilir.
- "Son yenilənmə" avtomatik deyil. Redaktor CMS mətnində yazırsa adi mətn kimi göstərilir.

**Alternatives considered**: şöbələri accordion kimi göstərmək (detal səhifəsiz). Figma-da
şöbə səhifəsi var (`996:9576`), rədd edildi.

## R11 — Rənglər

**Fakt**: About frame-lərindəki rənglərin çoxu kitin primitivlərində eyni hex ilə var:
`#004976` brand-500, `#D6EAF4` brand-100, `#E9FAF7` secondary-50, `#4BC7B5` secondary-500,
`#00857C` secondary-700, `#222` neutral-800, `#333` neutral-700, `#787878` neutral-500,
`#D4D4D4` neutral-300, `#E5E5E5` neutral-200, `#F0F0F0` neutral-100. `#F5F5F5` artıq
`--site-surface-muted` (022, D-2) kimi var.

**Decision**: kitdə olmayan 4 dəyər ən yaxın primitivə bağlanır, **yeni D-2 literalı yoxdur**:

| Figma | Harada | Token |
|---|---|---|
| `#3FC1A5` | timeline xətti | secondary-500 `#4BC7B5` |
| `#E8F7F3` | dəyər ikonunun fonu | secondary-50 `#E9FAF7` |
| `#727271` | foto yer tutucusu | neutral-500 `#787878` |
| gradient `#0B4A7A → #052642` | Tarix hero kartı | brand-500 → brand-800 `#002A4A` |

Hero kartın Figma "Clip path group"-ları SVG exportuna düşmür (2026-10-14 yoxlanılıb), kart
yalnız gradientdir, statik asset lazım deyil. Hero mətni Figma-da **Lora** şriftindədir, "mərkəzi
bankçılıq" hissəsi kursiv `#43B7A7` (site-accent-strong). Əvvəl DM Sans-da saxlanılmışdı (022);
2026-10-23-dən Lora self-host olunur (`public/fonts/lora/`, `@fontsource-variable/lora` 5.3.0,
OFL; `fonts.css` + `--font-serif`) və yalnız bu başlıqda işlənir — CSP `font-src 'self'` dəyişmir.
Vurğu hissəsi redaktorun `<em>`-i ilə verilir (kontrakt §3), italik ayrıca fayldır.

**Kit ikonları (2026-10-14 yoxlanılıb)**: `FacebookIcon`, `LinkedinIcon`, `WhatsappIcon`,
`EnvelopeIcon`, `PrinterIcon`, `CalendarIcon`, `PhoneIcon`, `CaretRightIcon` kitdə var, statik
brend SVG-si lazım deyil.

Kart kölgəsi (Figma `0 4px 30px rgba(0,0,0,.05)`) kitin `--ui-shadow-md`-sidir.

**İstifadəçi qərarı (2026-10-14)**: kitə və D-2-yə dəyişiklik edilmir. Bu rəng və kölgə fərqləri
`visual-diff.md`-də qəbul edilmiş fərq kimi qeyd olunur. Kit sonra yenilənsə yalnız site
token-lərinin dəyəri dəyişir.

**Alternatives considered**: D-2-ni 4 rəng + 1 kölgə literalı ilə genişləndirmək. İstifadəçi
tərəfindən rədd edildi.

## R12 — Çap

**Decision**: `@media print` qaydası (`globals.css`-in route B blokundan sonra): header, footer,
`AboutNav`, `PageTools`, il naviqasiyası gizlənir. Məzmun tam enlidir, accordion-lar açıq
çap olunur (`details` üçün `[open]` print-də məcburi deyil, ona görə gövdə `display:block`).

## R13 — URL və paritet

Mövcud ünvanların heç biri dəyişmir. Yeganə yeni ünvan
`/{locale}/organization/divisions/{id}`-dir (köhnə saytda şöbələr struktur səhifəsində inline
idi, `product-host/visitor/views/structure`). `proxy.ts` `legacyRedirect()` dəyişmir.

## R14 — Redaktor təlimatı (FR-009)

**Decision**: `product-rest/web-cbar-new/docs/about-cms-guide.md` (azərbaycanca, nümunələrlə,
admin paneldə hansı düymə ilə edildiyi). Mənbə kontrakt
[contracts/cms-markup.md](./contracts/cms-markup.md)-dir, təlimat onu redaktor dilinə çevirir.
Hazırlıq "Haqqımızda (Kopya)" səhifələrində edilir (R2).

## R15 — Roundtrip sübutu (SC-003)

**Decision**: `web-cbar-admin-new` kodu dəyişmir. Sübut iki addımdır:

1. Kontraktın nümunə HTML-i (`contracts/cms-markup.md` §6) admin panelin mövcud
   `roundtrip.test.ts` mexanizmi ilə yoxlanılır: müvəqqəti fikstür lokal işlədilir, commit
   olunmur. Nəticə quickstart-da qeyd olunur.
2. Redaktor test mühitində "(Kopya)" səhifələrini doldurandan sonra
   `npm run roundtrip -- "Haqqımızda (Kopya)" "Tarix (Kopya)" "Missiya və dəyərlər (Kopya)"`.

Nümunələrin admin `roundtrip.test.ts` fikstürlərinə daimi əlavəsi ayrıca kiçik MR kimi
tövsiyə olunur (`web-cbar-admin-new`), bu spec-in əhatəsindən kənardadır.
