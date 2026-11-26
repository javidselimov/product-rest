# UI contract — "Nəşrlər və tədqiqatlar" bölməsi (web-cbar-new)

Figma "cbar website (Copy)" › "Publications and research" `2698:5000`. Ölçülər `figma_node` (depth 2–4) və `figma_text` ilə oxunub
(2026-11-20). Yoxlama Figma rəqəmi + brauzerdə `getBoundingClientRect` ilə aparılır (INSIDE stroke qutuya daxildir).

| Ekran | Desktop 1728 | Tablet 744 | Mobil 390 |
|---|---|---|---|
| Bölmə kökü | `2698:22502` | `2700:160653` | `2700:161359` |
| Tədqiqatlar (qrup) | `3487:291490` | `3487:291506` | `3487:291521` |
| Nəşrlər, hesabatlar və sənədlər (qrup) | `2730:100609` | `3489:113152` | `3489:113775` |
| Ekonometrik modellər | `2699:23673` | `2700:163181` | `2700:163906` |
| İşçi məqalələri, Variant B | `2825:22947` | `2828:23647` | `2828:24595` |
| İşçi məqaləsi detalı | `2703:6295` | `2743:8111` | `2743:8913` |
| İllik hesabat (il arxivi) | `2748:10054` | `2757:10228` | `2757:11078` |
| Sahələrarası (il arxivi) | `2762:11057` | `2764:11754` | `2764:12613` |
| Rəqəmsal fırıldaqçılıq ("Hamısı") | `2797:19903` | `2800:20598` | `2800:21457` |
| Mikromaliyyə (tək sənəd) | `2766:114051` | `2768:13248` | `2768:14013` |
| Kibertəhlükəsizlik (tək sənəd) | `2767:115663` | `2770:14712` | `2770:15478` |
| Risk əsaslı nəzarət (tək sənəd) | `2776:16546` | `2787:16176` | `2787:16942` |
| Nəzarət Texnologiyaları (tək sənəd) | `2776:18033` | `2791:17640` | `2791:18406` |
| Ödəniş xidmətləri (tək sənəd, **gizli bölmə**) | `2795:36871` | `2796:19104` | `2796:19869` |

Komponentlər: il dropdown-ları `2724:6931` (işçi məqalələri), `2748:10921`, `2762:11841`, `2797:20705`; dropdown bəndi `2724:6929`;
sol menyu `2804:21370` (Link `2804:21377`, Header `2804:21398`, Group `2804:21603`, Menu `2804:21709`); mega menyu `2810:21571`
(açıq nümunə `2810:22348`).

**Gizli qatlar qurulmur** (bax §10): Variant A (`2707:8452`, `2733:7083`, `2733:7961` — hamısı `visible:false`), detalda açar söz/JEL çipləri
(`2745:2875`, `2745:2886`, `2745:3408`), illik hesabatda şrift qeydi qutusu (`2748:10886`), tablet/mobil "Bütün məqalələr" sətri
(`2828:24454`, `2828:25191`), mega menyuda "Maraqlı ola bilər" sütunu (`2810:21533`) və alt başlıqlar (`2810:21557`, `2810:21563`).

Rənglər (FinCERT contract-ı kimi semantik token-larla): `#222222` foreground, `#004976` primary, `#787878` muted-foreground,
`#a3a3a3` muted-foreground (zəif), `#e5e5e5` border, `#d4d4d4` border (tablet/mobil meta ayırıcıları), `#f5f5f5` sol menyu fonu,
`#f9f9f9` detal meta fonu, `#43b7a7` "Axtar" düyməsi (teal, primary deyil), `#4bc7b5` səhifələmənin aktiv səhifəsi, `#c74040` PDF nişanı.
Şrift DM Sans. Breakpoint-lər saytın `tab:` (744) və `desk:` dəyişənləri; konteyner `SHELL_CLASS`.

