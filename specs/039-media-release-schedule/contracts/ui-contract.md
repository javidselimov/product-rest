# UI kontraktı: Məlumatların yayımlanması qrafiki

Figma səhifə: desktop `1713:29377` (məzmun `1713:29385`), tablet `1718:30137` (`1718:30146`), mobil `1718:30583` (`1718:30593`).
Modal: desktop `1727:31563` (`1727:32140`), tablet `1727:32212` (`1727:32525`), mobil `1727:32597` (`1727:32788`).
Ölçülər Figma pikselidir; DOM-da `getBoundingClientRect` ilə yoxlanır (INSIDE stroke ölçüyə daxildir).

## Səhifə

Şablon `widgets/section-shell` (breadcrumb, paylaşma, sol Media menyusu) — dəyişmir.

| Element | Desktop (1360+) | Tablet (744+) | Mobil |
|---|---|---|---|
| Məzmun eni | 984 | 664 | 342 |
| H1 → məzmun | 36 | 36 | 36 |
| Məzmun blokları arası | 24 | 24 | 20 |
| H1 | 32/600 lh44 | 32/600 lh44 | şablonun mobil H1-i |
| Giriş mətni | 16 lh28 #222 | 16 lh28 | 14 lh22 |

## Axtarış forması (`ListFilter dates={false}`)

| Element | Desktop | Tablet | Mobil |
|---|---|---|---|
| Düzülüş | bir sətir, `space-between`, aralıq 24 | sahə tam en; düymələr altda, sağa, aralıq 24 | sahə tam en; düymələr altda, aralıq 12, tam en |
| Sahə | 672×54, p 12/14, kənar 1 #D4D4D4, radius 4, placeholder 16 lh28; düymələr sahəyə görə mərkəzdə (+5) | 664×54; düymələr 24 aşağıda | 342×54; düymələr 20 aşağıda |
| "Filtrləri təmizlə" | 14/500 lh20, altxətt, px 4, h44 | eyni | 149 en |
| "Axtar" | 144×44, radius 4, `site-accent-strong`, 16/500 | eyni | 181 en |

Placeholder: "Məzmun üzrə axtarış" / "Search by content". Forma `GET`, `name="q"`, "təmizlə" `href` = route-un `q`-suz ünvanı.

## Cədvəl (tablet+)

| Element | Desktop | Tablet |
|---|---|---|
| Çərçivə | kənar 1 #E5E5E5 (`--site-table-border`), radius 4, `overflow: hidden` | eyni |
| Sütunlar | 440 / 260 / 282 | 300 / 160 / 202 |
| Başlıq sətri | fon #004976 (`--site-schedule-head` = brand-500), h 56, p 14/20, 16/600 lh28 ağ | h 64: 14/600 lh18, "Təqdim olunma müddəti" iki sətir (Figma `1718:30416`) |
| Qrup sətri | fon #F5F5F5, `colSpan=3`, p 16/20, 16/600 lh28, alt kənar 1 #E5E5E5 | eyni |
| Adi sətir | ağ, p 16/20, 16 lh28 #222, alt kənar 1 #E5E5E5; hündürlük mətnə görə (61/89/117) | eyni |
| Link / modal düyməsi | 16 lh24, altxətt, sonda " ↗", rəng mətn rəngi | eyni |

Semantika: `<table>` + `<caption class="sr-only">` (səhifə başlığı), `<thead>`, qrup başlığı `<th scope="colgroup" colSpan={3}>`, sütun başlıqları `<th scope="col">`.

## Mobil kartlar (<744)

| Element | Dəyər |
|---|---|
| Çərçivə | kənar 1 #E5E5E5, radius 4; başlıq sətri yoxdur |
| Qrup sətri | fon #F5F5F5, h 54, 16/600 (cədvəllə eyni) |
| Kart | p 16, aralıq 10, alt kənar 1 #E5E5E5 |
| Məzmun | 14/600 lh22 |
| Sahə bloku | etiket 12 lh16 tracking .25 (`--site-table-muted`) + dəyər 14 lh28, aralıq 2 |
| Sahələr | "Dövrilik", "Təqdim olunma müddəti" (chrome) |

Semantika: hər qrup bir `<section aria-labelledby>`, qrup adı `<h2>` (vizual olaraq qrup sətri), sətirlər `<ul>`/`<li>`, sahə blokları `<dl>` (`<dt>` etiket, `<dd>` dəyər).

## Qərarlar qrafiki modalı

