# Quickstart: uzun User-Agent-i `test` mühitində yoxlamaq

Lokalda .NET SDK yoxdur — yoxlama deploy olunmuş **`test` mühitində** aparılır:
`https://api-cbar-admin-test.cbar.az/api/v1` (`.ci-cd/test.yaml`, `TODO(devops)`). Build və deploy
GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir; bu checkout-dan
(GitHub `origin`) push heç nə deploy etmir. Kontrakt: [contracts/user-agent-header.md](./contracts/user-agent-header.md).
Kəsmə qaydası: [data-model.md](./data-model.md).

## Ön şərtlər

- `curl`, `bash` (Git Bash kifayətdir).
- Test hesabı, parolu bilinən (012-nin ad üzrə limitinə görə login-ləri 120 s-də 10-dan az saxla).
- §4 üçün `test` bazasına **yalnız oxuma** girişi (`psql`). Yoxdursa, §4-ü burax, MR təsvirində
  "saxlanan dəyər yoxlanmayıb, yalnız status + kod review" yaz (research R7).

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
USER='<test-hesabı>'; PASS='<test-parolu>'
ua() { head -c "$1" /dev/zero | tr '\0' 'a'; }       # $1 simvolluq ASCII UA

login() {  # $1 = UA → status; token-i $TOKEN-ə yazır
  local body; body=$(curl -s -w '\n%{http_code}' -A "$1" -c jar.txt \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" "$API/auth/login")
  TOKEN=$(sed -n '1s/.*"accessToken":"\([^"]*\)".*/\1/p' <<<"$body"); tail -n1 <<<"$body"
}
```

Audit olunan yazma üçün ən təhlükəsiz hədəf — test məqsədli, sonra silinən bir qeyd
(məsələn `running-lines`-da "ua-test" mətnli sətir). Konkret endpoint və gövdə `openapi/`-dən
götürülür; aşağıda `$WRITE_URL` (məs. `$API/running-lines`) / `$WRITE_BODY` kimi işarələnib.

```bash
write() {  # $1 = UA → status
  curl -s -o /dev/null -w '%{http_code}\n' -A "$1" -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' -d "$WRITE_BODY" "$WRITE_URL"
}
logout() { curl -s -o /dev/null -w '%{http_code}\n' -A "$1" -b jar.txt -X POST "$API/auth/logout"; }
```

## 1. Baseline — deploy-dan ƏVVƏL

```bash
login "$(ua 100)"; login "$(ua 501)"
```

**Gözlənilən (bugünkü sınıq vəziyyət)**: `200`, sonra `500`. Nəticəni MR təsvirinə yaz.

## 2. Status kodları (US1, SC-001) — deploy-dan sonra

```bash
for n in 100 500 501 1000 4000; do
  echo "UA=$n: login=$(login "$(ua $n)") write=$(write "$(ua $n)") logout=$(logout "$(ua $n)")"
done
```

**Gözlənilən**: hər sətirdə login `200`, write uğurlu status (qısa UA ilə eyni), logout `204`. Heç bir `500`.

## 3. Surrogate kənarı (research R3)

499 ASCII + 4 baytlıq emoji: 500-cü UTF-16 vahidi emoji-nin ilk yarısına düşür.

```bash
EMOJI_UA="$(ua 499)😀tail"
login "$EMOJI_UA"; write "$EMOJI_UA"
```

**Gözlənilən**: `200` və uğurlu write. Baseline-da (deploy-dan əvvəl) də bunu bir dəfə işlət və
nəticəni yaz — Npgsql-in tək surrogate-də xəta atıb-atmadığını göstərir (R3 iddiasının ölçüsü).

## 4. Saxlanan dəyər (SC-002, SC-003, SC-004) — DB girişi varsa

```sql
SELECT a.action, length(a.user_agent) AS audit_len,
       length(r.user_agent) AS rt_len, a.user_agent = r.user_agent AS same
FROM audit_log a
LEFT JOIN LATERAL (
  SELECT user_agent FROM admin_refresh_tokens t
  WHERE t.user_id = a.actor_id AND t.created_at BETWEEN a.created_at - interval '5 s' AND a.created_at + interval '5 s'
  ORDER BY t.created_at DESC LIMIT 1) r ON a.action = 'auth.login'
WHERE a.created_at > now() - interval '30 min'
ORDER BY a.id DESC LIMIT 30;
```

**Gözlənilən**:
- 501/1000/4000 UA-lı qeydlərdə `audit_len = 500` (SC-002); 100/500-də göndərilən uzunluq (SC-003).
- Emoji halında `audit_len = 499` — tək surrogate saxlanmayıb.
- `auth.login` sətirlərində `same = true` (SC-004).

## 5. Təmizlik

§2-də yaradılan test qeydlərini admin paneldən sil.
