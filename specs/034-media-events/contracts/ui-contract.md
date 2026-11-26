# UI kontraktı: `web-cbar-new` və `web-cbar-admin-new`

Node-lar `spec.md` başlığındadır. Ölçülər Figma rəqəmi ilə yoxlanır (memory: DOM `getBoundingClientRect`).
Bu sənəddə olmayan ölçü implementasiya zamanı həmin node-dan oxunur. Tablet desktop ilə eynidir; mobil fərqləri (`2735:118886`, `2741:37415`, `2742:38309`) hər bölmənin sonundadır.

## 1. Route-lar

| Ünvan | Fayl | View |
|---|---|---|
| `/{locale}/media/events` | `app/[locale]/(content)/media/events/page.tsx` | `views/media-events` |
| `/{locale}/media/events/{slug}` | `.../events/[slug]/page.tsx` | `views/media-event` |

Sorğu parametrləri: `when` (`past`, default gələcək), `q`, `from`, `to`, `type`, `category`, `limit` (yalnız `past`, addım 10).
Tanınmayan dəyər atılır. Detal `pageSlug` varsa `/{locale}/{pageSlug}`-a redirect edir.

Şablon: `buildSectionShell({ section: 'media', current: { href: '/{locale}/media/events' } })`.

## 2. Menyu

- `shell/nav.ts` `FEATURE_ROUTES`: `tedbirler`, `events` → `media/events`; `entities/page-node` `isEventsNode`, `nodeHref`.
- `toSection`: bu route-un uşaqları boş (üst menyu, mobil, footer).
- `section-shell/model.ts`: bu node-un uşaqları yalnız cari səhifə həmin alt ağacdadırsa verilir. Siyahı və detalda caret də yoxdur.
- Detalda `current.href` siyahının ünvanıdır, "Tədbirlər" aktiv qalır, `trail` tədbirin başlığıdır.

## 3. Siyahı

Ardıcıllıq: H1 "Tədbirlər" (32/600, lh 44) → tablar (18/600, lh 24) → filtr → qruplar.

- **Filtr**: GET forması, bir grid: desktop-da "Axtar" birinci sətrin, "Filtrləri təmizlə" tablar sətrinin sonunda; tablet və mobildə
  ikisi filtrlərin altında ayrıca sətirdə. `when` gizli sahədir. "Təmizlə" `when`-i saxlayır.
  Tablet (`2735:33565`): axtarış tam en, tarix və növ yarı-yarıya (gap 16), sonra "Təmizlə" (304, mətn ortada) + "Axtar" (336), gap 24.
  Mobil (`2735:33766`): sahələr alt-alta gap 12, "Təmizlə" (149) + "Axtar" (181) gap 12. Sahələr → düymələr → tablar arası 16.
  Bölmə tablarının siyahısı `#F9F9F9` fondadır (`2322:5864`), desktop/tabletdə məzmun enində.
- **Nişan** (`2291:36188`, `widgets/event-tags`): boz chip, 12/500, padding 4/10. Fon `#F5F5F5`, Figma-da `#F1F2F4` (qəbul olunan fərq).
- **Bölmə tabı** (`2301:2556`): hündürlük 44, padding 18/8, radius 4, 16/500 lh 28. Aktiv: fon `#43B7A7`, mətn ağ.
- **Bölmə variantları** (`2323:124130`): 1–6 bölmə tab; 7–10 "Hamısı" + 5 + "Digər"; 10+ axtarışlı dropdown; mobil üfüqi scroll, sağda solğunlaşma.
  Tablar `Link`dir. "Digər" və dropdown minimal client komponentdir, JS-siz `<details>` + linklər ilə işləyir. Bölmə yoxdursa heç nə çıxmır.
