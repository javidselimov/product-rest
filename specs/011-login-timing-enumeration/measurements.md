# Ölçüm nəticələri: 011-login-timing-enumeration

MR təsviri üçün mənbə. Metod: [quickstart.md](./quickstart.md), `test` mühiti
`https://api-cbar-admin-test.cbar.az/api/v1`, `curl -w '%{time_total}'`, növbələşdirilmiş sıra.

## Baseline — dəyişiklikdən ƏVVƏL (2026-10-01)

| Qrup | N | Median | Min | Max | Status |
|---|---|---|---|---|---|
| `missing` (`nobody-<timestamp>`) | 30 | 0.0506 s | 0.0375 s | 0.1473 s | 30× `401` |
| `wrongpw` (`admin` + səhv parol) | 30 | 0.3927 s | 0.3749 s | 0.4691 s | 30× `401` |

**Fərq: ~342 ms** (review-dakı ~250 ms təxminindən böyük). Gövdə hər iki halda
`{"message":"Invalid credentials."}` — fərq yalnız vaxtdadır. Fərziyyə təsdiqləndi.

Ölçülməyənlər (kredensial lazımdır, istifadəçi edəcək):
- `inactive` qrupu — test mühitində deaktiv hesab lazımdır (SC-002).
- `ok` qrupu — `admin`-in doğru parolu lazımdır (SC-004, yalnız məlumat üçün).

## Deploy-dan SONRA

_Kod GitLab `test`-də deploy olunduqdan sonra doldurulacaq (tasks T008, T009)._

| Qrup | N | Median | Status |
|---|---|---|---|
| `missing` | | | |
| `wrongpw` | | | |
| `inactive` | | | |
