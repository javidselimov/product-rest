# Research: "Tarix" səhifəsinin interaktiv dizaynı

**Tarix**: 2026-10-22 | **Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Hər bölmə: **Qərar** → **Səbəb** → **Rədd edilən alternativlər**. Ölçmələr test mühitindən
(`https://api-cbar-test.cbar.az`), Figma bridge-dən və `tarix.html` prototipindən götürülüb
(2026-10-22).

---

## R1 — Mövcud data modeli yetərlidirmi?

**Qərar**: Bəli. 024-ün `parseHistory` / `timelineEvent` funksiyaları dəyişmədən qalır. Onların
üstünə iki təmiz addım əlavə olunur: **il üzrə qruplaşdırma** (R3) və **foto düzülüşü** (R4).
`TimelineEvent`-ə `photoLayout` sahəsi əlavə edilir. `timeline` bloku `events` + `years`
əvəzinə `years: HistoryYear[]` daşıyır (data-model §2).

**Səbəb**: Prototipin `YEARS` massivindəki hər sahənin (`date`, `title`, `text`, `photos`)
024 parse çıxışında qarşılığı var: `dayMonth`, `title`, `html`, `images`. Fərq yalnız
qruplaşdırmadadır: prototip il → hadisələr, 024 isə düz hadisə siyahısı verir.

**Rədd edilən**: Prototipdəki kimi ayrıca JSON mənbəyi (API sahəsi və ya statik fayl). Spec
backend dəyişikliyini istisna edir, redaktor isə məzmunu CMS-də idarə etməlidir (SC-007).

---

## R2 — Layout reyestri: test mühitindəki slug-lar

**Ölçmə** (`/api/v1/pages/tree`, 2026-10-22):

| Dil | Səhifə | Slug | 024 reyestrində |
|---|---|---|---|
| az | Tarix (əsas) | `tarix` | ❌ (`tarixi` yazılıb, belə səhifə yoxdur, 404) |
| az | Tarix (Kopya) | `tarix-copy` | ✅ |
| az | Haqqımızda (Kopya) | **`history-copy`** | ⚠️ `history` layout-u alır, halbuki `about-main` olmalıdır |
| en | History | `history` | ✅ (məzmunu cədvəl deyil → `plain`) |
| en | History (copy) | `history-copy-2` | ❌ |

**Qərar**: `layoutFor(slug)` → `layoutFor(slug, locale)`. Reyestr dil üzrə ayrılır:
`az: { tarix, tarixi, tarix-copy, … }`, `en: { history, history-copy, … }`. Belə olanda az
`history-copy` slug-ı ("Haqqımızda (Kopya)") artıq `history` layout-u almır. `tarixi`
köhnə/legacy slug kimi saxlanılır. `history-copy-2` reyestrə **əlavə edilmir**.

**Səbəb**: FR-022 əsas səhifəni də əhatə edir, az əsas səhifəsinin slug-ı isə `tarix`-dir.
Dilsiz reyestrdə bir dilin slug-ı başqa dilin layout-unu "oğurlayır". Bunu test datası
göstərdi. `-2` sonluğu `UniqueSlug`-ın toqquşmadan sonra verdiyi təsadüfi addır. Onu koda
yazmaq kövrəkdir, düzgün həll redaktorun slug-ı `history-copy`-yə dəyişməsidir (quickstart §0).

**Rədd edilən**:
- Layout-u slug yox, səhifə id-si ilə seçmək: id-lər mühitdən mühitə fərqlidir.
- CMS-də "layout" sahəsi: backend dəyişikliyi tələb edir, spec bunu istisna edir.

---

## R3 — İllərin qruplaşdırılması və ilsiz sətirlər

**Qərar**: `groupByYear(events)` saf funksiyası `HistoryYear[]` qaytarır:

- İllər **cədvəldə ilk rast gəlindiyi sıra ilə** düzülür (FR-002). Eyni ilin ardıcıl olmayan
  sətirləri ilk rast gəlindiyi qrupa yığılır.
