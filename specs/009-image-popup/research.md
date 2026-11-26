# Research: Şəkilli popup

Bütün yollar `product-rest/`-ə nisbətəndir. Hamısı 2026-09-30 tarixində kodda yoxlanılıb.

## R1. Data modeli: yeni cədvəl, yoxsa `banners`?

- **Decision**: Yeni cədvəl cütü: `image_popups` və `image_popup_translations`.
- **Rationale**:
  - `banners` ana səhifədəki link zolağıdır: `HomepageController` onu `/homepage` aqreqatında qaytarır.
  - Onun şəkli dilə bağlı deyil: `banners.media_id` əsas cədvəldədir. Spec isə hər dil üçün ayrıca şəkil tələb edir (FR-002, FR-010).
  - `banners`-ə bayraq əlavə etsək, iki fərqli funksiya bir cədvəldə qarışar. Üstəlik mövcud banner-lərin semantikası dəyişər.
- **Alternatives considered**:
  - `banners` + `is_popup` bayrağı. Şəkil dilə bağlı olmadığı üçün rədd edildi.
  - `settings` cədvəlində JSON. Audit, FK və media silinmə qoruması olmadığı üçün rədd edildi.

## R2. Şəkil hansı cədvəldə saxlanılır?

- **Decision**: `image_popup_translations.media_id` (nullable FK → `media_assets`, `ON DELETE SET NULL`).
- **Rationale**: Hər dilin öz şəkli var (FR-002). Şəkli olmayan tərcümə sətri də ola bilər, məsələn yalnız alt mətn.
- **Alternatives considered**: `image_popups.media_id_az` və `media_id_en` sütunları. Bu, ikidillilik modelini pozur (Maddə V.3), ona görə rədd edildi.

## R3. "Ən sonuncu" popup necə seçilir (Q1)?

- **Decision**: `image_popups.activated_at timestamptz` sütunu olacaq. API onu bu hallarda `now()` edir:
  - yazı aktiv halda yaradılanda;
  - status `false` → `true` dəyişəndə.

  Public sıra: `activated_at DESC, id DESC`.
- **Rationale**:
  - Q1 cavabı "ən son aktiv edilən və ya yaradılan" idi.
  - `updated_at` ilə sıralasaq, köhnə aktiv popup-ın alt mətnini düzəltmək onu yenidən önə çıxarar. Bu, redaktor üçün gözlənilməzdir.
  - `id DESC` isə yenidən aktivləşdirməni nəzərə almır.
- **Alternatives considered**: `updated_at DESC` və `id DESC`. Hər ikisi yuxarıdakı səbəblərlə rədd edildi.

## R4. Public endpoint-in forması

- **Decision**: `GET api/v1/image-popups?locale=az`. Cavab sadə massivdir və **ən çox 1 element** saxlayır.
- **Rationale**:
  - `video-streams` endpoint-i də sadə massiv qaytarır, bu, həmin formaya uyğundur (`MediaContentController.cs:103`).
  - Boş halda `200 []` qayıdır. `Ok(null)` isə ASP.NET-də `204` olur və `getJson` + Zod bununla işləmir.
  - 404 isə mövcud olmayan resurs deməkdir, "hazırda popup yoxdur" halı üçün yanlış siqnaldır.
  - Massiv gələcəkdə birdən çox popup göstərmək üçün kontraktı dəyişmədən genişlənə bilər.
- **Alternatives considered**:
  - `GET /image-popups/current` + 404 və ya 204. Yuxarıdakı səbəblərlə rədd edildi.
  - `/homepage` aqreqatına əlavə etmək. Popup hər səhifədə lazımdır, ana səhifədə yox, ona görə rədd edildi.

## R5. Admin siyahısında şəkil önizləməsi

- **Decision**: Siyahıda thumbnail göstərilmir. "Şəkil" sütununda az faylının adı göstərilir, az şəkli yoxdursa en faylının adı.
- **Rationale**:
  - `api-cbar-admin` media baytlarını ümumiyyətlə qaytarmır. `MediaController`-də yalnız list, upload və delete var.
  - Paneldə `mediaUrl()` elan olunub, amma heç yerdə istifadə olunmur.
  - Bayt yalnız `api-cbar`-ın `GET /media/{id}` endpoint-indən gəlir. Panel oradan oxuya bilməz, çünki çarpaz çağırış qadağandır (Maddə III.1).
  - Admin API-yə bayt endpoint-i əlavə etmək də çətindir: JWT `Authorization` header-dədir, `<img src>` onu göndərə bilmir. Bu ayrıca işdir: bütün media modulu üçün önizləmə.