- **Ay başlığı**: 20/600, məs. "Oktyabr 2026". Qruplaşma view-dadır (`startsOn`, başlanğıc ayı).
- **Sətir** (`2291:36176`, keçmiş `2297:4320`): en 984, padding 20, gap 20, radius 4, stroke 1 `#E5E5E5` INSIDE, ağ fon.
  - Tarix qutusu: 72×80, radius 4, fon `#F9F9F9`; gün 28/700 `#004976` (aralıqda 22/700), ay 13/500 `#787878`.
  - Info: gap 8; nişanlar gap 8; başlıq 17/600 lh 24 `#222222`; alt sətir 13/400 `#787878` (keçmiş lh 18).
  - Ox: 40×40, radius 4, fon `#F9F9F9`, `→` 16/600 `#004976`.
  - Bütün sətir bir linkdir. Alt sətir: gələcək `ClockIcon` + saat · məkan, keçmiş tarix · məkan.
  - Ay başlığı → sətir və sətir → sətir 12; qruplar arası 32; tablar → filtr 48 (mobil 32); filtr → ilk qrup 32.
  - Mobil (`2735:33808`): padding 16, gap 14, tarix qutusu 60×72 (şriftlər eyni), ox yoxdur.
- **Boş vəziyyət**: `2313:2341`, `2313:2342`; ikinci sətir keçmiş tabına linkdir.
- **"Daha çox göstər"**: yalnız `past`, `total > limit` olanda, `Link` `limit + 10`.

Tarix formatı `entities/content` `monthName` ilə. Ay qısaltmaları `locales/*/media.json`-dadır (Figma: okt, noy, dek, sen, avq, iyl, iyn, mar).

## 4. Detal

H1 "Tədbirlər" → başlıq 20/600 lh 28 → nişanlar və tarix · saat · məkan bir sətirdə (gap 12, 14/400 lh 20) → məzmun.

- **Keçmiş**: `CmsContent` + `PhotoGallery` (en 985, böyük şəkil 601 hündür, thumbnail zolağı 124).
- **Gələcək**: Tarix / Vaxt / Məkan bloku (padding 20/24, gap 40; etiket 13/400 lh 18, dəyər 16/600 lh 24, gap 4). Boş dəyərin yeri yoxdur.
  Mətn yoxdursa `2312:5705` mesajı, varsa `CmsContent`.
- Boşluqlar (`2306:84063`): başlıq → meta 24; meta → fakt bloku → mətn → qalereya 20 (qalereya qarşısında 36).
- Mobil (`2741:37972`, `2742:38866`): başlıq 18/600 lh 26; meta sətri qatlananda şaquli 8; fakt bloku padding 16, gap 24.

## 5. Ana səhifə Təqvimi

`views/home/mock.ts`-dən `EVENT_SOURCE` və `calendar` silinir. `views/home/loader.ts` `when=upcoming&pageSize=CALENDAR_EVENTS_MAX`
oxuyur, xəta boş siyahıdır. `CalendarEventTag` silinir, nişan növ etiketidir. `href`: `pageSlug` və ya detal. Vizual dəyişmir.

## 6. Figma-dan sapma

Dərc olunmuş bağlı reliz varsa mətndən (və qalereyadan əvvəl) sadə link: `t('events.pressRelease')`. Figma-da yoxdur, qərar 3.

Ölçmədə (T052, 2026-11-05) görülən, amma 034-də dəyişdirilməyən fərqlər — paylaşılan widget-lərdir:

- `section-shell` H1 mobildə 22/28, altı 32 (Figma 24/32, altı 24).
- `photo-gallery` tablet/mobildə boşluq 48 və thumbnail 124 (Figma tablet 24/87, mobil 16/69).
- Mobil bölmə tabları Figma səhifəsində iki sətrə qatlanır; `2323:124130` üzrə üfüqi scroll qalır.

## 7. Admin panel

- `features/events`: `CLAUDE.md` CRUD resepti; bir feature-də iki modul (`pages/laws` kimi), `pages/events` (`LookupGate`), `createCrudRoutes` + `registerModule`, `nav.ts`, `locales/{az,en}/`.
- Tədbir formu sırası: növ, bölmə, status, başlanğıc, bitmə, saat, per-locale başlıq və məkan, mətn, qalereya, press-reliz, CMS səhifəsi.
- Siyahı filtrləri: `type`, `status`, `categoryId`; `supportsSearch`; növ və status `badge`.
- `shared/crud`: `time` tipi və axtarışlı `select` (`research.md` R9): `types.ts`, `form-model.ts`, `schema.ts`, `field-control.tsx`.
- Status seçimində `scheduled` yoxdur. Rich text extension-larına toxunulmur, roundtrip lazım deyil.