- İlsiz (`loose`) sətir **əvvəlki** hadisənin ilinə, həmin ilin hadisələri arasında öz yerində
  markersiz əlavə olunur. Cədvəl ilsiz sətirlə başlayırsa, o sətir birinci ilin əvvəlinə düşür
  (Edge Cases).
- Hər ilin `anchorId`-si `year-{yyyy}`-dir (024 lövbərləri ilə eynidir).

**Səbəb**: Spec bunu tələb edir. Heç bir sətir itmir (WS I.3, 024 FR-008).

**Risk (test datası)**: "Tarix (Kopya)"-da 1920-dən sonra `13 fevral 2026 / ffgfgf` sınaq
sətri var. Cədvəl sırası ilə 2026 oxda **üçüncü** il olur, əsl 2026 hadisəsi (yeni bina) də
ora yığılır. Bu, kod səhvi deyil, məzmun səhvidir: redaktor sətri silməlidir (quickstart §0).
Xronoloji çeşidləmə (sort) bu səhvi gizlədərdi, amma spec sırası redaktorun ixtiyarındadır.
Lazım olsa, `/speckit-clarify` ilə dəyişdirilə bilər.

---

## R4 — Foto düzülüşü: avtomatik qayda və redaktor işarəsi

**Ölçmə**:
- Test markup-ında şəkillər `<p><img src="/media/657" alt="foto_1"></p>` formasındadır,
  `width`/`height` yoxdur.
- Admin redaktorunun TipTap `Image` extension-ı `src`, `alt`, `title`, `width`, `height`-i
  saxlayır. `TableKit` hücrəsi yalnız `colspan`, `rowspan`, `colwidth` saxlayır, `class` və
  `data-*` atılır.
- 024 kontraktı §1.1: `class` / `data-*` heç vaxt qaydaya daxil deyil.

**Qərar (avtomatik, FR-004)**:

| Şəkil sayı | Düzülüş |
|---|---|
| 1 | `single` |
| 2 | `note` |
| 3 | birinci `<img>`-də `width` və `height` var və `height > width` → `tall`; əks halda `hero2` |
| 4+ | `hero2` (birinci enli, qalanları 2 sütunlu şəbəkə) |

**Qərar (redaktor işarəsi, FR-004a)**: hadisə hücrəsində (hücrə 2) **bütün mətni**
`[foto: <ad>]` olan paraqraf. `<ad>` bunlardan biridir: `single`, `note`, `hero2`, `tall`
(böyük-kiçik hərf və boşluqlar fərq etmir). Tanınan işarə paraqrafı göstərilən HTML-dən
çıxarılır və düzülüşü təyin edir. Tanınmayan dəyər (`[foto: xyz]`) adi mətn kimi görünür, belə
ki redaktor səhvi saytda görür. Bu halda avtomatik qayda işləyir.

**Səbəb**:
- Düz mətn paraqrafı TipTap-ın hər rejimində (vizual və mənbə) yazıla bilir və roundtrip-də
  itmir. Admin panelində kod dəyişikliyi lazım deyil (spec: `web-cbar-admin-new` yalnız
  yoxlanılır).
- 024-ün "yalnız redaktorun qoruduğu elementlər" prinsipinə uyğundur.
- Şəkil ölçüsü serverdə yalnız atributdan bilinə bilər. Client-də `naturalWidth` ölçmək
  yüklənmədən sonra tərtibatın sıçramasına (CLS) səbəb olar.

**Rədd edilən**:
- Hücrəyə `class` / `data-layout`: TipTap atır.
- `<img title="tall">`: başqa məqsədli atributdur və hover tooltip-i kimi görünür.
- Media API-dən ölçü almaq: backend dəyişikliyidir.
- Client-də istiqaməti ölçüb düzülüşü sonradan dəyişmək: CLS yaradır, JS-siz fərqli nəticə verir.

---

## R5 — Server/Client bölgüsü və JS-siz fallback

**Qərar**:

- **Server** (`HistoryTimeline`): bütün illərin panellərini (kart məzmunu, şəkillər) və il
  oxunu render edir. Ox nöqtələri `<a href="#year-{yyyy}">` linkləridir, şəkillər
  `<a href="{src}" target="_blank">` içindədir. Beləcə JS olmadan da hər şey işləyir:
  linklər, tam ölçülü şəkil, çap.
