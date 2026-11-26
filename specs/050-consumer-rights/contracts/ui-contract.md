# Contract: UI ölçüləri (spec 050)

Mənbə: Figma bridge, 2026-11-17. Bütün səhifələr bölmə şablonundadır (`section-shell`: breadcrumb 1320 qutu, sol menyu 312, məzmun 984 desktop-da),
ona görə yalnız məzmun sütununun içi verilir. Rənglər kit token-larıdır: `#222` mətn, `#A3A3A3` köməkçi mətn, `#D4D4D4` xətt, `#E5E5E5` kart çərçivəsi,
`#F5F7F9` (r .961 g .969 b .976) yumşaq fon, `#CFF3EC` seçilmiş il düyməsi, `#474747` cəmi sətrinin üst xətti.
Desktop dəyərləri ölçülüb. **Tablet və mobil** dəyərləri implementasiyada eyni üsulla (fikstür proxy + Edge CDP, research R14) ölçülüb bura
yazılır; aşağıda ancaq bilinənlər var.

## 1. Ümumi

| Element | Desktop | Qeyd |
|---|---|---|
| Səhifə başlığı | 32/44 SemiBold | mövcud şablon |
| Başlıq → məzmun | 36 | |
| Bloklar arası | 56 (Statistika), 32 (Şikayət), 36 (digər) | |
| Blok başlığı (h2: "Arxiv", "Müraciətlər üzrə statistika", "İnfoqrafika", qısa icmal) | 20/28 SemiBold, altında 20 | |

## 2. `consumer-text` (`2445:16786`, `2553:6979`)

| Element | Desktop |
|---|---|
| Lead | 18/30 Medium |
| Paraqraf | 16/28 Regular |
| Başlıq sətri | 20/28 SemiBold |
| Nömrəli kart | nömrə 16/28 SemiBold + mətn 16/28; ölçülər implementasiyada `2446:126707` qrupundan |

## 3. `complaint-index` (`2453:4111` → `Complaint / Index` 2453:4819)

| Element | Desktop |
|---|---|
| Blok sütunu | 984, aralıq 32 |
| Tablar | hündürlük 41, alt xətt 1 `#D4D4D4`; tab mətni 18/24 SemiBold; tablar arası 32 |
| Son məlumat kartı (`Complaint / Latest`) | 984 × 96, padding 24, radius 4, fon `#F5F7F9`; "SON MƏLUMAT" 12/18 SemiBold, letter-spacing 5%, `#A3A3A3`; başlıq 18/26 SemiBold; sağda "PDF" pill (83 × 36, padding 8/12, radius 4, ağ, çərçivə `#E5E5E5`, mətn 11/14 SemiBold) |
| Arxiv başlığı | "Arxiv" 20/28 + alt mətn 14/22 `#A3A3A3` ("İli seçin — aylar üzrə sənədlər açılacaq"), padding-bottom 8 |
| İl sətri (`Complaint / Year`) | bağlı 984 × 69 (padding 20/0, il 20/28 SemiBold, ox 20 × 20), alt xətt 1 `#D4D4D4` |
| Açıq il | aylar: 4 sütun wrap, kart 234 eni, aralıq 16, padding-bottom 24 |
| Sənəd kartı (`Complaint / Document`) | 234 × 70 (iki sətirli başlıqda 82), padding 16, aralıq 12, radius 4, çərçivə `#E5E5E5`; başlıq "Sentyabr 2026" 16/24 SemiBold; sağda PDF pill |
| Metodologiya | çərçivəli qutu, padding 24, aralıq 12, radius 4; başlıq 18/26 SemiBold; mətn 16/28; düstur qutusu padding 16/20, aralıq 16, radius 4, fon `#F5F7F9`, sol tərəf 16/24 SemiBold, surət/məxrəc 16/22 Medium; qeyd 14/22 `#A3A3A3` |

## 4. `appeal-statistics` (`2557:137809`)

