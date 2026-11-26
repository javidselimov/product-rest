# Spec 051 — "Sual-cavab" (FAQ): gündəlik və follow-up

Normativ sənədlər: `spec.md`, `plan.md`, `tasks.md` (bu qovluq). Bu fayl gündəlikdir: harada qaldıq, nə bloklanıb, sonraya nə qalıb.

## Harada qaldım

- **Son sessiya**: 2026-11-17
- **Tamamlanan**: US1–US6 (T001–T079), Polish sənədləri (T080–T085, T089). Dörd komponentdə build/verify yaşıl, testlər Node 22 ilə də:
  `web-cbar-admin-new` 65 fayl / 628 test, `web-cbar-new` 159 fayl / 1533 test. API-lər `dotnet build` + PGlite ilə yoxlanılıb, `route-diff` təmiz.
- **Commit olunmayıb.** Deploy sırası: `api-cbar-admin` (MR 1) → `api-cbar` (MR 2) → `web-cbar-admin-new` (MR 3) → `web-cbar-new` (MR 4);
  workspace sənədləri və `specs/` ayrıca commit.
- **Növbəti addım**: T086 (Figma ölçməsi), T087 (quickstart), sonra T088 (deploy-dan əvvəl).

## ⛔ Bloklanan

- **T088** — köhnə FAQ səhifəsinin canlı id-si. `web-cbar-new/src/proxy.ts` `LEGACY_FAQ_PAGE` test bazasındakı `page-131`-ə yazılıb. Canlı
  `product-host` dump-ı komandadadır; id başqadırsa regex və `proxy.test.ts` düzəldilir.
- **Canlı redaktor round-trip** (`npm run roundtrip`, T067) — lokal admin API lazımdır, bu maşında Docker işləmir. Əvəzində seed-dəki cədvəlli cavab
  `roundtrip.test.ts`-də fikstürdür.

## Alınmış qərarlar (yenidən müzakirə etmə)

- Mövzu seçimi yalnız B görünüşündədir; footer-də "Sual-cavab" linki var; hər sualın görünməz ankoru `#sual-<id>`; playlist linki yoxdur; bölmə
  səhifəsində yalnız keçid kartı (spec.md Clarifications 2026-11-17).
- En sual/cavab tərcüməsi təxirə salınıb (qərar 3): seed yalnız mövzuların en adlarını yazır, en FAQ boşdur və en səhifə öz CMS mətnini göstərir.
- Panel: `initialValues` əvəzinə deklarativ `prefillFromSearch`; sıra dialoqu və mövzunun bağlı səhifələri hər hərəkətdə dərhal saxlanır; "Saytda bax"
  linki yoxdur (panel konfiqində sayt ünvanı yoxdur).
- Yadda saxlanmamış dəyişiklik xəbərdarlığı **bütün** CRUD formalarına aiddir (T066), yalnız FAQ-a yox.
- Dil dəyişdiricisinin yönləndirməsi (`findLocaleCounterpart`) sorğunu saxlayır — bütün CMS səhifələri üçün (T077).

## Follow-up (bu spec-dən kənar)

- [ ] **Mövcud yuxarı/aşağı siyahıları `SortableList`-ə köçürmək** (admin): qalereya şəkilləri, IFI üzvlük tarixləri, KSM fotoları, heyət şəkilləri,
      səhifə faylları — beşi də öz yuxarı/aşağı düymələrini saxlayır. Hər biri ayrıca kiçik dəyişiklikdir; davranış testləri hər bölmənin öz testindədir.
- [ ] **En tərcümə**: 226 sualın en mətni. Generator `seed/build-seed.mjs` `seed/faq-en.json` (eyni forma, eyni sıra) olanda en sətirləri də yazır —
      **yeni, unikal adlı** migration ilə (tətbiq olunmuş `0033` redaktə olunmur). Alternativ: redaktorlar paneldə "Tərcümə → EN yoxdur" süzgəci ilə.
      Kütləvi tərcümə token-ağır işdir — başlamazdan əvvəl həcmi ilə razılaşdırılır.
- [ ] **Sayt axtarışı**: FAQ sualları `api-cbar` `SearchController`-də yoxdur (IFI, memorandumlar kimi). Ayrıca spec, spec-first endpoint dəyişikliyi.
- [ ] **Köhnə CMS mətni**: FAQ səhifəsinin köhnə HTML siyahısı CMS-də ehtiyat kimi qalır (FAQ boş olanda göstərilir). En tərcümə bitəndən sonra
      redaktor qərar verir: silmək və ya saxlamaq.