- **Client island** (`HistoryStepper`, `'use client'`): server-də render olunmuş panelləri
  `panels: ReactNode[]` kimi alır (RSC → client children, serializable). Aktiv indeksi
  (`useState`) idarə edir: panelə `data-active`, ox nöqtəsinə `aria-current="step"`, irəliləmə
  xəttinə `--tl-progress`. Bunlardan əlavə "əvvəlki/növbəti" düymələri, klaviatura, swipe,
  avtomatik keçid, hash və lightbox da bu komponentdədir.
- **Görünürlük CSS ilə**: qeyri-aktiv panellər yalnız `@media (scripting: enabled)` daxilində
  gizlədilir. SSR birinci paneli `data-active` ilə verir. Nəticədə:
  - JS-siz, yəni `scripting: none` → hamısı görünür (FR-017);
  - JS-li brauzerdə hydration-dan əvvəl yalnız birinci görünür, yəni hydration-dan sonrakı
    vəziyyətlə üst-üstə düşür və yanıb-sönmə olmur;
  - `@media print` → hamısı görünür, idarəetmə gizlidir (FR-018).
- Skript tələb edən düymələr (əvvəlki/növbəti) də `scripting: enabled` ilə göstərilir.

**Səbəb**: W XI.1 ("`'use client'` ən aşağı komponentə"). Mətn ilk HTML-dədir (US6). CMS
HTML-i client bundle-a ikinci dəfə JSON kimi düşmür, panellər RSC payload-ında qalır.
`scripting` media feature-u Chrome 120, Firefox 113 və Safari 17-dən dəstəklənir. Köhnə
brauzerdə qayda tətbiq olunmur və hamısı görünür, yəni zərərsiz fallback.

**Rədd edilən**:
- Bütün `YEARS`-i client-ə JSON kimi ötürüb orada render etmək (prototip kimi): mətn ikiqat
  ötürülür, JS-siz boş səhifə alınır.
- `<html class="js">` inline skripti: nonce CSP ilə əlavə mürəkkəblik gətirir, `scripting`
  media feature-u bunu skriptsiz həll edir.
- Hydration-dan sonra gizlətmək (`useEffect`): bütün panellərin yanıb-sönməsi (CLS) olur.

---

## R6 — Hash (URL fraqmenti)

**Qərar**: Oxuma: ilk mount-da `location.hash` `#1992` və ya `#year-1992` → həmin il. Yazma:
il dəyişəndə `history.replaceState(null, '', '#1992')`. Tarixçəyə yeni addım düşmür (FR-010).
Yalnız timeline illəri tanınır, qalan hash-lərə toxunulmur.

**Səbəb**: Paylaşma linki işləyir. Next 16 `history.replaceState`-i router ilə sinxron saxlayır
(App Router native History API dəstəyi). Fraqment serverə getmir, ona görə W V matrisindəki
"URL state → searchParams" qaydası bura aid deyil. Bu, lokal state-in ünvandakı əksidir (plan
Constitution Check-də qeyd olunur). JS-siz rejimdə ox linkləri `#year-…` lövbəri ilə panelə
sürüşdürür.

**Məhdudiyyət**: `hashchange` dinlənmir. Səhifə açıq ikən ünvan sətrində hash əl ilə dəyişdirilsə,
aktiv il dəyişmir (spec Edge Cases). Səhifədə timeline-a başqa yerdən daxili link olmadığı üçün
bu, praktik ssenari deyil.

**Avtomatik keçidə təsiri**: yalnız timeline ilini göstərən hash (`#1992`, `#year-1992`) avtomatik
keçidi söndürür. `#main` kimi başqa lövbərlər söndürmür (spec FR-014).

**Rədd edilən**:
- `?year=1992` searchParam: hər keçid serverə yeni sorğu deməkdir (keşsiz səhifə), sürətli
  vərəqləmə üçün ağırdır.
- `router.replace`: eyni nəticə, amma RSC sorğusu yaradır.

---

## R7 — Avtomatik keçid (WCAG 2.2.2 sapması)