## 1. Səhifə çərçivəsi (bütün ekranlar, `section-shell`)

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Konteyner | 1320, kənarlar 204 | padding 40 (məzmun 664) | padding 24 (məzmun 342) |
| Breadcrumb + paylaşma | bir sətir, space-between, padding 30/0 (hündürlük 100) | iki sətir, gap 10, blok padding 24/40 | iki sətir, gap 12; breadcrumb öz içində üfüqi sürüşür (`2743:8920`) |
| Paylaşma düymələri | 5 × 40, gap 10, r 6, fon `#e5e5e5` | eyni | eyni |
| Sol menyu | solda, en 312 | başlığın üstündə, tam en 664 | başlığın üstündə, tam en 342 |
| Menyu ↔ məzmun | gap 24 (məzmun sütunu 984) | menyu → başlıq 40 (32 + 8) | paylaşma → menyu 32, menyu → başlıq 32 |
| H1 | 32/44 w600 | 32/44 w600 | 24/32 w600 |
| H1 → məzmun | 36 | 36 | 24 |
| Son blok → footer | 120 (menyu daha uzundursa menyudan ölçülür, `2748:10054`) | padding-bottom 80 | padding-bottom 64 |

Detal kadrında (`2703:6295`) məzmun → footer 192 görünür, amma kadr auto-layout deyil; 120 götürülür. Giriş mətni 16/28 w400 foreground,
en məzmun sütunu qədər (desktop 984). Fırıldaqçılıq girişi 16/26.

## 2. Sol menyu "Nəşrlər Menu" (`2804:21370`)

- Blok: fon `#f5f5f5`, r 4, padding 20, qruplar arası 16. Desktop en 312 (daxili 272); tablet/mobil eyni blok tam endə (daxili 624 / 302).
- Qrup başlığı (Header): 16/28 w600, sağda 16 enində caret, gap 8. Qrup açıqdırsa başlıq → linklər 12, linklər arası 12.
- Link: default 16/28 w400 `#a3a3a3`; hover və aktiv 16/28 w500 foreground. Uzun adlar sətirə keçir (2–4 sətir).
- Vəziyyətlər (Figma-dakı kimi):
  - kök (`2698:22502`): hər iki qrup bağlı, başlıqlar foreground;
  - qrup səhifəsi (`3487:291490`, `2730:100609`): o qrup açıq, başlığı **Active** — primary `#004976`, linkləri default;
  - yarpaq səhifə: qrupu açıq, başlıq foreground, aktiv bənd w500 foreground, digər qrup bağlı.
- Tablet/mobil forması ayrı komponent deyil: eyni iki açılan qrup başlığın üstündə (Device=Tablet/Mobile variantları yalnız endir).
- "Nəşrlər" qrupunda 7 bənd, sıra: İllik hesabat, Sahələrarası…, Mikromaliyyə…, Kibertəhlükəsizlik…, Risk əsaslı…, Nəzarət
  Texnologiyaları…, Rəqəmsal fırıldaqçılıq. **"Ödəniş xidmətləri" yoxdur** (gizli bənd də yoxdur, `2804:21540`). Bax §10.

## 3. İşçi məqalələri siyahısı — Variant B (`2825:22947`)

Məzmun sütunu bloklar arası 32: giriş → filtr → "Bütün məqalələr" → siyahı → səhifələmə.

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Filtr düzülüşü | bir sətir, space-between: [axtarış 312 + il 312, gap 24] · "Filtrləri təmizlə" · "Axtar" 144 | alt-alta: axtarış 664×48, il 664×48 (gap 16); altda [təmizlə 304 + Axtar 336], gap 24, sağa düzlənmiş | tablet kimi (blok 172) |
| Sahə | h 44 (tablet/mobil 48), padding 10/12, gap 8, r 4, 1 px `#e5e5e5`, fon yox | | |
| Axtarış sahəsi | solda böyüdücü ikon 20 (opacity .7), placeholder 14/28 `#a3a3a3` | | |
| İl seçimi | mətn "İl: Hamısı" 14/28 `#a3a3a3`, sağda caret 20 | | |
| "Filtrləri təmizlə" | link, padding 0/4, 14/20 w500 primary, alt xətt | | |
| "Axtar" | h 44, padding 2/20, r 4, fon `#43b7a7`, 16/28 w500 ağ | tam en (336) | |
| "Bütün məqalələr" | 20/28 w600 foreground | **gizli** | **gizli** |

