# Quickstart: token ləğvini `test` mühitində yoxlamaq

Lokalda .NET SDK yoxdur, ona görə yoxlama deploy olunmuş **`test` mühitində** aparılır:
`https://api-cbar-admin-test.cbar.az/api/v1` (`.ci-cd/test.yaml`, `TODO(devops)`). Build və
deploy GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir. Bu
checkout-dan (GitHub `origin`) push heç nə deploy etmir.
Kontrakt: [contracts/access-token.md](./contracts/access-token.md). Qaydalar:
[data-model.md](./data-model.md).

## Ön şərtlər

- `curl`, `bash` (Git Bash kifayətdir), `jq`.
- Admin hesabı (`$ADMIN_USER` / `$ADMIN_PASS`) və **ayrıca test hesabı** `rv-test-<tarix>`
  (`$USER` / `$PASS`), admin rolunda. Real redaktorun hesabı deaktiv edilmir.
- Deploy sırası belədir: əvvəl `api-cbar-admin` (migration `0007` tətbiq olunur), sonra `api-cbar`
  (`Cbar.Domain` kopyası). Hər iki `/healthz` yaşıl qalmalıdır.

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
token() {  # $1 user, $2 pass → access token
  curl -s -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" "$API/auth/login" | jq -r .accessToken
}
code() {  # $1 token, $2 path → HTTP status
  curl -s -o /dev/null -w '%{http_code}\n' -H "Authorization: Bearer $1" "$API$2"
}
ADMIN=$(token "$ADMIN_USER" "$ADMIN_PASS")
USER_ID=<test hesabının id-si>
```

## 1. Baseline: deploy-dan ƏVVƏL (bir dəfə)

```bash
T=$(token "$USER" "$PASS")
# admin olaraq test hesabını deaktiv et (panel və ya PUT /users/$USER_ID), sonra:
code "$T" /users
```

**Gözlənilən (bugünkü sınıq vəziyyət)**: `200`, çünki deaktiv hesabın tokeni işləyir. Nəticəni
MR təsvirinə yaz və hesabı yenidən aktivləşdir. Eyni anda §6-nın baseline ölçməsini də apar.

## 2. Deploy keçidi (SC-003, R7)

Deploy-dan əvvəl paneldə daxil ol və deploy-dan sonra istənilən siyahını aç.
**Gözlənilən**: giriş ekranı görünmür. DevTools Network-də bir `401`, ardınca `auth/refresh`
`200` və təkrarlanan sorğunun `200` qaytardığı görünür. Logda `stamp_missing` `Information`
səviyyəsindədir.

## 3. Deaktivasiya və silmə (US1, SC-001)

```bash
T=$(token "$USER" "$PASS"); code "$T" /users        # 200
# admin: PUT /users/$USER_ID  { email, roleId, isActive: false }
code "$T" /users                                    # 401 — dərhal, gözləmədən
# admin: yenidən aktivləşdir → köhnə T yenə 401, yeni token 200 (AS4)
code "$T" /users; code "$(token "$USER" "$PASS")" /users
```

Silmə üçün eyni ssenari `DELETE /users/$USER_ID` ilə aparılır və nəticə `401` olmalıdır (ən
sonda et, hesab geri qayıtmır). Paneldə deaktiv istifadəçinin tabı "sessiya bitdi" ilə giriş
ekranına düşür (AS2).

## 4. Parol reset (US2)

```bash
T=$(token "$USER" "$PASS")
# admin: PUT /users/$USER_ID/password { newPassword: "<yeni>" }
code "$T" /users                                    # 401
code "$(token "$USER" '<yeni>')" /users             # 200
```

## 5. Rol dəyişikliyi (US3, SC-002, SC-005)

```bash
T=$(token "$USER" "$PASS"); code "$T" /users        # 200 (admin)
# admin: rolu redaktora endir
code "$T" /users                                    # 401
```

Paneldə test hesabının tabında istifadəçilər siyahısını aç. **Gözlənilən**: giriş ekranı
görünmür. `401` → `auth/refresh` `200` → təkrar `403`, digər bölmələr isə `200` qaytarır.
Sonra admin yalnız email-i dəyişsin: yeni tokenlə sorğu `200` qalmalı, `401` gəlməməlidir
(AS3, SC-005).

Uğursuz redaktə (FR-005): son aktiv admini endirməyə cəhd et (`409`, spec 015). Həmin adminin
tokeni `200` qalmalıdır.

## 6. Xərc ölçümü (SC-004, R6)

```bash
for i in $(seq 30); do
  curl -s -o /dev/null -w '%{time_total}\n' -H "Authorization: Bearer $ADMIN" "$API/settings"
done | sort -n | sed -n 15p      # median
```

Ölçmə deploy-dan əvvəl (§1) və sonra eyni saatlarda aparılır. **Qəbul həddi**: medianın fərqi
< 10 ms. Hədd aşılarsa, rəqəmlər MR-a yazılır və keş üçün ayrıca spec açılır. Bu işdə
optimizasiya edilmir.

## 7. Log (FR-010)

Grafana-da (`Namespace cbar`, `App api-cbar-admin`) `Access token rejected` axtarılır.
**Gözlənilən**: §3–§5-in hər rəddi üçün istifadəçi id-si və səbəb görünür, tokenin və versiyanın
dəyəri isə görünmür.
