# Admin API contract — `api-cbar-admin` (spec 051)

Spec-first: `api-cbar-admin/openapi/paths/faq.yaml` əvvəl (lint + bundle + təsdiq), sonra `FaqTopicsController`, `FaqQuestionsController`,
`FaqVideosController`. Hamısı JWT, `CbarControllerBase`, xətalar `problem+json` (`BadRequestProblem`/`ConflictProblem`/`NotFoundProblem`, Azərbaycanca
`message`), hər yazma `AuditService`-ə (`faq.topic_*`, `faq.question_*`, `faq.video_*`). İcazələr `faq.read|create|update|delete`.
Spec-first hook (`.claude/hooks/spec-first.mjs`) route-ları bundle-a qarşı yoxlayır.

## Mövzular — `/api/v1/faq/topics`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/faq/topics?page=&pageSize=&search=&status=&pageId=` | paged siyahı (`listEnvelope: 'paged'`); sətir: `id, slug, sortOrder, status, name` (az, yoxdursa en), `questionCount`, `locales: string[]`, `pages: [{id,title}]`. `pageId` → yalnız o səhifəyə bağlılar (səhifə formu kartı) |
| GET | `/api/v1/faq/topics/{id}` | detal: yuxarıdakılar + `translations: {az?:{name}, en?:{name}}`, `pageIds: int[]` |
| POST | `/api/v1/faq/topics` | `{ status, translations, pageIds }` → 201 detal; `slug` serverdə az (yoxdursa en) addan, unikal (`UniqueSlug`); `sortOrder` = max+1 |
| PUT | `/api/v1/faq/topics/{id}` | eyni body; `slug` dəyişmir |
| DELETE | `/api/v1/faq/topics/{id}` | soft-delete; silinməmiş sualı varsa **409** "Mövzuda N sual var — əvvəl onları başqa mövzuya keçirin və ya silin" |
| PUT | `/api/v1/faq/topics/order` | `{ ids: int[] }` — bütün silinməmiş mövzuların tam dəsti, yoxsa 400 |
| PUT | `/api/v1/faq/topics/{id}/questions/order` | `{ ids: int[] }` — mövzunun silinməmiş suallarının tam dəsti |

## Suallar — `/api/v1/faq/questions`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/faq/questions?page=&pageSize=&search=&topicId=&status=&missingLocale=` | `missingLocale=en` → yalnız həmin dildə tam olmayan suallar (tərcümə işi üçün). Paged; sətir: `id, topicId, topicName, sortOrder, number` (mövzu daxilində sıra, 1-dən), `status`, `question` (az, yoxdursa en), `locales` (tam dolu dillər), `incompleteLocales` (başlanmış, yarımçıq — normalda boş). `search` sual mətnində (ILIKE, az+en). Sıra: mövzunun `sort_order`-u, sonra sualın |
| GET | `/api/v1/faq/questions/{id}` | detal + `translations: {az?:{question,answer}, en?:{…}}` |
| POST | `/api/v1/faq/questions` | `{ topicId, status, translations }` → 201; `sortOrder` = mövzuda max+1 |
| PUT | `/api/v1/faq/questions/{id}` | eyni body; `topicId` dəyişibsə yeni mövzunun sonuna keçir |
| DELETE | `/api/v1/faq/questions/{id}` | soft-delete |

## Videolar — `/api/v1/faq/videos`

| Metod | Yol | İş |
|---|---|---|
| GET | `/api/v1/faq/videos?page=&pageSize=&status=` | paged; sətir: `id, youtubeUrl, youtubeId, sortOrder, status, title` |
| GET / POST / PUT / DELETE | `/api/v1/faq/videos[/{id}]` | `{ youtubeUrl, status, translations: {az?:{title}, en?:{title}} }`; link YouTube id-sinə çevrilmirsə 400 "YouTube linki tanınmadı" |
| PUT | `/api/v1/faq/videos/order` | `{ ids: int[] }` |

## Sıralama və audit

`order` endpoint-ləri bir transaksiyada `sort_order = index` yazır; audit `before: {ids}`, `after: dto` (spec 044 `ifi.membership_reorder` kimi).
