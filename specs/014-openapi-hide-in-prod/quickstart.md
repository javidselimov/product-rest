# Quickstart: OpenAPI sənədinin mühitə görə açıq/bağlı olmasını yoxlamaq

Lokalda .NET SDK yoxdur və lokal Docker yoxlaması aparılmır — backend bu maşında nə build, nə run
olunur. Compile yoxlaması GitLab pipeline-ıdır; davranış **publish-dən sonra** yoxlanılır:
`test` mühiti (`Staging` — açıq qol + drift) və ilk prod deploy-dan sonra prod (`Production` — bağlı
qol). Build və deploy GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir;
bu checkout-dan (GitHub `origin`) push heç nə deploy etmir.
Kontrakt: [contracts/openapi-document-endpoint.md](./contracts/openapi-document-endpoint.md).
Qayda: [data-model.md](./data-model.md).

```bash
probe() {  # $1 = base URL → "openapi <status> <bayt>" və "healthz <status>"
  curl -s -o /dev/null -m 15 -w "openapi %{http_code} %{size_download}B\n" "$1/openapi/v1.json"
  curl -s -o /dev/null -m 15 -w "healthz %{http_code}\n" "$1/healthz"
}
login_status() {  # $1 = base URL; $USER / $PASS — həmin mühitin hesabı
  curl -s -o /dev/null -m 15 -w 'login %{http_code}\n' -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" "$1/api/v1/auth/login"
}
```

## §1 — Baseline (dəyişiklik publish olunmamışdan əvvəl)

```bash
probe https://api-cbar-admin-test.cbar.az
# gözlənilən (2026-10-05 ölçülüb): openapi 200 155079B / healthz 200
login_status https://api-cbar-admin-test.cbar.az        # test hesabı; gözlənilən: login 200
cd product-rest/api-cbar-admin/openapi && npm ci && npm run drift > /tmp/drift-before.txt; echo "exit $?"
cd ../../.. && node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin > /tmp/route-diff-before.txt; echo "exit $?"
```

`drift-before.txt` və `route-diff-before.txt` saxlanılır — sonrakı addımlar onlarla müqayisə edir.
İki skript də hər fərqdə exit 1 verir; baseline-da exit 1 mövcud fərqlər deməkdir, xəta deyil.

## §2 — Kod review (commit-dən əvvəl; bağlı qolun prod-a qədər yeganə yoxlaması)

`Program.cs`-dəki şərti [data-model.md](./data-model.md) cədvəli ilə sətir-sətir tutuşdur:

| Mühit adı | Şərt `IsDevelopment() \|\| IsStaging()` | Gözlənilən |
|---|---|---|
| `Development` | true | 200 |
| `Staging` | true | 200 |
| `Production` | false | 404 |
| təyin olunmayıb (→ `Production`) | false | 404 |
| `Test`, `Preprod`, … | false | 404 |

Əlavə yoxla: `app.MapOpenApi()` şərtdən kənarda ikinci dəfə çağırılmır; `AddOpenApi()` dəyişməyib;
middleware sırası (`UseSerilogRequestLogging` → `MapOpenApi` → `UseCors` …) eynidir; `git diff`
`Program.cs`-də yalnız bu sətirləri (+ şərh) göstərir.

## §3 — `test` mühiti (Staging), publish-dən sonra

Əvvəlcə GitLab-da commit SHA-sı üçün build, deploy və `verify` job-larının yaşıl olduğunu yoxla —
build yaşıl = kod compile olunur (lokalda yoxlanmayıb).

```bash
probe https://api-cbar-admin-test.cbar.az
# gözlənilən: openapi 200 (~155 KB, baseline-a yaxın) / healthz 200
login_status https://api-cbar-admin-test.cbar.az        # gözlənilən: login 200 (baseline ilə eyni)
cd product-rest/api-cbar-admin/openapi && npm run drift > /tmp/drift-after.txt; echo "exit $?"
diff /tmp/drift-before.txt /tmp/drift-after.txt && echo "drift nəticəsi dəyişməyib"
```

`drift` "…/openapi/v1.json → 404" ilə `throw` edirsə — şərt `Staging`-i buraxmayıb, deploy geri alınır.
`diff` fərq göstərirsə — eyni deploy-a düşmüş başqa endpoint dəyişikliklərindən ola bilər; hər
sətri izah et, izah olunmayan fərq = dayan.

## §4 — Prod (ilk prod deploy-dan sonra, hostname resolve olunanda)

```bash
P=https://api-cbar-admin.cbar.az
probe $P
# gözlənilən: openapi 404 0B / healthz 200
curl -s -o /dev/null -w '%{http_code}\n' $P/openapi/v1.json/   # 404
curl -s -o /dev/null -w '%{http_code}\n' $P/OPENAPI/V1.JSON    # 404

# SC-003 + US1 ssenari 2: prod hesabı (Vault-dan, istifadəçidə)
TOKEN=$(curl -s -H 'Content-Type: application/json' \
  -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" $P/api/v1/auth/login \
  | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
[ -n "$TOKEN" ] && echo "login OK" || echo "login FAIL"              # §3-dəki Staging nəticəsi ilə eyni olmalıdır
curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $TOKEN" $P/openapi/v1.json   # 404
```

## §5 — Sənəd gate-i (lokal, Node — backend build tələb etmir)

```bash
cd product-rest/api-cbar-admin/openapi && npm run lint && npm run bundle
cd ../../.. && node .claude/skills/sync-openapi/scripts/route-diff.mjs api-cbar-admin > /tmp/route-diff-after.txt
diff /tmp/route-diff-before.txt /tmp/route-diff-after.txt && echo "route siyahısı dəyişməyib"
git grep -n "exposed in every environment" -- product-rest/api-cbar-admin   # boş olmalıdır (SC-004)
```
