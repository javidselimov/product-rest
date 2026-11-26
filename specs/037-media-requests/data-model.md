# Data Model: Media sorğuları

Verilənlər bazası dəyişmir. Aşağıdakılar CMS HTML-indən render zamanı çıxarılan view model-dir.

## `ContactCard`

| Sahə | Tip | Mənbə |
|---|---|---|
| `label` | `string` | 1-ci xana, boş olmamalı |
| `value` | `string` | 2-ci xana, boş olmamalı |
| `href` | `string \| null` | 2-ci xanadakı ilk keçid: `mailto:`, `tel:`, `https:` |
| `note` | `string \| null` | 3-cü xana, boşdursa `null` |
| `kind` | `'email' \| 'phone' \| null` | research R5 |

## `AboutBlock` yeni variantı

`{ kind: 'media-requests'; introHtml: string; cards: ContactCard[]; restHtml: string }`

- `introHtml`: cədvəldən əvvəlki bloklar.
- `cards`: birinci yuxarı səviyyə cədvəl, qaydaya uyursa. Uymursa `[]` və bütün məzmun `introHtml`-dədir.
- `restHtml`: cədvəldən sonrakı bloklar.