Label və köməkçi/xəta mətnləri Figma-da gizlidir: label `sr-only` olur, görünən label yoxdur.

**Sətir** (`2825:23800`…; bütün sətir bir link, bax §10):

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Qutu | üfüqi, padding 20, gap 24, r 4, 1 px `#e5e5e5`, ağ | eyni | şaquli, padding 16, gap 8 |
| Nömrə + il | sütun 110, gap 2 | eyni | bir sətir, gap 12 |
| Mətn | flex-1, başlıq ↔ müəlliflər 4 | flex-1 | tam en |
| Dil | sağda sütun 130, sağa düzlənmiş | sütun 110 | altda ayrıca sətir ("Meta", gap 8) |
| Sətirlər arası | 12 | 12 | 12 |

Mətnlər: "№ 02/2026" 16/24 w600 primary; "Tarix: 2026" 13/20 `#a3a3a3`; başlıq 16/24 w600 foreground; müəlliflər 14/22 `#a3a3a3`;
dil 14/24 `#a3a3a3`. Hover Variant B-də çəkilməyib; `İşçi məqalə / Row` (`2710:8147`) hover-i: border `#bdbdbd`.

**Səhifələmə** (`2825:22998`, kit Pagination): düymələr h 32, gap 8, r 8, fon `#f9f9f9`, rəqəm 14/28; aktiv fon `#4bc7b5`; ox 32×32,
əlçatmaz ox opacity .5; boşluq "…" 32. Desktop sağa düzlənir, tablet/mobil mərkəzdə.

**İl dropdown-u** (`2724:6931`, panel `2724:6985`): en sahə qədər (312), maksimum h 352 (daxildə sürüşmə), padding 8/0, r 4, 1 px `#e5e5e5`,
kölgə 0 8 24 rgba(0,0,0,.08). Bənd h 40, padding 9/16, 16/28 w400; hover fon `#f5f7f9`; seçili fon `#eeeff1`, 16/22 w600. Sıra:
"Hamısı", sonra illər azalan (2026 … 2013). Qurulma: ortaq `YearMenu` widget-i — native `<details>` + linklər (`YearSortMenu` nümunəsi),
JS-siz (research R5). Trigger sahə görünüşündədir (h 44 / tablet-mobil 48), panel `<details>`-in açıq vəziyyətidir.

## 4. İşçi məqaləsi detalı (`2703:6295`)

Breadcrumb: "Ana səhifə › Nəşrlər və Tədqiqatlar › Tədqiqatlar › İşçi məqalələri › <başlıq>". H1 məqalənin başlığıdır (32/44, tablet
iki sətir 88, mobil 24/32). Bloklar arası: desktop/tablet 40, mobil 32.