**Qərar** (FR-014, FR-015, FR-015a): 6000 ms interval. Keçid bu hallarda **heç başlamır**:
`prefers-reduced-motion: reduce`, hash ilə açılış, il sayı < 2. Bu hadisələrdən birincisində
isə **fasilə** verir, səbəb aradan qalxanda davam edir: `pointerenter`/`pointerleave` (kart),
klaviatura fokusu timeline-ın içində/çölündə (son giriş klaviaturadan olanda — siçan klikinin
fokusu sayılmır), lightbox açıq/bağlı. İstifadəçinin öz keçidi (düymə, nöqtə, ←/→, swipe)
**dayandırmır**, sayğacı sıfırlayır (FR-015). Sonuncu ildə gözləyir, dövrə vurmur.

İlk redaksiyada ilk müdaxilə həmişəlik dayandırırdı. Canlı ölçmə (2026-10-23) göstərdi ki,
desktop-da sürüşdürən istifadəçinin siçanı onsuz da kartın üstündədir və keçid heç başlamır;
məhsul qərarı ilə "dayan" → "fasilə/sıfırla" oldu. Reallaşdırma: `pauses: Set<reason>` ref-i
(boş olanda sayır) + istifadəçi keçidində artan `cycle` state-i interval-ı yenidən qurur.
Açılışdakı `#il` bir dəfə mount-da oxunur (`openedWithYear`) — canlı `fromHash` istifadəçi
keçidi ünvanı yeniləyəndən sonra dəyişir və keçidi söndürərdi.

**Əlavə**: interval yalnız timeline ekranda görünəndə (`IntersectionObserver`; görünən hissə
timeline-ın hündürlüyünün və ya viewport-un — hansı kiçikdirsə — ≥ 50 %-i, FR-014a; 1440×900-də
kart + ox + düymələr 630–740 px olduğundan təkcə `threshold: 0.5` praktikada heç vaxt yetişmirdi) və
səhifə aktiv olanda (`document.visibilityState`) "tıqqıldayır". Ziyarətçi aşağı sürüşüb
timeline-a çatanda o artıq 1998-ə keçmiş olmur.

**Səbəb**: Clarification Q2 → C. Bu, qəbul edilmiş sapmadır (plan Complexity Tracking).
Görünürlük şərti "ziyarətçi heç nəyə toxunmursa hekayə özü oynayır" niyyətini qoruyur.

**Rədd edilən**: Prototipdəki kimi görünürlükdən asılı olmayan `setInterval`. Belə olanda
ziyarətçi ekrana gəlməmiş hekayə ötüb keçir.

---

## R8 — Şəkil böyütmə (lightbox)

**Qərar**: Kitin `Dialog`-u (`@cbar/lib-react-ui-kit/dialog`). Layihədə `image-popup-dialog.tsx`
artıq onu işlədir. Fokus tələsi, Escape, fona klik və fokusun qayıtması kitdən gəlir.
Şəkil linkinin (`<a href={src}>`) kliki `HistoryStepper`-də hadisə ötürmə (event delegation)
ilə tutulur: `preventDefault` edilir və dialog açılır. Dialog açıq olanda ←/→ il dəyişmir
(US5-3).

**Səbəb**: W III (kit control-ları), W II (yeni dependency yoxdur).

**Rədd edilən**: Prototipdəki öz `div.lb`: fokus tələsi və `aria-modal` əl ilə yazılmalı olardı.

---

## R9 — Klaviatura, swipe, ekran oxuyucusu

**Qərar**:

- ←/→ `document` səviyyəsində dinlənir. Bunlar istisnadır: fokus `input`, `textarea`,
  `select` və ya `[contenteditable]`-dadır, dialog açıqdır, modifikator düymə basılıb.
  Başqa bir qayda da var: hadisə yalnız timeline səhifədə olanda işləyir (bu, səhifədə tək
  bloktur).
- Swipe: `touchstart` / `touchend` (passive), `|dx| > 50` **və** `|dx| > |dy|`. Şaquli
  sürüşdürmə tutulmur (US3-2).
