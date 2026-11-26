# Data model — 051 Sual-cavab (FAQ)

Migration `api-cbar-admin/db/migrations/0032-faq.sql` (sxem + icazələr) və `0033-faq-seed.sql` (məzmun). Fayl adları hər iki API-də unikaldır
(`api-cbar`-da migration yoxdur). EF modeli `src/Cbar.Domain/Entities/Faq.cs` + `CbarDbContext` — **hər iki nüsxədə bayt-bayt eyni** (Maddə V.1).

## Cədvəllər

### `faq_topics`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `slug` | varchar(120) NOT NULL UNIQUE | ASCII, az addan `SlugService`; yaradıldıqdan sonra dəyişmir (R3) |
| `sort_order` | integer NOT NULL DEFAULT 0 | saytda və admin siyahısında sıra |
| `status` | `content_status` NOT NULL DEFAULT 'draft' | public yalnız `published` |
| `created_by`, `updated_by` | integer NULL | FK `users` yalnız `REFERENCES` icazəsi varsa |
| `created_at`, `updated_at` | timestamptz | `set_updated_at` trigger |
| `deleted_at` | timestamptz NULL | soft-delete; sualları olan mövzu silinmir (R11) |

İndeks: `(status, sort_order)`.

### `faq_topic_translations`

`id` bigserial PK · `topic_id` → `faq_topics` ON DELETE CASCADE · `locale` varchar(5) · `name` varchar(255) NOT NULL · UNIQUE `(topic_id, locale)`.

### `faq_topic_pages` — mövzu ↔ CMS səhifəsi (bölmə bloku)

`topic_id` → `faq_topics` ON DELETE CASCADE · `page_id` integer NOT NULL (FK `pages` yalnız icazə varsa; yoxdursa admin API id-ni özü yoxlayır) ·
`sort_order` integer NOT NULL DEFAULT 0 · PK `(topic_id, page_id)` · indeks `(page_id)`.

### `faq_questions`

| Sütun | Tip | Qayda |
|---|---|---|
| `id` | serial PK | |
| `topic_id` | integer NOT NULL → `faq_topics` | mövzu dəyişəndə sual yeni mövzunun sonuna keçir |
| `sort_order` | integer NOT NULL DEFAULT 0 | mövzu daxilində |
| `status` | `content_status` | |
| `created_by`, `updated_by`, `created_at`, `updated_at`, `deleted_at` | | `faq_topics` kimi |

İndeks: `(topic_id, status, sort_order)`.

### `faq_question_translations`

`id` bigserial PK · `question_id` → `faq_questions` ON DELETE CASCADE · `locale` varchar(5) · `question` varchar(1000) NOT NULL · `answer` text NOT NULL
(HTML, saytın rich-text redaktorunun markup-ı) · UNIQUE `(question_id, locale)`.

### `faq_videos` + `faq_video_translations`

`faq_videos`: `id` serial PK · `youtube_url` varchar(500) NOT NULL (YouTube video id-si çıxarıla bilməlidir) · `sort_order` · `status` · audit sütunları ·
`deleted_at`. `faq_video_translations`: `video_id` → CASCADE · `locale` · `title` varchar(255) NOT NULL · UNIQUE `(video_id, locale)`.

### İcazələr (0032, spec 044 kimi)

`faq.read`, `faq.create`, `faq.update`, `faq.delete` → `moderator` rolu; admin kodda hamısına malikdir. `INSERT` icazəsi yoxdursa xəbərdarlıq, API
fail-closed. `GRANT SELECT` bütün `faq_*` cədvəllərinə `cbar_web_ro`-ya.

## Görünürlük qaydaları (public, Maddə III.3)

- Mövzu: `status = published`, `deleted_at IS NULL`, həmin dildə tərcümə (ad) var **və** ən azı bir görünən sualı var.
- Sual: `status = published`, `deleted_at IS NULL`, mövzusu görünür, həmin dildə `question` və `answer` boş deyil (trim).
- Video: `status = published`, `deleted_at IS NULL`, həmin dildə başlıq var.
- Sıra: `sort_order`, sonra `id`.

## Validasiya (admin API, 400 `problem+json`, Azərbaycanca `message`)

- Mövzu: ən azı bir dildə ad; ad ≤ 255; `pageIds` mövcud, silinməmiş səhifələr; təkrar səhifə yox.
- Sual: `topicId` mövcud mövzu; ən azı bir dil tam (sual + cavab); başlanmış dil yarımçıq ola bilməz (sual var, cavab yox və ya əksinə → 400);
  sual ≤ 1000; cavab HTML səhifə məzmunu kimi saxlanır — server-side sanitizer yoxdur (`PagesController` kimi), sayt `prepareCmsHtml` ilə süzür və
  yalnız `widgets/cms-content` ilə render edir (tək HTML sink).
- Video: link YouTube (`watch?v=`, `youtu.be/`, `embed/`, `shorts/`) — id çıxmırsa 400; ən azı bir dildə başlıq.
- Sıra: `ids` massivi mövcud elementlərin tam dəsti olmalıdır (çatışmayan/artıq → 400), spec 044 `memberships/order` kimi.

## Seed (0033) — məlumat axını

`0033` yalnız `faq_topics` boşdursa işləyir (bir DO bloku). Generator `specs/051-faq-page/seed/` (R9):

```text
test API page `sual-cavab` (az HTML)
  └─ extract-faq.mjs ─► faq-az.json   { topics: [{ slug, name, questions: [{ question, answer }] }], videos: [{ url, title }] }
                        (yoxlama: mövzu sayı 8, hər mövzunun sual sayı = tək bəndli <ol><li><strong> sayı)
topic-names-en.json (8 mövzunun en adı; sual/cavab tərcüməsi təxirə salınıb — faq-en.json verilərsə generator onu da yazır)
  └─ build-seed.mjs ─► api-cbar-admin/db/migrations/0033-faq-seed.sql
```

Seed həmçinin: az başlığı yalnız köhnədirsə ("Sual − cavab") "Sual-cavab" edir; "Pul siyasəti" mövzusunu `pul-siyaseti` slug-lı səhifəyə bağlayır
(səhifə tapılmırsa keçir). FAQ səhifəsinin en tərcüməsini **yaratmır** (en məzmun hələ yoxdur).

## Saytdakı görünüş modeli (web-cbar-new, saxlanmır)

```ts
type FaqView =
  | { kind: 'all'; topics: FaqTopicView[] }                 // A
  | { kind: 'topic'; topic: FaqTopicView; topics: TopicOption[] } // B
type FaqTopicView = { slug: string; name: string; total: number; open: boolean; questions: FaqQuestionView[] }
type FaqQuestionView = { id: number; number: number; question: string; answerHtml: string; open: boolean }
```

`number` axtarışdan əvvəlki sıradandır (uyğun suallar öz nömrəsini saxlayır); `open` axtarış uyğunluğundan; `total` görünən sual sayı.