| Blok | Desktop | Tablet | Mobil |
|---|---|---|---|
| Meta qutusu | fon `#f9f9f9`, r 4, 4 sütun üfüqi: Müəllif(lər) 363.6 + 3 × 206.8 (≈ 1.76 : 1 : 1 : 1) | 4 sütun 240.4 + 3 × 141.2 | alt-alta 4 sətir |
| Meta xanası | padding 20/24, gap 4; 2-ci xanadan sol 1 px `#e5e5e5` | padding 20, ayırıcı `#d4d4d4` | padding 14/16, 2-ci sətirdən üst 1 px `#d4d4d4` |
| Etiket / dəyər | etiket 14 w600 `#787878` (line-height auto ≈ 18); dəyər 16/28 w500 foreground | eyni | eyni |
| Bölmə başlığı (Xülasə, Açar sözlər, JEL təsnifatı) | 20/28 w600 | eyni | eyni |
| Başlıq → mətn | Xülasə 16; Açar sözlər və JEL 12 | eyni | eyni |
| Xülasə mətni | 16/28 w400 | eyni | eyni |
| Açar sözlər / JEL | **vergüllə bir sətir mətn** 16/26 (tablet 16/28); çiplər gizli | | |
| Çip (gizli qat, istifadə olunarsa) | padding 7/14, r 20 (pill), 1 px `#e5e5e5`, ağ, 14/20 w500; gap 8, wrap | | |
| PDF kartı | §6 kartı; ad = məqalənin başlığı; Figma-da **ölçü mətni yoxdur**, saytda FR-018 üzrə ölçü bilinirsə göstərilir (research R9) | | padding 16 |

## 5. İl arxivi (`2748:10054`, `2762:11057`, `2797:19903`)

Məzmun bloklar arası 32 (filtr → il qrupu), il qrupları arası **40**, qrupda başlıq → kart və kartlar arası **12**.

| | Desktop | Tablet | Mobil |
|---|---|---|---|
| Filtr | üfüqi, gap 16: "İl" 16/22 w500 foreground + seçim 220×44 | eyni (220) | seçim qalan eni tutur (318) |
| Seçim mətni | seçili il "2025" və ya "İl: Hamısı", 14/28 | | |
| İl başlığı | 20/28 w600 | 20/28 w600 | 18/26 w600 |
| Kart düzülüşü | **bir sütun**, tam en (984) — grid deyil | bir sütun 664 | bir sütun 342 |

Dropdown panelləri: illik hesabat `2748:10923` 220 × 352 (2025 … 1996, 30 il), sahələrarası `2762:11843` 220 × 216 (2026 … 2022),
fırıldaqçılıq `2797:20707` 220 × 136 ("Hamısı", 2026, 2025). Bənd və panel §3 dropdown-u ilə eynidir.

"Hamısı" vəziyyəti (`2797:19903`): bütün illər öz başlığı ilə azalan sırada, qruplar arası 40. Sahələrarası (`2762:11057`) seçili il
2026-da üç kart göstərir.

İllik hesabatın şrift linki: Figma-da gizli "Font note" qutusu (`2748:10886`) filtrdən **sonra**, ilk il qrupundan əvvəldir: fon
`#f5f7f9`, r 4, padding 14/20, gap 12, solda 22 px info ikonu (primary xətt), mətn 16/22 "… şrifti yükləyin · 106.39 KB". Bax §10.

## 6. Sənəd kartı (FR-018; il arxivi, tək sənəd, detal)

- Qutu: üfüqi, padding 16/20 (mobil 16), gap 16, r 4, 1 px `#e5e5e5`, ağ, mərkəzə düzlənmiş; bütün kart bir link.
- Mətn sütunu flex-1, gap 2: ad 16/24 w600 foreground (detal kartında 16/22); ölçü 13/20 `#a3a3a3` ("886.56 kB"), bilinmirsə sətir yoxdur.
- Sağda fayl çipi "Fayl · PDF" 83×36: padding 8/12, gap 10, r 4, 1 px `#e5e5e5`; nişan padding 2/6, r 3, fon `#c74040`, 11/14 w600 ağ "PDF";
  endirmə ikonu 14 primary. FinCERT RFC çipi ilə eynidir (mövcud fayl nişanı komponenti).
- Hündürlük: bir sətirli ad 70, ad + ölçü 80, iki sətirli ad 82; tablet/mobildə ad sətirə keçir, çip sağda qalır.
- Ekonometrik modellər (`2699:43362`) köhnə "pdf file" instansıdır (padding 20, r 0, en 982): FR-018 üzrə eyni §6 kartı qurulur.

