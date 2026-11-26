# Implementation Plan: Media sorğuları — kontakt kartları CMS cədvəlindən

**Branch**: `037-media-requests` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

## Summary

Səhifə `519` mövcud Media şablonunda qalır. Dəyişiklik yalnız `web-cbar-new`-in render qatındadır: slug
`media-sorgulari` üçün yeni `media-requests` layout-u CMS HTML-ini giriş məzmunu, kontakt kartları və qalıq məzmuna ayırır.
Admin panelə yalnız roundtrip testi əlavə olunur. API, sxem və admin funksionallığı dəyişmir.

## Technical Context

**Language/Version**: TypeScript, Next.js 16, React 19

**Primary Dependencies**: `@cbar/lib-react-ui-kit` (`EnvelopeIcon`, `PhoneIcon`), mövcud `shared/lib/html-blocks`

**Storage**: Yoxdur, kartlar CMS HTML-indən hər render-də çıxarılır

**Testing**: Vitest + Testing Library (`web-cbar-new`), TipTap roundtrip (`web-cbar-admin-new`)

**Target Platform**: Public sayt, SSR

**Constraints**: Yeni client komponenti yoxdur, `dangerouslySetInnerHTML` yalnız `CmsContent`-də, magic number yoxdur

**Scale/Scope**: 1 səhifə, 2 dil

## Constitution Check

| Maddə | Vəziyyət |
|---|---|
| I `product-host` referansdır | Toxunulmur |
| II Dörd müstəqil proyekt | İki komponent, deploy asılılığı yoxdur |
| III Admin və client ayrılığı | Sayt yalnız `api-cbar`-ı oxuyur, dəyişmir |
| V Sxem və ikidillilik | Sxem dəyişmir, məzmun az/en CMS-dədir |
| VII Xarici kontraktlar | API kontraktı dəyişmir |
| VIII Real icra ilə yoxlama | `verify`, roundtrip, brauzerdə Figma ölçüsü ([quickstart.md](quickstart.md)) |

Pozuntu yoxdur.

## Project Structure

```text
product-rest/web-cbar-new/src/
├── features/about-content/model/   layouts.ts, parse.ts, types.ts, constants.ts
├── widgets/about-blocks/           contact-cards.tsx (yeni), media-requests.tsx (yeni), about-blocks.tsx
├── views/cms-page/                 loader.ts, index.tsx
├── app/cms-content.css             variant `media-requests`
└── widgets/cms-content/            variant tipi
product-rest/web-cbar-admin-new/src/features/rich-text/   roundtrip.test.ts + fixtures
```

Qərarlar: [research.md](research.md). Görünüş: [contracts/ui-contract.md](contracts/ui-contract.md). Markup:
[contracts/cms-markup.md](contracts/cms-markup.md).

## Complexity Tracking

Yoxdur.