| Element | Desktop |
|---|---|
| Qısa icmal | 2 × 2 kart, kart 480 × 368, aralıq 24, padding 24, aralıq 16, radius 4, çərçivə `#E5E5E5`; kanal adı 14/22 Medium; cəmi 36/44 SemiBold; sektor sətri 14/22 (ad Regular, rəqəm SemiBold sağa) |
| Kanal tabları (`Stat / Channel`) | hündürlük 45, alt xətt 1 `#D4D4D4`, tablar arası 24; tab 44 hündür, üst küncləri radius 4 |
| İl seçimi | "İl:" 14/21 Medium `#A3A3A3`; düymə ~67 × 36, aralıq 8, radius 4; seçilmiş fon `#CFF3EC` |
| Cədvəl | 984, çərçivə 1 `#D4D4D4`, radius 4; başlıq sətri 84 hündür, fon `#F5F7F9`; sətir 46, üst xətt 1 `#D4D4D4`; "Yekun" sətri üst xətti 1.5 `#474747` |
| İnfoqrafika | son məlumat kartı 984 × 122 (`Complaint / Latest` "Hesabat" variantı) + il sətirləri (§3 ilə eyni) |
| Mobil (390) | tablar və il düymələri 342 enində; cədvəl `Table scroll` — öz qabında üfüqi sürüşür, səhifə yox |

## 5. `consumer-documents` (`2572:14435`, `Sənədlər / Section` 2572:14430)

| Element | Desktop |
|---|---|
| Bölmə başlığı | 984 × 68, padding 20/0, mətn 20/28 SemiBold, alt xətt 1 `#E5E5E5` |
| Açıq gövdə | aralıq 20, padding-bottom 32 |
| Sənəd kartı | başlıq 16/24 SemiBold + PDF pill (§3) |

## 6. Yoxlama

Hər səhifə 1728, 744, 390 endə: məzmun sütununun eni, blok aralıqları, kart ölçüləri `getBoundingClientRect` ilə ±2 px (SC-001). Səhifə səviyyəsində
`scrollWidth <= clientWidth`.

## 7. Ölçmə nəticəsi (T047, 2026-11-17)

Production build fikstür proxy ilə işlədilib (seed-dən sonrakı mətn, `.tmp-050/proxy.mjs`), Edge CDP `getBoundingClientRect` ilə ölçülüb (`.tmp-050/measure.mjs`, `measure.json`).
Tablet və mobil Figma dəyərləri `Complaint / Index` 2474:89762 (744) və 2474:91927 (390), `Stat / Channel` 2565:4033 (390) kadrlarındandır.

| Element | 1728 | 744 | 390 | Figma |
|---|---|---|---|---|
| Məzmun sütunu | 984 | 664 | 342 | 984 / 664 / 342 |
| Səhifə səviyyəsində üfüqi sürüşmə | 0 | 0 | 0 | 0 |
| Lead | 18/30 Medium | 18/30 | 18/30 | 18/30 |
| Şikayət tabları | 40 + 1 xətt | 40 + 1 | 40 + 1 | 41 (bütün endlərdə; sıra yana sürüşür, scrollbar gizlidir) |
| Son məlumat kartı | 984 × 96 (Bank), 122 (iki sətir) | 664 × 122 | 342 × 200 | 96 / 122 / 200 |
| İl sətri | 68 | 68 | 58 | 69 / 69 / 59 (alt xətt daxil) |
| Sənəd kartı | 234 × 70, 4 sütun | 324 × 70, 2 sütun | 342 × 70, 1 sütun | 234 × 70 |
| Metodologiya padding | 24 | 24 | 16 | 24 / 24 / 16 |
| Düstur (mobil) | sətirdə | sətirdə | 308 en, şaquli | 308, şaquli, aralıq 8 |
| İcmal kartı | 480 × 368 | 320 × 368 | 342 × 368 | 480 × 368 |
| Statistika tabları | 44 | 44 | 44 | 45 (xətt daxil) |
| Cədvəl başlıq / sətir | 84 / 46 | 84 / 46 | 84 / 46 | 84 / 46 |
| Cədvəl öz qabında sürüşmə | 0 | 70 | 392 | mobil `Table scroll` |

Tablet və mobil üçün Figma-da sənəd kartının sütun sayı göstərilməyib. 2 və 1 sütun mətnin sığması üçün seçilib.
