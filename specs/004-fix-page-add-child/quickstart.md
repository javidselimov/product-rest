# Quickstart: 004-fix-page-add-child yoxlaması

## 1. Lokal gate

```bash
cd web-cbar-admin-new
npm run verify          # lint + check:kit + check:i18n + tsc -b + test + build
```

Gözlənilən: hamısı yaşıl. Yeni testlər:
- `shared/lib/chunk-reload.test.ts`: chunk xətası → bir reload; 10 s ərzində ikinci xəta → reload yoxdur, xəta ötürülür; chunk olmayan xəta → ötürülür.
- `features/pages/model/menu-visibility.test.ts`: [data-model.md](./data-model.md) cədvəlinin hər sətri + `promotedToRoot`.
- `features/pages/pages.test.tsx`: `/pages` → "Haqqımızda" **+** → forma açılır; qaralama → "görünməyəcək: status"; "Dərc olunub" seçiləndə AZ "görünəcək", EN başlığı boş → EN "görünməyəcək: başlıq yoxdur".
- Reqressiya (SC-004): redaktorun lazy import-u rədd olunanda (test daxilində import uğursuz) xəta ekranı əvəzinə reload çağırılır. Düzəlişdən əvvəlki kodda bu test uğursuz olmalıdır.

## 2. Kök səbəbin təsdiqi (deploy olunmuş test mühiti, diaqnostika hissəsi çatandan sonra)

1. Test saytında paneli aç, Səhifələr ekranında qal. F12 → Console açıq.
2. `test` branch-ə istənilən kiçik commit push et və deploy-un bitməsini gözlə.
3. Səhifəni **yeniləmədən** "Haqqımızda" **+** düyməsinə bas.
4. **Düzəlişdən əvvəl** (yalnız diaqnostika deploy olunubsa): xəta ekranı + konsolda
   `[admin] TypeError Failed to fetch dynamically imported module …rich-text-editor-….js`.
   Başqa mətn çıxarsa, dayan və `research.md` R1-i yenilə.
5. **Düzəlişdən sonra**: səhifə bir dəfə özü yenilənir, xəta ekranı yoxdur. Token yalnız
   yaddaşda saxlandığı üçün yenilənmə login ekranına aparır
   (`/login?redirect=/pages/new?parentId=…`). Login-dən sonra eyni "Yeni səhifə" formu
   "Haqqımızda" valideyni ilə açılır.
   Addım 2–3-ü ikinci dəfə təkrarla (SC-005: iki ardıcıl deploy).
6. Network tabında `index.html` cavabında `Cache-Control: no-cache` var.

## 3. İctimai menyu (US4, SC-006)

1. Test panelində "Haqqımızda" **+** → AZ başlıq "Test bəndi 004", status **Dərc olunub**,
   bayraqlar default. Formdakı panel: AZ "görünəcək", EN "görünməyəcək — EN başlığı yoxdur".
2. Saxla. Ağacda səhifə "Haqqımızda" altındadır.
3. `web-cbar-new` test saytının `/az` səhifəsini ≤ 5 dəqiqə ərzində yenilə: üst menyuda
   "Haqqımızda" altında "Test bəndi 004" görünür; klik → səhifənin özü açılır (`/az/<slug>`, slug formda görünür).
4. `/en`: bənd görünmür (gözlənilən).
5. Təmizlik: test səhifəsini sil.