- **Spec-ə təsiri**: FR-006-da "önizləmə" sözü "şəkil faylının adı" ilə əvəz olundu.
- **Alternatives considered**:
  - Admin API-də anonim `GET /media/{id}`. Bu, auth sərhədini yumşaldır, ona görə rədd edildi.
  - Signed URL. Əhatədən kənardır.

## R6. Per-locale `media` sahəsi admin CRUD mühərrikində

- **Tapıntı**:
  - Mühərrik per-locale `media` sahəsini əsasən dəstəkləyir:
    - `field-control` `translations.<locale>.<name>`-ə bağlanır;
    - `coerceFieldValue` `media` → `number | null` çevirir;
    - `perLocale && required` "ən azı bir dil" `superRefine`-ni verir (`validation.requiredOneLocale`).
  - Bir boşluq var: `crud-form-page.tsx:280` `mediaNameKey`-i yalnız sabit yol kimi oxuyur. Per-locale sahədə fayl adı göstərilmir, yalnız `#id` görünür.
- **Decision**: `mediaNameKey`-də `{locale}` yer tutucusu dəstəklənir, məsələn `translations.{locale}.mediaName`. `crud-form-page` onu cari tabın dili ilə əvəz edir. Bu, kiçik və ümumi dəyişiklikdir, digər modullara təsir etmir: onlarda `{locale}` yoxdur.
- **Alternatives considered**: Modul üçün xüsusi form səhifəsi. Bu, Maddə VI.3-ün deklarativ CRUD prinsipinə ziddir, ona görə rədd edildi.

## R7. Keçid ünvanının yoxlanması (FR-004)

- **Decision**: Keçid ünvanı ya boşdur, ya `^https?://` ilə başlayır, ya da `/` ilə başlayır, amma `//` ilə yox.
  - Yoxlama həm panel Zod sxemində (`withLinkRule`, `youtube-url.ts` nümunəsi ilə), həm də API-də aparılır (400).
  - Uzunluq ≤ 1000 simvol, `banner_translations.link` ilə eyni.
- **Rationale**:
  - `//evil.com` protokola nisbi xarici ünvandır. Onu "saytın öz səhifəsi" kimi eyni tabda açmaq yanlış olardı.
  - `javascript:` sxemi bloklanır (XSS).
  - API yoxlaması vacibdir, çünki panel yeganə klient deyil.

## R8. Public saytda şəkil göstərilməsi

- **Decision**: Adi `<img src={mediaUrl(imageUrl)}>` istifadə olunur. `imageUrl` `/media/{id}`-dir və eyni origin proxy-dən keçir (`src/app/media/[id]/route.ts`).
- **Rationale**:
  - `next/image` ya ölçü, ya da `fill` + konteyner ölçüsü tələb edir. Popup-ın ölçüsü isə şəklin öz proporsiyasından asılıdır (FR-017), API ölçünü qaytarmır.
  - `<img>` ilə `max-w-full max-h-[85vh] w-auto h-auto` proporsiyanı təbii saxlayır.
  - Header və footer-də də adi `<img>` işlənir.
  - CSP dəyişmir: `img-src 'self'`.
- **Alternatives considered**: API-yə `width` və `height` əlavə edib `next/image` istifadə etmək. `media_assets`-də ölçü sütunu yoxdur, ona görə rədd edildi.

## R9. Dialoq görünüşü (FR-016)

- **Tapıntı**:
  - `DialogContent`-də `showCloseButton` var, default `true`.
  - Düymə `data-slot="dialog-close"` ilə `absolute top-4 right-4`-də yerləşir. `className` `cn` ilə birləşir, default `p-6 sm:max-w-lg`.
  - `DialogTitle` məcburidir (Radix a11y).
