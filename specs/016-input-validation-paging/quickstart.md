# Quickstart: validation və səhifələmənin yoxlanması

**Mühit**: `test` (`https://api-cbar-admin-test.cbar.az`). Lokalda .NET SDK yoxdur — kod GitLab
`api-cbar-admin` repo-sunun `test` branch-inə push olunur, pipeline build edib avtomatik deploy
edir (bu checkout-dan push deploy etmir). Kontraktlar: [contracts/paging.md](./contracts/paging.md),
[contracts/validation-error.md](./contracts/validation-error.md).

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
TOKEN=$(curl -s -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"<redaktor>","password":"<parol>"}' | jq -r .accessToken)
H=(-H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json')
```

## §1 Baseline (deploy-dan ƏVVƏL, bir dəfə)

Bugünkü davranışı qeyd et ki, "500 → 400" və "dəyişməyib" iddiaları ölçülsün:

```bash
curl -s -o /dev/null -w '%{http_code}\n' "${H[@]}" "$API/press-releases?page=0"          # gözlənən: 500
curl -s "${H[@]}" "$API/press-releases?pageSize=1000000" | jq '.items|length, .pageSize'  # hamısı, 1000000
curl -s -w '\n%{http_code}\n' "${H[@]}" -X POST $API/galleries \
  -d '{"sortOrder":0,"isActive":false,"translations":{"az":{"title":"   "}}}'               # boş başlıq: 400 və ya 201? (R1 qeyri-müəyyənliyi)
```

Üçüncü sorğu 201 verərsə, yaradılmış qalereyanı sil.

## §2 Səhifələmə — 8a (US1)

13 endpoint-in hər biri üçün ([data-model.md §1](./data-model.md)):

```bash
for p in azir currency-rates/dates galleries info-lines laws meas-documents media \
         money-marks money-mark-news press-releases users videos yield-curves; do
  for q in 'pageSize=1000000' 'pageSize=0' 'pageSize=-5' 'page=0' 'page=-1' 'page=2147483647' ''; do
    r=$(curl -s -w ' %{http_code}' "${H[@]}" "$API/$p?$q")
    echo "$p?$q → ${r##* } $(echo "${r% *}" | jq -c '{n:(.items|length),page,pageSize}')"
  done
done
```

`users` admin tokeni tələb edir. Gözlənən: hər sətir `200`; `n ≤ 100`; `pageSize=1000000` →
`pageSize:100`; `pageSize≤0` → endpoint default-u; `page≤0` → `page:1`; `page=2147483647` →
`page:100000`, `n:0`. Parametrsiz sətir §1-dəki ilə eyni.

Panel: `web-cbar-admin-new` (`npm run local:testcbar`, :5175) ilə media, xəbərlər, AZIR,
info-lines siyahılarını aç, səhifələ — fərq olmamalıdır (US1.5).

## §3 Gövdə yoxlaması — 8b (US2–US4)

Hər sorğu **400** qaytarmalı, `errors`-da göstərilən açar olmalı, `message` dolu olmalı və
DB-də/audit-də heç nə dəyişməməlidir (`GET` ilə yoxla).

| # | Sorğu | Gözlənən `errors` açarı |
|---|---|---|
| a | `POST /press-releases` `translations.az.title = "   "` | `Translations[az].Title` |
| b | `POST /press-releases` başlıq 501 simvol | `Translations[az].Title` (maks 500) |
| c | `POST /press-releases` `translations.ru` | `Translations[ru]` |
| d | `POST /press-releases` `translations.AZ` | `Translations[AZ]` |
| e | a + c + `type` səhv birlikdə | hamısı bir cavabda (US2.4) |
| f | `POST /press-releases` yalnız `az` (düzgün) | **201** (US2.2) |
| g | `PUT /currency-rates` bir sətirdə `rate: 0`, birində `-1.5` | `Rates[i].Rate`, mesajda valyuta kodu; heç bir sətir saxlanılmır |
| h | `POST /users` `email: "abc"` (admin) | `Email` |
| i | `PUT /users/{id}` `email: "abc"` | `Email` |
| j | `POST /galleries` `translations: {}` | `Translations` ("At least one translation is required.") |
| k | `POST /banners` `mediaId: 999999999` | `MediaId` ("Media asset not found.") — forma problem+json |
| l | `POST /meas-documents` `dqn` 101 simvol | `Dqn` — §1-də bu 500 idi |

```bash
curl -s -w '\n%{http_code}\n' "${H[@]}" -X POST $API/press-releases \
  -d '{"type":1,"status":"draft","translations":{"az":{"title":"   "},"ru":{"title":"x"}}}' | jq .
```

Uğur yolu (US2.6): panel ilə hər bölmədə bir qeyd yarat və redaktə et — düzgün məlumatla
heç bir forma 400 almamalıdır. Panel 400-də formanın üstündə `message`-i göstərir.

## §4 Login dəyişməyib (FR-016)

```bash
curl -s -w '\n%{http_code}\n' -X POST $API/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"yoxdur","password":"x"}'     # 401 "Invalid credentials." — əvvəlki kimi
```

## §5 Uzunluqların sxemlə tutuşdurulması (R6)

`test` DB-sində (oxuma girişi ilə):

```sql
SELECT table_name, column_name, character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' AND character_maximum_length IS NOT NULL
ORDER BY 1, 2;
```

Nəticəni [data-model.md §3](./data-model.md)-dəki `L n` dəyərləri ilə tutuşdur — fərq olmamalıdır.

## §6 OpenAPI

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle && npm run contract
npm run drift   # deploy-dan sonra, test-ə qarşı
node ../../../.claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin   # route fərqi yoxdur
```
