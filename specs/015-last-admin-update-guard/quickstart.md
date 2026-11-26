# Quickstart: son admin qorumasını `test` mühitində yoxlamaq

Lokalda .NET SDK yoxdur — yoxlama deploy olunmuş **`test` mühitində** aparılır:
`https://api-cbar-admin-test.cbar.az/api/v1` (`.ci-cd/test.yaml`, `TODO(devops)`). Build və deploy
GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir; bu checkout-dan push
heç nə deploy etmir. Kontrakt: [contracts/users-update.md](./contracts/users-update.md).
Keçid cədvəli: [data-model.md](./data-model.md).

## Ön şərtlər

- `curl`, `bash` (Git Bash kifayətdir).
- `test`-də bir admin hesabı (`$A`, parolu bilinən).
- US1 üçün `test`-də `$A`-dan başqa aktiv admin olmamalıdır. Başqaları varsa, onları müvəqqəti
  deaktiv etmək komanda ilə razılaşdırılmalıdır; mümkün deyilsə §3-ü burax və MR təsvirində
  "US1 yalnız kod review ilə" yaz (research R6).
- Rol id-ləri: rollar üçün endpoint yoxdur — `GET $API/users/{id}` cavabındakı `roleId` +
  `roleCode` cütündən götür (admin üçün `$A`-nın özü, moderator üçün mövcud moderator hesabı).
  Seed sırası `admin`=1, `moderator`=2, `meas_manager`=3-dür, amma `test`-də bunu fərz etmə.
- Audit jurnalı üçün API endpoint-i yoxdur — §3.6-nın audit hissəsi `test` bazasına **yalnız
  oxuma** girişi (`psql`) tələb edir. Yoxdursa, onu burax və MR təsvirində qeyd et.

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
login() {  # $1 user, $2 pass → TOKEN
  TOKEN=$(curl -s -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" "$API/auth/login" \
    | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p'); }
put() {    # $1 id, $2 json → status + body
  curl -s -w '\n%{http_code}\n' -X PUT -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' -d "$2" "$API/users/$1"; }
```

## 1. Baseline (deploy-dan əvvəl, istəyə görə)

Yalnız bir aktiv admin olan vəziyyətdə §3.1 köhnə build-də **200** qaytarır — problemi təsdiqləyir.
Dərhal geri qaytar (`isActive: true`) — əks halda admin girişi itir (yalnız aktiv sessiya
token-i 15 dəqiqə qalır).
> Risklidir; review artıq kodda təsdiqlənib (research R1), baseline məcburi deyil.

## 2. US2 — iki aktiv admin (reqressiya)

1. `$A` ilə login; `POST $API/users` ilə `admin-guard-test` yarat (admin rolu) → `$B` id.
2. `put $B '{"email":"…","roleId":<moderator>,"isActive":true}'` → **200**.
3. `put $B '{"email":"…","roleId":<admin>,"isActive":true}'` → **200** (geri admin).
4. `put $B '{"email":"…","roleId":<admin>,"isActive":false}'` → **200**; `$B` ilə refresh uğursuz.
5. `put $B '{"email":"…","roleId":<admin>,"isActive":true}'` → **200** (aktivləşdirmə).

## 3. US1 — son aktiv admin

`$B`-ni sil (`DELETE $API/users/$B` → 204). İndi `$A` yeganə aktiv admindir (`$A_ID`, email `$A_EMAIL`).

1. `put $A_ID '{"email":"'$A_EMAIL'","roleId":<admin>,"isActive":false}'` → **409**, mesaj "Cannot deactivate or demote the last active administrator."
2. `put $A_ID '{"email":"'$A_EMAIL'","roleId":<moderator>,"isActive":true}'` → **409**.
3. `put $A_ID '{"email":"'$A_EMAIL'","roleId":<moderator>,"isActive":false}'` → **409**.
4. `put $A_ID '{"email":"yeni-'$A_EMAIL'","roleId":<moderator>,"isActive":true}'` → **409**; `GET $API/users/$A_ID` — email **dəyişməyib**.
5. `put $A_ID '{"email":"'$A_EMAIL'","roleId":<admin>,"isActive":true}'` → **200** (yalnız email/eyni dəyərlər — icazəlidir).
6. Hər 409-dan sonra: `GET $API/users/$A_ID` → `roleCode: admin`, `isActive: true`; `$A`-nın refresh-i işləyir;
   `SELECT action, created_at FROM audit_log WHERE entity_type='user' AND entity_id=$A_ID ORDER BY id DESC LIMIT 10;`
   — rədd edilən cəhdlər üçün `users.update` qeydi **yoxdur** (yalnız §3.5-in qeydi var).
7. `DELETE $API/users/$A_ID` → 409 "You cannot delete your own account." (silmə dəyişməyib).

## 4. Panel (SC-004)

`web-cbar-admin-new` (test) → İstifadəçilər → `$A`-nı aç → "Aktiv"-i götür → Saxla.
Formanın üstündə API mesajı görünür, generik "server xətası" yox; siyahıda `$A` aktiv admin qalır.

## 5. Təmizlik

Müvəqqəti deaktiv edilmiş digər adminləri geri aktivləşdir. `admin-guard-test` §3-də silinib
(username/email rezervdə qalır — növbəti dəfə başqa ad istifadə et).
