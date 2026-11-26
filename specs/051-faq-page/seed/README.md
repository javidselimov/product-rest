# Spec 051 seed generator (tooling, not shipped with any component)

Builds `product-rest/api-cbar-admin/db/migrations/0033-faq-seed.sql` from the legacy FAQ CMS page (slug `sual-cavab`).

```bash
node extract-faq.mjs [page.json]   # test API (or a saved page JSON) → faq-az.json + counts.json; fails on a count mismatch
node build-seed.mjs                 # faq-az.json + topic-names-en.json [+ faq-en.json] → 0033-faq-seed.sql
```

| File | Content |
|---|---|
| `faq-az.json` | 8 topics (slug, name, legacy name), 226 questions (question text, answer HTML as the legacy editor saved it), 1 video |
| `counts.json` | questions per topic counted independently from the legacy HTML (SC-002 baseline) |
| `topic-names-en.json` | en names of the 8 topics |
| `faq-en.json` | **not present** — en translation of questions/answers is deferred (spec 051 decision 3). Same shape as `faq-az.json` (same order); when it exists `build-seed.mjs` writes the en rows too. Use it for a later seed migration with a new, unique file name — never edit an applied migration. |

Legacy markup handled by `extract-faq.mjs`: one-item `<ol>` starting with `<strong>` is a question (also `<li><p><strong>` and an answer
written inside the same `<li>`); multi-item lists are answer content. The topic name typo "məsələlərina" is fixed to the Figma spelling.
The legacy "Playlist" link is not migrated (spec 051 clarify).
