# Public API contract — `api-cbar` (spec 051)

Spec-first: `api-cbar/openapi/paths/faq.yaml` əvvəl yazılır (lint + bundle), sonra `FaqController` (controller-only, EF projection → anonim DTO,
`cbar_web_ro`). Mövcud endpoint-lər dəyişmir.

## `GET /api/v1/faq?locale=az|en`

FAQ səhifəsinin bütün məzmunu. `locale` default `az`, tanınmayan dəyər → `az` (mövcud controller-lər kimi).

```json
{
  "topics": [
    {
      "slug": "pul-siyaseti",
      "name": "Pul siyasəti",
      "questions": [
        { "id": 101, "question": "Pul siyasəti nədir?", "answer": "<p>Pul siyasəti əsasən …</p>" }
      ]
    }
  ],
  "videos": [
    { "id": 1, "youtubeUrl": "https://www.youtube.com/watch?v=FZrEo1nXlgs", "title": "Sığorta hadisəsi zamanı …" }
  ]
}
```

- `topics`, `questions`, `videos` — görünürlük və sıra qaydaları `data-model.md` "Görünürlük qaydaları". Boş massiv mümkündür.
- 200 həmişə (boş FAQ xəta deyil). Keş yoxdur (CMS dəyişikliyi dərhal görünür).

## `GET /api/v1/faq/topics?pageId={int}&locale=az|en`

Bir CMS səhifəsinə bağlı görünən mövzular (bölmə keçid kartı, R8), `faq_topic_pages.sort_order` sırası ilə. Yüngül forma — suallar yoxdur:

```json
[{ "slug": "pul-siyaseti", "name": "Pul siyasəti", "questionCount": 23 }]
```

`questionCount` həmin dildə görünən sualların sayıdır (0 olan mövzu qaytarılmır). `pageId` yoxdursa və ya rəqəm deyilsə → 400 `problem+json`.
Bağlı mövzu yoxdursa `[]`.

## Saytın istehlakı (web-cbar-new)

- `features/faq/api/faq.api.ts` (`server-only`): `getFaq(locale)`, `getFaqTopicsForPage(locale, pageId)`; Zod sxemləri `features/faq/model/schemas.ts`.
- MSW handler-ləri `shared/testing/handlers/faq.ts` bu formanı kodlayır; fikstür `shared/testing/fixtures/faq.ts` (seed-dən kiçik nümunə: 2 mövzu,
  cədvəlli cavab, 1 video).
