# Implementation Plan: "Beynəlxalq əməkdaşlıq" bölməsi bölmə şablonunda

**Branch**: `043-international-cooperation` | **Date**: 2026-11-12 | **Spec**: [spec.md](./spec.md)

## Summary

Spec 028-in "yeni bölmə bir sətirdir" qaydası: `SECTION_TITLES`-ə `cooperation` açarı. Loader-də layout seçimi bölməyə görə açıq
yazılır ki, Media layout-ları yeni bölməyə keçməsin. View dəyişmir: `plain` + `section !== 'about'` → `CmsContent variant="about"`.

## Technical Context

- **Komponent**: `product-rest/web-cbar-new` (Next.js 16, FSD). API/admin/DB dəyişmir.
- **Test**: Vitest + MSW, fikstür test API-dən (2026-11-12).

## Dəyişikliklər

| Fayl | Dəyişiklik |
|---|---|
| `src/entities/page-node/lib/tree.ts` | `SectionKey` + `SECTION_TITLES.cooperation` |
| `src/views/cms-page/loader.ts` | `sectionLayout(section, slug, locale)`: about → `layoutFor`, media → `mediaLayoutFor`, qalanı `plain` |
| `src/shared/testing/fixtures/cooperation-section.ts` | az/en ağac + kök səhifə |
| `tree.test.ts`, `section-shell/model.test.ts`, `views/cms-page/cooperation.test.tsx` | davranış testləri |

## Constitution Check

FSD sərhədləri, magic number, `dangerouslySetInnerHTML` qaydası toxunulmur. Yeni layout yoxdur, layout guard-ı tələb olunmur.
