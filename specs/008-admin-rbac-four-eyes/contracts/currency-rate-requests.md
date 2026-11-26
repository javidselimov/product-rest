# Contract: Məzənnə four-eyes (1b) — `api-cbar-admin`

Spec-first: `openapi/paths/statistics.yaml` (`rateSheet`) dəyişir, yeni `rateRequests` açarı
əlavə olunur. Bu, koddan əvvəl edilir.

**Public kontrakt dəyişmir.** `api-cbar` `GET /currencies/{DD.MM.YYYY}.xml` və digər məzənnə
endpoint-ləri yalnız `currency_rates`-i oxuyur. Gözləyən dəyər ora düşmür (research R9).
SC-005 bunu bayt-bayt müqayisə ilə yoxlayır.

## 1. `PUT /api/v1/currency-rates` — `currency_rates.prepare` (semantika dəyişir)

Request gövdəsi dəyişmir: `{ "date": "2026-10-10", "rates": [{ "currencyCode": "USD", "rate": 1.7 }] }`.
Mövcud yoxlamalar (boş siyahı, təkrar kod, naməlum kod → 400) olduğu kimi qalır.

| Əvvəl | İndi |
|---|---|
| 204, dəyər dərhal `currency_rates`-də | **202** + tələb, `currency_rates` dəyişmir |

```json
202 { "id": 41, "date": "2026-10-10", "kind": "correction", "status": "pending",
      "preparedBy": { "id": 7, "username": "mod1" }, "preparedAt": "…", "supersedes": 38 }
```

`kind`: həmin gün üçün təsdiqlənmiş vərəq varsa `correction`, yoxdursa `new` (FR-016).
`supersedes` həmin gün üçün əvəz olunan köhnə `pending` tələbin id-sidir, yoxdursa `null`.
Eyni gün üçün paralel göndəriş **409** alır (`DbExceptionHandler`, partial unique index). Klient yenidən göndərə bilər.
`Location: /api/v1/currency-rate-requests/41`.

## 2. `DELETE /api/v1/currency-rates?date=` — `currency_rates.prepare` (semantika dəyişir)

- Həmin gün üçün təsdiqlənmiş vərəq yoxdursa, 404 qaytarılır (bu gün olduğu kimi).
- Əks halda **202** və `kind: "delete"` olan tələb qaytarılır (§1 forması). Vərəq hələ silinmir.
- Paralel göndərişdə 409 qaytarılır (§1 ilə eyni).

## 3. `GET /api/v1/currency-rates` və `/dates` — dəyişmir

Yalnız təsdiqlənmiş məlumatı göstərir.

## 4. `GET /api/v1/currency-rate-requests` (yeni) — `currency_rates.read`

Query: `status` (`pending` default; `approved|returned|superseded|all`), `date`, `page`, `pageSize`.
Sıralama: `pending` üçün `prepared_at ASC` (ən uzun gözləyən əvvəl), qalanları üçün `DESC`.

```json
200 { "items": [ { "id": 41, "date": "2026-10-10", "kind": "new", "status": "pending",
                   "preparedBy": { "id": 7, "username": "mod1" }, "preparedAt": "…",
                   "decidedBy": null, "decidedAt": null } ],
      "total": 1, "page": 1, "pageSize": 20 }
```

## 5. `GET /api/v1/currency-rate-requests/{id}` (yeni) — `currency_rates.read`

```json
200 { "id": 41, "date": "2026-10-10", "kind": "correction", "status": "returned",
      "rates":     [ { "currencyCode": "USD", "rate": 1.7000 } ],
      "published": [ { "currencyCode": "USD", "rate": 1.6995 } ],
      "preparedBy": { … }, "preparedAt": "…",
      "decidedBy": { "id": 1, "username": "admin" }, "decidedAt": "…",
      "returnReason": "USD yanlışdır", "supersededBy": null }
```

- `published` göstərmə anında `currency_rates`-dəki cari dəyərlərdir, diff ekranı üçündür.
  Qərar verilmiş tələblərdə isə qərar anındakı `before` qaytarılır.
- `rates` `kind: "delete"` olanda `null`-dur.
- Tələb yoxdursa, 404 qaytarılır.

## 6. `POST /api/v1/currency-rate-requests/{id}/approve` (yeni) — `currency_rates.approve`

Gövdə yoxdur. Versiya id-nin özüdür (research R9).

| Vəziyyət | Status | `message` |
|---|---|---|
| Uğur: dəyişiklik `currency_rates`-ə tətbiq olunur, audit yazılır | **200** + §5 forması (`status: "approved"`) | — |
| Çağıran hazırlayandır (admin olsa belə) | **403** | `"The preparer of a rate request cannot approve it."` |
| Tələb `pending` deyil (təsdiqlənib, qaytarılıb, əvəz olunub) | **409** | `"This request is no longer pending."` |
| Tələb yoxdur | 404 | |
| Təsdiq anında valyuta kodu artıq mövcud deyil (`is_active` yoxlanmır, bugünkü `PUT` kimi) | 409 | `"Unknown currency codes: …"` |

Self-approval-un 403-ü `message` daşıyır, ona görə `title`-ı qalır (`CbarControllerBase.ErrorProblem`).
Panel icazə 403-ündən fərqli olaraq səbəbi göstərə bilir.

## 7. `POST /api/v1/currency-rate-requests/{id}/return` (yeni) — `currency_rates.approve`

```json
{ "reason": "USD yanlışdır" }
```

| Vəziyyət | Status |
|---|---|
| Uğur | 200 + §5 forması (`status: "returned"`) |
| `reason` boşdur, yalnız boşluqdur və ya 1000 simvoldan uzundur | 400 (`FieldValidationProblem`, `errors.reason`) |
| Çağıran hazırlayandır | 403 (§6 ilə eyni mətn, "return" ilə) |
| `pending` deyil | 409 |

## 8. İnvariantlar (quickstart-da yoxlanılır)

1. `approved` olmayan heç bir tələbin dəyəri `currency_rates`-də olmur.
2. Hər `rate_date` üçün ən çox bir `pending` tələb olur.
3. `decided_by <> prepared_by` həmişə doğrudur (DB `CHECK`).
4. Bir tələb ən çox bir dəfə qərar alır. İki paralel `approve`-dan biri 200, digəri 409 alır.
5. 1b deploy olunanda mövcud bütün `currency_rates` sətirləri dəyişmir. XML feed hər tarix
   üçün deploy-dan əvvəlki cavabı bayt-bayt qaytarır.