- Kart məzmunu konteyneri `aria-live="polite"`-dir. Avtomatik keçid zamanı elanlar
  ziyarətçini narahat etməsin deyə `aria-live` yalnız istifadəçinin öz keçidindən sonra
  aktivləşir (avtomatik keçiddə `off`).
- Ox nöqtəsinin adı **yalnız il rəqəmidir** (`aria-label` yox, görünən mətn), aktiv nöqtədə
  `aria-current="step"` var. Ox `<nav aria-label="İllər">`-dir (mövcud `about.history.yearNav`
  açarı).

**Spec ilə fərq**: US3-4 "{il}-ci il" deyir. Azərbaycan dilində şəkilçi ahəngə görə dəyişir
(1919-**cu**, 1936-**cı**, 1993-**cü**, 1992-**ci**). Bunun üçün qrammatik köməkçi yazmaq
əvəzinə il rəqəmi və "İllər" naviqasiya adı kifayətdir: ekran oxuyucusu "İllər, naviqasiya,
1992, cari addım" oxuyur. Spec US3-4 buna uyğun yeniləndi.

---

## R10 — İl oxunun həndəsəsi

**Qərar**: Nöqtələr indeksə görə bərabər aralıqla düzülür (prototip:
`left = p + (100% − 2p) · i / (N−1)`), zamana mütənasib deyil. Ox konteynerinin minimal eni
`(N−1) · 56px + 2p`-dir. Konteyner bundan dardırsa, ox üfüqi sürüşür (FR-009) və aktiv nöqtə
ortaya gətirilir. Prototipin mobil qaydası (`width: 936px`) bunun xüsusi halıdır: 17 il ×
~56.

**Səbəb**: İl sayı CMS-dən gəlir (bu gün 17, test datası ilə 18). Sabit 936 başqa N üçün
yanlışdır.

**Rədd edilən**: Zamana mütənasib ox (1919…2026). 1936 ilə 1989 arasında boşluq qalır,
1991–1995 isə üst-üstə düşür.

---

## R10a — Hündürlük dəyişəndə düymənin yerində qalması (FR-007a)

**Problem**: İllərin kart hündürlüyü çox fərqlidir (1919: 2 qısa hadisə; 1992: 5 hadisə; 1998:
3 şəkil). Kart dəyişəndə altındakı ox və düymələr yuxarı-aşağı sıçrayır, ardıcıl "Növbəti"
klikləri hədəfi itirir.

**Qərar**: Müdaxilə ilə il dəyişəndə (düymə, ox nöqtəsi, klaviatura) `HistoryStepper`
kliklənən elementin (klaviaturada fokuslu elementin) `getBoundingClientRect().top`-unu yadda
saxlayır. Yeni panel render olunandan sonra (`useLayoutEffect`) fərqi `window.scrollBy(0, Δ)`
ilə kompensasiya edir. Swipe-da (kartın içində) və avtomatik keçiddə kompensasiya yoxdur.

**Səbəb**: Figma-dakı tərtibat (kart → ox → düymələr) dəyişmir. Kart məzmuna görə uzanır,
boşluq yaranmır.

**Rədd edilən**:
- Bütün panelləri bir grid hücrəsinə yığıb ən hündürünə görə sabit hündürlük vermək: qısa
  illərdə (1919, 1936) kart yarıdan çox boş qalır.
- Düymələri kartın üstünə və ya yanına köçürmək: Figma-ya ziddir.
- `overflow-anchor` (brauzerin scroll anchoring-i): dəyişən element anchor-dan **yuxarıda**
  olanda işləyir, burada isə düymə dəyişən kartın altındadır və anchor seçimi brauzerdən asılıdır.

---

## R11 — Rənglər və token-lər

**Qərar**: Kitə dəyişiklik yoxdur. Prototip/Figma rəngləri ən yaxın kit primitivlərinə
bağlanan `--site-history-*` token-ləri ilə verilir (`globals.css`, 024-ün `--site-*` bloku):