- **Decision**:
  - Kitin öz bağla düyməsi saxlanılır, çünki fokus, Esc və `dialog.close` i18n etiketi onda hazırdır. Görünüşü `[&_[data-slot=dialog-close]]:` utilitləri ilə dəyişdirilir: `top-2 right-2 size-7 rounded-full bg-white shadow opacity-100`.
  - `DialogContent`: `p-0 gap-0 w-fit max-w-[calc(100%-2rem)] sm:max-w-[min(50vw,720px)] overflow-hidden rounded-lg border-0 bg-transparent`.
  - `DialogTitle` `sr-only` olur, mətni alt mətn və ya i18n `imagePopup.title` ("Elan").
- **Alternatives considered**: Öz düyməmizi yazmaq (`showCloseButton={false}`). Bu, kitdəki a11y işini təkrarlayar, ona görə rədd edildi.

## R10. Canlı yayımla növbələşmə (Q2, FR-013)

- **Decision**: `ImagePopupDialog` avtomatik yalnız hər iki şərt ödənəndə açılır:
  1. `useLiveStreamStore.open === false`;
  2. canlı yayım yoxdur **və ya** bu səhifədə artıq bağlanıb (`isLiveStreamDismissed(liveStreamId, pathname)`).

  Effekt `[popupId, pathname, liveOpen]`-dən asılıdır. Canlı yayım bağlananda `liveOpen` `false` olur, `markDismissed` artıq yazılıb, şərt ödənir və şəkilli popup açılır.
- **Rationale**:
  - Mövcud store-u oxumaq kifayət edir. Ümumi "popup növbəsi" abstraksiyası iki popup üçün həddən artıqdır.
  - Canlı yayım kodu dəyişmir: `LiveStreamDialog` şəkilli popup-dan xəbərsizdir.
- **FSD**: `widgets/image-popup` → `features/live-stream/model` importu qanunidir (widget → feature).

## R11. Bağlanma qeydinin ümumiləşdirilməsi

- **Decision**:
  - `features/live-stream/model/dismissal.ts`-in məntiqi `shared/lib/popup-dismissal.ts`-ə köçürülür: `createPopupDismissal(prefix)` → `{ key, isDismissed, markDismissed }`.
  - Live-stream modulu köhnə adları re-export edir: `dismissalKey`, `isDismissed`, `markDismissed`. Mövcud testlər dəyişmir.
  - Şəkilli popup `cbar:image-popup:dismissed:<id>:<path>` açarını işlədir.
- **Rationale**: FR-011 eyni qaydanı ayrıca açarla tələb edir. Kodu kopyalamaq iki yerdə eyni try/catch məntiqini saxlamaq deməkdir.

## R12. Keş gecikməsi (SC-002)

- **Tapıntı**: Public sayt bütün məzmunu `cachedJson` ilə 60 saniyə keşləyir (`server/cached.ts`, `CONTENT_REVALIDATE_SECONDS`). Bu, spec 003 SC-010-da istifadəçi ilə razılaşdırılmış həddir. Canlı yayım da bu keşdən keçir.
- **Decision**: Şəkilli popup da `cachedJson(..., { keyPrefix: 'image-popups', tag: 'media' })` istifadə edir.
- **Spec-ə təsiri**: SC-002 "dərhal" yox, "ən çox 60 saniyə" kimi düzəldildi.
- **Alternatives considered**: Keşsiz `getJson`. Bu endpoint layout-da, yəni **hər** səhifə açılışında çağırılır. Keşsiz variant spec 003-ün aradan qaldırdığı fan-out-u qaytarar, ona görə rədd edildi.

## R13. RBAC (spec 008) ilə əlaqə

- **Tapıntı**: 008 hələ Draft-dır. Heç bir controller icazə atributu işlətmir, hamısında sadəcə `[Authorize]` var.
- **Decision**: Yeni controller mövcud controller-lər kimi `[Authorize]` alır. 008 implementasiya olunanda `image_popups.read|create|update|delete` icazələri onun kataloquna əlavə edilməlidir. Bu qeyd 008-in tasks-ına ötürülür.

## R14. Media silinmə qoruması

- **Tapıntı**: `api-cbar-admin` `MediaController.Delete` (l.118-133) media-nın istifadədə olub-olmadığını hər istinad cədvəli üzrə raw SQL ilə yoxlayır.
- **Decision**: `image_popup_translations` bu siyahıya əlavə olunur. Əks halda istifadədə olan şəkil silinə bilər, FK `SET NULL` olar və popup səssizcə yox olar.
