# Quickstart: Mərkəzi Bankın loqosu

## 1. Avtomatik yoxlama

```bash
cd product-rest/web-cbar-new && npm run verify          # check:layout-fixtures, lint, typecheck, test:run, build
cd product-rest/web-cbar-admin-new && npm run verify    # roundtrip.test.ts brand-logos fikstürünü bayt-bayt saxlayır
```

CI Node 22 ilə işləyir, lokal Node 24-dür: testləri `npx -y node@22` ilə də işlət.

Gözlənən: `layout-fixtures.test.ts` `brand-logos` üçün `['brand-logos:4']` verir (4 versiya). Fayllar markup-da
deyil, onları `brand-logos.test.ts` ayrıca yoxlayır.

## 2. Test API ilə real səhifə

```bash
cd product-rest/web-cbar-new && npm run local:testcbar   # :3002, https://api-cbar-test.cbar.az
```

1. `http://localhost:3002/az/media/merkezi-bankin-logosu` aç. Məzmun boşdursa şablon, başlıq və sol menyu görünür, Hero və kartlar yoxdur, xəta yoxdur.
2. Test admin panelində (`npm run local:testcbar`, :5175) səhifə `553`-ü aç, `merkezi-bankin-logosu-html/az.html`-i mənbə rejiminə yapışdır, yadda saxla. Saytı yenilə: 4 versiya kartı ad və izahla, boş önizləmə qutuları ilə.
3. Hər sətrin 1-ci xanasına şəkil qoy, səhifəyə 3 fayl yüklə (adları `SVG`, `PNG`, `PDF / EPS`). Saytı yenilə: Hero birinci loqo ilə, ağ versiyalar tünd fonda, 3 yükləmə kartı ölçü ilə. Fayllar səhifənin altında ikinci dəfə görünmür.
4. Hər "Yüklə" düyməsi ilə faylı endir, adı və ölçüsü uyğun gəlir.
5. EN dilində eyni addımları `en.html` ilə et, slug `central-bank-logo`. `http://localhost:3002/en/media/central-bank-logo`.

Canlı məzmunu test mühitinə yazmaq istifadəçinin işidir. Avtomatik icra bunu etmir.

## 3. Figma ölçüləri

Edge CDP ilə 1728, 744 və 390 enində `getBoundingClientRect` ölç, `contracts/ui-contract.md` cədvəlləri ilə tutuşdur.
Test API-də məzmun hələ yoxdursa, fikstür proxy-si işlət: MSW fikstürü bu səhifənin cavabını verir, qalan sorğular test
API-yə ötürülür.

## 4. Qayda pozulanda

- Cədvələ 2 xanalı sətir əlavə et: bütün cədvəl adi cədvəl kimi görünür, fayllar yenə yükləmə kartlarıdır.
- Slug-ı müvəqqəti dəyiş: səhifə adi məzmun və adi fayl siyahısı ilə görünür.
