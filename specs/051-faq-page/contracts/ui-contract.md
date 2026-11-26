# UI contract — FAQ (web-cbar-new), spec 051

Mənbə: Figma "cbar website (Copy)" › "FAQ", `figma_node` ölçüləri (2026-11-17). Ölçmə qaydası: Figma rəqəmi + brauzer `getBoundingClientRect`,
tolerans 2 px (SC-001); stroke INSIDE. Rənglər yalnız semantik token-larla; aşağıdakı hex-lər yalnız Figma referansıdır — implement-də ən yaxın mövcud
token (`border-border`, `text-muted-foreground`, `text-primary`, `bg-muted`) seçilir, yeni token lazım olsa `--site-faq-*` (spec 050 `--site-consumer-*`
kimi) `globals.css`-də, dark mode cütü ilə.

## Səhifə çərçivəsi (A və B eyni)

| Element | Desktop 1728 | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Məzmun eni | 1320 (204 kənar) | 664 (40 padding) | 342 (24 padding) |
| Breadcrumb + paylaşma | sətir, 100 hündür (30 padding), space-between | sətir | sütun: breadcrumb 40, 12 aralıq, paylaşma 40 |
| Sol menyu | yoxdur | yoxdur | yoxdur |
| H1 "Sual-cavab" | 32/44 600 | 32/44 600 | 24/32 600 |
| H1 → məzmun | 36 | 36 | 24 |
| Məzmun blokları arası | 40 | 40 | 32 |
| Son blok → footer | 120 | 80 (padding-bottom) | 64 |

## Axtarış sırası

| Element | Desktop | Tablet | Mobil |
|---|---|---|---|
| A: axtarış sahəsi | 1320 × 54, padding 14/20, radius 4, border #E5E5E5, ikon 20 (gap 12), placeholder 16/24 #A3A3A3 | 664 × 54 | 342 × 54, padding-left 16 |
| B: axtarış + seçim | sətir, gap 16: axtarış 904, seçim 400 × 54 | sütun (seçim tam en, axtarışın altında, gap 16) | sütun |
| Placeholder | "Sualınızı axtarın, məsələn: inflyasiya, REPO, məzənnə" | eyni | "Sualınızı axtarın" (qısa) |

Seçim sahəsi **yalnız B görünüşündədir** (clarify 2026-11-17, Figma kimi); A-da axtarış tam endədir. Seçimdə "Bütün mövzular" A-ya qaytarır. JS-siz
"Göstər" düyməsi seçimin yanında (hidratasiyadan sonra gizlənir). Seçimin label-i ekran oxuyucusu üçün (`sr-only`), placeholder label əvəz etmir.
A-da B-yə keçid: açıq mövzu kartının sual siyahısından sonra "Ayrıca aç →" linki (14/20 500, `text-primary`, Figma-da yoxdur — minimal, kartın
16 px daxili aralığına sığır).

## Mövzu kartı — `FAQ / Mövzu` (A)

| Xassə | Desktop/Tablet | Mobil |
|---|---|---|
| Kart | tam en, padding 16, radius 4, border 1 #D4D4D4, bg white | padding 12 |
| Kartlar arası | 16 | 12 |
| Siyahının üst xətti | 1 px (Figma `individualStrokeWeights.top`) — implement-də yoxlanır | eyni |
| Başlıq sətri | padding 8/0, gap 12: ad 18/24 600 #222 (flex 1), say 14/18 400 #787878 ("23 sual"), caret 20 | ad 17/24; uzun ad iki sətrə düşür (kart 90) |
| Açıq | caret 180°, başlıqdan sonra 16 aralıq, suallar siyahısı | eyni |

## Sual — `FAQ / Item`

| Xassə | Dəyər |
|---|---|
| Sətir | alt border 1 #E5E5E5; B siyahısında üst border 1 (birinci elementdə) |
| Başlıq | padding 20/24, gap 16; sual 17/26 500 #222 (mobil 16/24), "N. " prefiksi; ikon 20 (plus/minus və ya chevron — Figma `Icon` instance-ı implement-də `figma_node` ilə dəqiqləşir) |
| Açıq başlıq | sual 600, rəng #004976 (`text-primary`) |
| Cavab | padding 0 72 24 24 (mobil sağ padding 24 — ölçülür), 16/26 400 #222, CMS məzmun stili (`CmsContent variant`), cədvəl öz qabında üfüqi sürüşür |

## B görünüşü — seçilmiş mövzu

Kateqoriya bloku: başlıq sətri (24/32 600, mobil 20/28), 16 aralıq, `FAQ / Item` siyahısı (üst xətt). Mövzu kartı çərçivəsi yoxdur.

## Video bloku

| Xassə | Desktop | Tablet | Mobil |
|---|---|---|---|
| Blok | padding-top 40, gap 24 | 40 / 24 | 32 / 20 |
| Başlıq "Video sual-cavab" (interfeys etiketi) | 24/32 600 | 24/32 | 20/28 |
| Kartlar | sətirdə 3, kart 424, gap 24 | wrap, gap 24 | sütun, gap 24 |
| Önizləmə | 424 × 239 (16:9), radius 4, fon #E2E4E7, play 56 mərkəzdə | tam en, 16:9 | 342 × 192 |
| Kart başlığı | 12 aralıq, 16/24 600, 2 sətir | eyni | eyni |

## Bölmə bloku (Figma kadrı yoxdur)

Səhifə mətnindən sonra, səhifə mətni ilə 40 aralıqla, hər bağlı mövzu üçün bir **keçid kartı** (clarify 2026-11-17): `FAQ / Mövzu` bağlı kartının
çərçivəsi (padding 16, radius 4, border #D4D4D4, mobil padding 12) — solda "<Mövzu> üzrə sual-cavab" 18/24 600 (mobil 17/24) və "23 sual" 14/18
#787878, sağda "Bax" + ox ikonu (`text-primary`, 14/20 500). Bütün kart bir `<a>`-dır (bir fokus nöqtəsi, hover-də border `primary`). Kartlar arası
16 (mobil 12). Akkordeon və suallar yoxdur.

## Vəziyyətlər

- Boş axtarış nəticəsi: mətn "«REPO» üzrə sual tapılmadı" + link "Axtarışı təmizlə" (`?topic` saxlanır), video bloku qalır.
- FAQ məlumatı yoxdur / API xətası: CMS səhifəsinin öz mətni adi CMS görünüşündə (`CmsContent`).
- Scroll reveal (spec 049): mövzu kartları `Reveal index` ilə (stagger cap), video kartları; açılmış `<details>` içində reveal yoxdur (iç-içə qadağan).
- Çap: `data-accordion` — bütün `<details>` açıq çap olunur (mövcud qayda).
- Dark mode: bütün rənglər token; Figma hex-ləri birbaşa yazılmır.
