# Quickstart: Şəkilli popup-ın yoxlanması

## Ön şərtlər

- Lokalda .NET SDK yoxdur. Buna görə API-lər **test mühitində** yoxlanılır: `test` branch-i GitLab-da avtomatik deploy olunur.
- Lokalda frontend-lər deploy olunmuş test API-yə qarşı işlədilir.
- SDK olan maşında isə tam stack belə qaldırılır: `.\dev.ps1 -Seed`. Qaydası: `api-cbar-admin` → `api-cbar` → frontend-lər.
- Deploy sırası:
  1. `api-cbar-admin`: migration `0006-image-popups.sql` + CRUD;
  2. `api-cbar`: public endpoint;
  3. `web-cbar-admin-new`;
  4. `web-cbar-new`.

  Səhv sıra xəta vermir, amma ya panel 404 alır, ya da sayt popup göstərmir.
- Test şəkilləri: iki fərqli üfüqi PNG (təxminən 2:1), məsələn `popup-az.png` və `popup-en.png`. Bir də çox hündür şəkil (edge case üçün).

## 1. Avtomatik qapılar

```bash
cd product-rest/web-cbar-admin-new && npm run verify
cd product-rest/web-cbar-new && npm run verify
```

İkisi də keçməlidir (SC-006).

- **Admin testləri** (`features/image-popups/image-popups.test.tsx`): siyahı, yaratma, validasiya (şəkilsiz, səhv link), redaktə, status toggle, silmə.
- **Sayt testləri** (`widgets/image-popup/*.test.tsx`): US2-nin 1-10 ssenariləri, US3-ün 1-2 ssenariləri, `onError` halı.

## 2. API: test mühitində, curl ilə

Token `POST /api/v1/auth/login` ilə alınır. Kontraktlar: [admin-api.md](./contracts/admin-api.md), [public-api.md](./contracts/public-api.md).

| Addım | Gözlənilən |
| --- | --- |
| Hər iki şəkli `POST /api/v1/media` ilə yüklə | `id`-lər qayıdır |
| Şəkilsiz `POST /image-popups` | `400 At least one locale must have an image.` |
| `link: "javascript:alert(1)"` və ya `"//evil.com"` | `400 Link must start with …` |
| Yalnız az şəkli ilə `POST` (`isActive: true`) | `201`, `activatedAt` doludur |
| Public `GET /api/v1/image-popups?locale=az` | 1 element, `imageUrl: "/media/<az id>"` |
| Public `?locale=en` | `[]` (FR-010, fallback yoxdur) |
| Az şəklini `DELETE /api/v1/media/<id>` ilə silməyə cəhd | `409` |
| `PUT` ilə `isActive: false` | Public cavab `[]` olur |
| Köhnə yazını yenidən aktiv et; ondan sonra yaradılmış başqa yazı da aktivdir | Public cavab yenidən aktivləşdirilən yazını qaytarır (Q1, R3) |
| `audit_log` | `image_popups.create/update/delete` sətirləri var |

## 3. Admin panel: brauzerdə (`:5174`)

1. Sidebar → Media → "Şəkilli popup-lar". Siyahı açılır.
2. "Yeni":
   - az tabında şəkil, link `/az` və alt mətn daxil et;
   - en tabında başqa şəkil daxil et, link `https://www.cbar.az/en`;
   - saxla. Siyahıda fayl adı, `az` və `en` nişanları və "Aktiv" görünür.
3. Redaktəni aç. Hər tabda fayl adı görünməlidir, `#id` yox (R6).
4. Status düyməsinə bas → "Deaktiv", toast çıxır. Yenidən bas → "Aktiv".

## 4. İctimai sayt: brauzerdə

Qeyd: sayt keşi 60 saniyədir (SC-002). Admin dəyişikliyindən sonra ən çox 1 dəqiqə gözlə.

| # | Addım | Gözlənilən |
| --- | --- | --- |
| 1 | `/az` aç | Az şəkli ilə popup. Başlıq zolağı yoxdur, sağ yuxarıda dairəvi ×, arxa fon qaralıb (FR-016). Görünüş nümunə ilə eynidir |
| 2 | `/en` aç | En şəkli |
| 3 | ×, sonra F5 | Popup çıxmır |
| 4 | Menyudan başqa səhifəyə keç | Popup çıxır |
| 5 | Esc; arxa fona klik | İkisi də bağlayır və bağlanma yadda qalır |
| 6 | Şəklə klik (az, `/az`) | Eyni tabda keçid olur, geri qayıdanda popup yoxdur |
| 7 | Şəklə klik (en, xarici link) | Yeni tab açılır |
| 8 | Linki silinmiş dildə şəklə klik | Heç nə olmur, kursor adi qalır |
| 9 | Yeni tab | Popup yenidən çıxır |
| 10 | Canlı yayım da aktivdir, təmiz sessiya | Əvvəl canlı yayım açılır, × basanda şəkilli popup açılır (US3). Refresh edəndə heç biri çıxmır |
| 11 | Mobil (DevTools, 375px) | Popup kənar boşluqlarla sığır. Hündür şəkil ekrandan çıxmır (FR-017) |
| 12 | Popup-ları deaktiv et | Popup yoxdur, səhifə əvvəlki kimidir (SC-005) |
| 13 | Klaviatura: Tab | Fokus popup daxilində qalır. Ekran oxuyucu alt mətni oxuyur |