| Element | Desktop / Tablet | Mobil |
|---|---|---|
| Fon | qara 50% | eyni |
| Pəncərə | 560 en, mərkəzdə, p 28/24, aralıq 20, radius 8, kölgə 0 8 32 rgba(0,0,0,.16) | tam en, aşağıya yapışıq, yuxarı radius 8, p 12/24/32, aralıq 16; tutacaq 4px mərkəzdə |
| Başlıq | 20/600 lh28 + bağlama 24 (sağ-yuxarı), aralıq 16 | eyni, başlıq sətrə bölünür |
| Alt sətir | 16 lh28, başlıqdan 4 aşağı | eyni |
| "Növbəti açıqlama" kartı | fon brand-700, p 16, aralıq 16, radius 4; ikon dairəsi 44 ağ 12%; etiket 12 lh16 tracking .25; tarix 18/500 lh24 ("29 oktyabr 2026"); növ 16 lh28; mətn ağ | eyni |
| Plitələr | `flex-wrap`, aralıq 8, 4 sütun; plitə 122×108 | 4 sütun, en `(342 − 3·8) / 4` |
| Plitə | p 12/4, aralıq 4, radius 4, mərkəzə; gün 18/500 lh24; ay 12 lh16 tracking .25; növ 12 lh16 | eyni |
| Keçmiş | fon #F5F5F5 | eyni |
| Növbəti | fon brand-700, mətn ağ | eyni |
| Gələcək | ağ, kənar 1 #E5E5E5 INSIDE | eyni |
| Alt link | "Bütün qərarlar →" 16/500 lh28 brand-700, sağa | sola |

Növ etiketi: `withPressConference` → "Press-reliz və mətbuat konfransı" / "Press release and press conference", əks halda "Press-reliz" / "Press release". Ay: `media.json` `events.monthShort.{1..12}`. Alt sətir research R14.

Davranış: kit `Dialog`, `DialogTitle` = başlıq, Escape / fon / bağlama ilə bağlanır, fokus trigger-ə qayıdır. Trigger `<a href="/{locale}/media/events?type=1">` (JS-siz fallback), hidratasiyadan sonra modal açır. Boş il: plitələr yerinə `releaseSchedule.decisions.empty` mətni. `next = null`: kart göstərilmir.

## Ünvanlar (Maddə VII.2)

| Köhnə | Yeni | Kod |
|---|---|---|
| `/page-72/{slug}`, `/az/page-72/{slug}`, `/en/page-72/{slug}` (+ `?language=en`) | `/{lang}/media/release-schedule` | 308, `legacyRedirect()` |
| `/az/melumatlarin-yayimlanmasi-qrafiki` | `/az/media/release-schedule` | 308 |
| `/en/information-disclosure-schedule` | `/en/media/release-schedule` | 308 |

Menyular (header, mega, footer, sol menyu) səhifə 130-un node-unu `/{locale}/media/release-schedule`-ə aparır; bu səhifədə node aktivdir.

## Figma-dan qəbul edilmiş fərqlər

1. **Mobil düymələr.** Figma-da "Filtrləri təmizlə" 149, "Axtar" 181 en ilə sətri doldurur; sayt Qalereya və Tədbirlərlə ortaq `ListFilter` ölçüsünü saxlayır (105 / 144, sağa). Ortaq komponent bu spec-də dəyişmir.
2. **Mobil iki görünüş.** Cədvəl və kart siyahısı ayrıca DOM-dur, biri CSS ilə gizlənir; ekran oxuyucusu yalnız görünəni oxuyur.
3. **Rənglər tokenlədir.** #004976 → `--site-schedule-head` (brand-500), #E5E5E5 → `--site-schedule-border` (neutral-200), #F5F5F5 → `site-surface-muted`.
4. **Modal hündürlüyü** məzmuna görədir; uzun ildə (12+ tarix) plitələr sürüşmür, pəncərə ekrandan hündür olarsa daxili sürüşmə ilə.
5. **Giriş mətni** CMS-dəndir; Figma-dakı cümlə redaktor yeniləyənə qədər fərqli ola bilər.
6. **Qrup başlığı semantikası.** Tablet+ `th scope="colgroup"`, mobil `h2` — hər görünüş öz strukturunda düzgündür, biri gizlənəndə digəri oxunur.
7. **Sətir yoxdursa** (API xətası və ya boş qrafik) axtarış və cədvəl render olunmur, CMS mətni olduğu kimi göstərilir (research R9) — Figma-da bu hal yoxdur.

## Ölçmə (2026-11-11, Edge, seed-li baza + 8 qərar tarixi)

| | 1728 | 744 | 390 |
|---|---|---|---|
| Məzmun eni | 984 | 664 | 342 |
| Sütunlar | 440 / 260 / 282 | 300 / 160 / 202 (Figma 204 — INSIDE stroke) | kart |
| Başlıq / qrup sətri | 56 / 61 | 64 / 61 | — / 54 |
| İlk 4 sətir | 61, 89, 89, 61 | 89, 117, 89, 61 | kart 167 |
| Axtarış sahəsi | 672×54 | 664×54 | 342×54 |
| Modal | 560×532, radius 8 | 560×532 | 390×580, yuxarı radius 8 |
| "Növbəti açıqlama" / plitə | 104 / 122×108 | 104 / 122×108 | 104 / 80×120 |

Hamısı Figma ilə eynidir; fərqlər yuxarıdakı siyahıdadır.
