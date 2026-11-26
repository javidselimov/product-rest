# Quickstart: Müyəssərlik menyusunun yoxlanması

Kontraktlar: [public-api](./contracts/public-api.md), [admin-setting](./contracts/admin-setting.md), [widget-embed](./contracts/widget-embed.md). Data: [data-model](./data-model.md).

## 0. Ön şərtlər

- Lokalda .NET SDK yoxdur. `api-cbar` endpoint-i deploy olunmuş **test** mühitində yoxlanılır.
- Frontend-lər lokalda test API-yə qarşı işə salınır, yaxud `.\dev.ps1` ilə tam stack qaldırılır (SDK olan maşında).
- Admin: `web-cbar-admin-new` (`:5174`). Sayt: `web-cbar-new` (`:3001`).

## 1. Avtomatik gate

```bash
cd web-cbar-admin-new && npm run verify
cd web-cbar-new && npm run verify
```

İkisi də keçməlidir (SC-006). Mövcud CSP testləri (`security-headers.test.ts`, `headers.test.ts`, `proxy.test.ts`) **dəyişdirilmədən** keçməlidir.

## 2. Vendor faylı

```bash
cd web-cbar-new/public/vendor/accw
sha256sum acc-widget.min.js          # VENDOR.md-dəki "yamaqlı" dəyərlə eyni
grep -o 'accessibility.cert.gov.az[^"]*' acc-widget.min.js   # yalnız href-lərdə qalır
```

## 3. Public API (test mühiti)

```bash
curl -s https://<test-api-cbar>/api/v1/site-settings/accessibility-widget
# → {"enabled":false}  (ayar yoxdursa)
```

## 4. Uçdan-uca ssenari

| # | Addım | Gözlənilən |
| --- | --- | --- |
| 1 | Admin → Ayarlar. Kart keçidi deaktivdir. | Açar yoxdursa, "deaktiv" (US2-5) |
| 2 | Keçidi aktiv et | toast uğur, vaxt yenilənir. Ümumi cədvəldə `accessibility.widget` `{"enabled":true}` görünür |
| 3 | ≤ 60 s sonra sayt `/az` | sol aşağıda ikon, menyu az dilindədir (US1-1) |
| 4 | Dil dəyişdiricisi ilə `/en`-ə keç | tam yüklənmə olur, menyu ingiliscədir (US1-2, R4). `<html lang="en">` |
| 5 | Şrifti böyüt, başqa səhifəyə keç, səhifəni yenilə | seçim qalır (US1-3) |
| 6 | Disleksiya şriftini seç, alt səhifədə (`/az/.../...`) | şrift yüklənir, 404 yoxdur |
| 7 | Tab ilə ikona çat, Enter bas | menyu açılır, bəndlər klaviatura ilə işləyir (US1-4) |
| 8 | Tünd tema + "Yüksək kontrast" | mətn oxunaqlıdır |
| 9 | Canlı yayım popup-ı (varsa) və mobil menyu | ikon onları örtmür (FR-014) |
| 10 | Çap önizləməsi | ikon çapa düşmür |
| 11 | Admində keçidi deaktiv et, ≤ 60 s sonra sayt | HTML-də `acc-widget` teqi yoxdur. Şəbəkədə `/vendor/accw/*` sorğusu yoxdur (SC-003) |
| 12 | Admində API-ni kəs (DevTools offline), keçidi dəyiş | toast xəta, keçid əvvəlki vəziyyətdə (US2-4) |

**Hər ssenaridə DevTools**:
- konsolda CSP pozuntusu və hidratasiya xəbərdarlığı yoxdur (SC-005, R2);
- şəbəkədə `accessibility.cert.gov.az`-a sorğu yoxdur (SC-003).

## 5. Performans (SC-004)

Ana səhifədə aktiv və deaktiv halda Lighthouse (mobile) üç dəfə işə salınır. Performance medianı və LCP [research R12](./research.md)-yə qeyd olunur. Gözlənti: LCP fərqi ölçmə səsi daxilindədir.

## 6. Audit

Test bazasında:

```sql
SELECT action, before, after, created_at FROM audit_log WHERE entity_type = 'setting' ORDER BY id DESC LIMIT 5;
```

Addım 2 və 11 üçün `settings.create` / `settings.update` sətirləri görünür (US2-3).