## 7. Tək sənəd səhifəsi, ekonometrik modellər, qrup səhifələri, kök

- Tək sənəd (`2776:16546`, `2795:36871`…): başlıq → giriş → kart, aralar **36** (məzmun bloku `itemSpacing` 36). Giriş 16/28, en 984.
- Ekonometrik modellər: giriş + bir kart ("Mərkəzi Bankda istifadə olunan modellər"), kart §6.
- Kök (`2698:22502`) və qrup səhifələri (`3487:291490`, `2730:100609`): yalnız başlıq + giriş mətni (Tədqiqatlar-da iki paraqraf),
  uşaq səhifələrin siyahısı və ya kartı **yoxdur**.

## 8. Mega menyu (`2810:21571`) — **054-də qurulmur, spec 055**

İstifadəçi qərarı (2026-11-20): bu kadr yeni header dizaynının (Figma `Header menu` `3195:2363`, Variant B) parçasıdır. Header redizaynı bütün
bölmələr üçün ayrıca spec 055-dir. 054-də saytın indiki mega menyusu (Figma `1083:26783`) dəyişmir: yeni ağac orada iki sütun verir — "Tədqiqatlar"
(2 link) və "Nəşrlər, hesabatlar və sənədlər" (8 link, "Ödəniş xidmətləri" daxil). Aşağıdakı ölçülər 055 üçün istinad kimi saxlanılır.

- Panel: tam en 1728, padding 228/204/48/204 (yuxarıda header 188 + 40), alt künclər r 4, fon xətti gradient `#0b4a7a` → `#052642`, kölgə 0 16 40 rgba(0,0,0,.18).
- İki hissə, gap 40: solda **kateqoriya relsi** 300 (padding-right 32, sağda 1 px ağ 12 %), bəndlər arası 14; aktiv kateqoriya 18/26 w600
  ağ, passiv 16/26 w400 `#9eabbd`. Sağda keçidlər 980: sütunlar üfüqi, en 250, gap 40; sütunda bəndlər arası 12.
- Yəni "iki sütun" yan-yana deyil: kateqoriya (Tədqiqatlar / Nəşrlər…) seçilir, sağda onun sütunları görünür (Variant `Kateqoriya`).
- Tədqiqatlar: bir sütun, alt başlıq "Tədqiqatlar" 13/20 w500 `#7a8799` (görünür), linklər Ekonometrik modellər, İşçi məqalələri
  16/28 w400 ağ. "Maraqlı ola bilər" sütunu (380 en, link "02/2026. <başlıq>") **gizlidir**.
- Nəşrlər: üç sütun — (1) başlıqsız: İllik hesabat, Sahələrarası…, Rəqəmsal fırıldaqçılıq; (2) Mikromaliyyə…, Kibertəhlükəsizlik…,
  "Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası", "Nəzarət Texnologiyaları (SupTech) üzrə Yol Xəritəsi"; (3) Ödəniş xidmətləri.
  (2) və (3)-ün alt başlıqları ("Strategiyalar və konsepsiyalar", "Ödəniş sistemləri", 13/20 w500 `#7a8799`) **gizlidir**.

## 9. Vəziyyətlər

- JS-siz: axtarış/il/səhifə GET formasıdır, sol menyu qrupları native `<details>`, kartlar adi `<a>`.
- Reveal (spec 049): hər blok bir `Reveal`, sətirlər/kartlar capped stagger ilə; iç-içə yox.
- Boş vəziyyət (FR US1-4): Figma-da kadr **yoxdur** (`figma_find` "boş/empty/tapılmadı" — 0 nəticə). Plan mərhələsində mövcud saytın boş
  vəziyyət mətni üslubu götürülür (14–16 muted, altında "Filtrləri təmizlə").
- Fokus: sətir, kart, menyu linki üçün görünən `focus-visible` halqası.

## 10. Figma ↔ spec ziddiyyətləri və açıq suallar