| Prototip | OKLCH (ölçülüb) | Token → kit | Fərq |
|---|---|---|---|
| kart gradienti `#003359` | 31.3% .084 247.8 | brand-700 (31.9% .083 246.5) | ≈ |
| kart gradienti `#004C7C` | 40.3% .103 245.6 | brand-500 (39.2% .098 244.9) | ≈ |
| teal (nöqtə, tarix, rail) `#4BC7B5` | 75.6% .112 181.9 | secondary-500 | eyni |
| ox treki, düymə haşiyəsi `#DBDEE3` | 90.0% .008 260.7 | neutral-200 (92.2% 0) | D-2: rəngsiz |
| ox etiketi `#8C9199` | 65.5% .013 259.8 | neutral-500 (`muted-foreground`) | D-2 |
| foto fonu `#0D3B5E` | 34.2% .078 246.4 | brand-700 | ≈ |
| ağ mətn 80% / fon 5% / haşiyə teal 60% / ghost 6% | — | `primary-foreground` / `secondary-500` + alfa | alfa Tailwind `/NN` ilə |

**Səbəb**: W III.3 (yalnız semantik rəng, komponentdə hex yoxdur). 024 R11 ilə eyni yanaşmadır.

---

## R12 — Figma ölçmələri

**Ölçülüb** (`1845:118772`, bridge, 2026-10-22):

- Məzmun sütunu `x = 540`, en 984. Hero 984×206, r8. Hero → timeline aralığı **40** (024-də 36).
- `tarix/Timeline` (`1845:119481`) instance-ı, vertikal, aralıq 36:
  - `Card` 984×570, p 40/32/40/40, gap 40, r4, gradient brand-700 → brand-500 (soldan sağa);
  - `Axis` 984×76;
  - `Controls` 984×44, sağa hizalı, gap 12.
- Kontent sırasının alt boşluğu 160, footer-ə qədər.

**Ölçülməyib**: kartın daxili elementləri (il 72/700, ghost 220, hadisə rail-i, foto
ölçüləri), ox nöqtələri və düymələrin dəqiq ölçüsü. Bridge plugin-i ağır sorğularda
(`png`, sənəd üzrə `find`) iki dəfə əlaqəni kəsdi. Bu dəyərlər hələlik prototipin CSS-indən
götürülüb (ui-contract), prototip də Figma-dan çıxarılıb. tasks-da ayrıca addım var:
`tarix/Timeline` komponentini dərinlik 6 ilə ölçmək və ui-contract-ı təsdiqləmək, həmçinin
tablet/mobil frame axtarmaq (`figma_find` səhifə üzrə, `*` yox).

**Implementasiya zamanı (T001–T002, 2026-10-22)**: `figma_text 1845:119481` işlədi və
tipoqrafiyanı **təsdiqlədi**:

| Element | Ölçü |
|---|---|
| ghost il | 220/700 |
| il | 72/700 |
| gün-ay | 14/500, lh28 |
| hadisə başlığı | 16/600, lh28 |
| hadisə mətni | 14/400, lh28 |
| ox etiketi | 12/400, lh16, ls .25 |
| aktiv ox etiketi | 14/600 |

Bunlar prototiplə eynidir. Figma nümunəsindəki ox da 17 il göstərir (1919…2026).

Instance alt-qatlarına (`I1845:119481;2164:5826` — Controls) `figma_node` (depth 3) və
`figma_css` müraciətləri vaxt aşımına düşdü. Ardınca `figma_find` (`page: "About us"`) zamanı
plugin qoşulmanı kəsdi. Ona görə:

- Ox və düymə həndəsəsi prototip dəyərləri ilə qalır.
- Tablet/mobil variant **tapıla bilmədi**, prototipin responsiv qaydası işlədilir.
- Hər ikisi T032-də (brauzer ↔ Figma vizual tutuşdurma) yoxlanılır.

**Düymə qərarı**: "əvvəlki/növbəti" 44×44 dairəvi düymədir (ikon 20). Prototipdəki 22×44
toxunma hədəfi minimumunu (WCAG 2.5.8) ödəmir. Figma ilə fərq `visual-diff.md`-yə yazılır.

**Prototipdə şübhəli dəyər**: `.arr { width: 22px; height: 44px }`. Bu, yarım-dairəvi düymədir
və Figma-da yoxlanılmalıdır, toxunma hədəfi isə ən azı 44×44 olmalıdır (WCAG 2.5.8 / 2.5.5).