**Həll (2026-11-20, plan):** gizli qatlar qurulmur — 2, 4, 8 (şrift qutusu), 11; mega menyu (2, 3) spec 055-ə; 1 — "Ödəniş xidmətləri" köçür, sol
menyuda yox, açılan menyularda var (yeni bayraq, research R11); 5 — vahid kart ölçünü bilinəndə göstərir (research R9); 6 — "Hamısı" hər il
arxivində (research R8); 7 — spec edge case düzəldilir; 8 — şrift linki `before` mətnində sənəd kartı olaraq il seçiminin **üstündə** qalır (gizli
qutu qurulmur, mətn itmir); 9 — bir sütun; 10 — sətir kart-linkdir, hover `2710:8147`; 12 — placeholder görünən Figma: "Məqalə adı, müəllif və ya
açar söz"; 13 — saytın mövcud boş vəziyyət üslubu; 15 — vahid kart; 16 — seçili bənd hər menyuda `aria-current` + w600 fon `#eeeff1`.

1. **"Ödəniş xidmətləri"**: Figma bölməsi `2795:38359` gizlidir; sol menyu komponentində bəndi yoxdur; yalnız mega menyuda (3-cü sütun) var.
   Spec US4-3 onu sol menyuda "Nəşrlər" qrupunun sonuna qoyur.
2. **Mega menyu**: "Maraqlı ola bilər" (`2810:21533`) və alt başlıqlar (`2810:21557`, `2810:21563`) gizlidir. Spec qərar 5 və FR-025 onları
   qurur. Figma-da qruplaşma sütunlarla verilir, başlıqla yox.
3. **Mega menyu etiketləri qısadır**: "Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası", "Nəzarət Texnologiyaları (SupTech) üzrə Yol
   Xəritəsi" səhifə başlığından fərqlidir. Sol menyu tam başlığı göstərir. Qısa menyu adı üçün sahə lazımdırmı?
4. **Detal: açar sözlər və JEL çip deyil**, vergüllə mətndir (çiplər gizli). Spec FR-010 / US1-5 çip deyir.
5. **Detal PDF kartında ölçü yoxdur**. Spec US1-5 "ölçü" deyir; il arxivində ölçü var.
6. **"Hamısı"**: yalnız işçi məqalələri və fırıldaqçılıq dropdown-larında var. İllik hesabat və sahələrarası dropdown-larında yoxdur.
   Spec US3-1 hər il arxivində tələb edir.
7. **Sahələrarası tək il deyil**: dropdown 2026–2022 göstərir. Spec edge case "Figma Sahələrarası, tək 2026" deyir.
8. **Şrift linki**: gizlidir və filtrdən sonra yerləşir. Spec US3-4 onu il seçiminin üstündə istəyir.
9. **İl arxivində kartlar bir sütundur**, grid deyil (üç enlikdə də).
10. **Variant B sətrində link işarəsi yoxdur** (ox, hover variantı yoxdur, sətirlər instans deyil). Klikin detala apardığını Figma
    göstərmir, bu spec qərarıdır (qərar 3).
11. **"Bütün məqalələr" başlığı tablet və mobildə gizlidir**.
12. **Placeholder**: Figma "Məqalə adı, müəllif və ya açar söz"; spec US1 "Ad, müəllif və ya açar söz" (bu mətn gizli Toolbar-dadır).
13. **Boş vəziyyət kadrı yoxdur** (US1-4, SC-008).
14. **Variant A** (`2707:8452` + tablet/mobil) `visible:false`-dır: spec qərar 3 ilə uyğundur.
15. Ekonometrik modellərin kartı köhnə komponentdir (r 0, padding 20); FR-018 üzrə vahid kart qurulur.
16. Dropdown panellərində seçili bənd işarəsi yalnız işçi məqalələrində var ("Hamısı" w600); illik hesabat və fırıldaqçılıqda seçili bənd
    çəkilməyib.
