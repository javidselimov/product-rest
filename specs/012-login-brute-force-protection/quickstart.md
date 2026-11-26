# Quickstart: brute-force qorumasını `test` mühitində yoxlamaq

Lokalda .NET SDK yoxdur — yoxlama deploy olunmuş **`test` mühitində** aparılır:
`https://api-cbar-admin-test.cbar.az/api/v1` (`.ci-cd/test.yaml`, `TODO(devops)`). Build və deploy
GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir; bu checkout-dan
(GitHub `origin`) push heç nə deploy etmir. Kontrakt: [contracts/auth-login.md](./contracts/auth-login.md).
Vəziyyət keçidləri: [data-model.md](./data-model.md).

## Ön şərtlər

- `curl`, `bash` (Git Bash kifayətdir).
- **Ayrıca test hesabı** — real redaktor kilidlənməsin. Admin paneldən yarat:
  `bf-test-<tarix>`, parolu bilinən (`$PASS`). Bir də admin token-i (`$ADMIN_TOKEN`) — §6 üçün.
- Deploy sırası: əvvəl `api-cbar-admin` (migration `0007` tətbiq olunur), sonra `api-cbar`
  (`Cbar.Domain` kopyası). `api-cbar`-ın `/healthz`-i yaşıl qalmalıdır.
- ⚠️ Ad üzrə limit (120 s-də 10) §2–§4-ün sorğularına da aiddir. Hər bölmədən əvvəl
  **120 s gözlə** və ya ssenarini 10 sorğudan az saxla — skriptlər buna görə qurulub.

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
USER=bf-test-20261002; PASS='<test-parolu>'

login() {  # $1 = username, $2 = password → "status time"
  curl -s -o /dev/null -w '%{http_code} %{time_total}\n' \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" "$API/auth/login"
}
```

## 1. Baseline — deploy-dan ƏVVƏL (bir dəfə)

```bash
for i in 1 2 3 4 5 6; do login "$USER" wrong; done; login "$USER" "$PASS"
```

**Gözlənilən (bugünkü sınıq vəziyyət)**: altı `401`, sonra `200` — kilid yoxdur. Nəticəni MR
təsvirinə yaz.

## 2. Kilid (US1, SC-001, SC-005) — deploy-dan sonra

```bash
# a) 4 səhv + doğru → kilid yoxdur, sayğac sıfırlanır
for i in 1 2 3 4; do login "$USER" wrong; done; login "$USER" "$PASS"      # 4×401, 200
sleep 120
# b) yenə 4 səhv + doğru → hələ də kilid yoxdur (SC-005)
for i in 1 2 3 4; do login "$USER" wrong; done; login "$USER" "$PASS"      # 4×401, 200
sleep 120
# c) 5 səhv → kilid; doğru parol rədd edilir
for i in 1 2 3 4 5; do login "$USER" wrong; done                           # 5×401
login "$USER" "$PASS"                                                      # 401 (kilidli)
```

**İlk deploy-da birinci yoxla**: (a)-dan sonra API log-unda `UPDATE … RETURNING` xətası
olmamalıdır (research R2 — EF compose riski). Varsa, işi dayandır və ehtiyat yola keç.

Log-da `Account bf-test-… locked until … after 5 failures` sətri olmalıdır (FR-012).

```bash
sleep 900; login "$USER" "$PASS"                                           # 200 (SC-001)
```

## 3. Lock oracle və cavab bərabərliyi (US2, SC-002)

Hesabı §2c kimi kilidlə (120 s gözlədikdən sonra). İki məhdudiyyət skripti formalaşdırır:
kilid 15 dəqiqədir (toplama `N × fasilə < 900 s` olmalıdır), ad üzrə limit isə 120 s-də 10.
`USER`-ə hər dövrdə 2 sorğu gedir, ona görə fasilə 28 s-dir: 30 × 28 s = 840 s, 120 s-də
`USER`-ə ~9 sorğu. `OTHER` — kilidli olmayan ikinci test hesabı; 5 səhvdə özü kilidlənməsin
deyə hər 4 dövrdə bir doğru parolla sıfırlanır (bu sorğu ölçüyə daxil deyil).
`MISSING` — heç vaxt olmamış ad.

```bash
OTHER=bf-test-other; OTHER_PASS='<OTHER-parolu>'; MISSING="nobody-$(date +%s)"; N=30
: > locked-ok.txt; : > locked-bad.txt; : > other-bad.txt; : > missing.txt
for i in $(seq $N); do
  login "$USER"    "$PASS"  >> locked-ok.txt
  login "$USER"    wrong    >> locked-bad.txt
  login "$OTHER"   wrong    >> other-bad.txt
  login "$MISSING" wrong    >> missing.txt
  [ $((i % 4)) -eq 0 ] && login "$OTHER" "$OTHER_PASS" > /dev/null
  sleep 28
done
```

Hər hansı faylda `429` görünsə, nəticə etibarsızdır — fasiləni artırıb təkrarla.

```bash
median() { awk '{print $2}' "$1" | sort -n | awk '{a[NR]=$1} END{print (NR%2 ? a[(NR+1)/2] : (a[NR/2]+a[NR/2+1])/2)}'; }
for f in locked-ok locked-bad other-bad missing; do
  echo "$f: median=$(median $f.txt)s statuses=$(awk '{print $1}' $f.txt | sort | uniq -c | tr '\n' ' ')"
done
curl -s -H 'Content-Type: application/json' -d "{\"username\":\"$USER\",\"password\":\"$PASS\"}" "$API/auth/login"
```

**Gözlənilən**: dörd qrupda yalnız `401`; istənilən iki median arasında < 0.025 s; son `curl`
gövdəsi `{"message":"Invalid credentials."}` (heç vaxt `Account temporarily locked.`).

## 4. Paralel cəhdlər (SC-004)

Hesab təmiz olsun: §3-dən qalan kilidi admin parol sıfırlaması ilə aç (§6) və ya 15 dəqiqə
gözlə, 120 s fasilə ver, sonra doğru parolla bir dəfə daxil ol. Sonra:

```bash
for i in 1 2 3 4; do login "$USER" wrong & done; wait                     # 4×401 paralel
login "$USER" wrong                                                        # 5-ci → kilid
login "$USER" "$PASS"                                                      # 401 — kilidli
```

**Gözlənilən**: son sorğu `401` — paralel 4 cəhd itmədən sayılıb. Kilid yoxdursa (son sorğu
`200`), sayğac paralellikdə itib — R2 pozulub. İstəyə görə DB-də
`SELECT failed_logins, locked_until, last_failed_login_at FROM users WHERE username = '…'`.

## 5. Ad üzrə rate limit (US3, SC-003)

Yeni, təmiz ad seç (kilidi qarışdırmamaq üçün mövcud olmayan ad kifayətdir).

```bash
RL="rl-test-$(date +%s)"
for i in $(seq 11); do login "$RL" wrong; done                              # 10×401, 1×429
curl -s -D - -o - -H 'Content-Type: application/json' \
  -d "{\"username\":\"$(echo $RL | tr a-z A-Z)\",\"password\":\"x\"}" "$API/auth/login"
login "$OTHER" "$OTHER_PASS"                                                # 200 — başqa ad təsirlənmir
sleep 120; login "$RL" wrong                                                 # 401 — pəncərə bitib
```

**Gözlənilən**: 11-ci sorğu `429`; böyük hərfli ad da `429` alır, cavabda `Retry-After`
başlığı (müsbət tam ədəd) və `{"message":"Too many login attempts. Try again later."}`;
başqa adla giriş `200`; 120 s-dən sonra yenidən `401`. Mövcud hesab adı ilə də təkrarla —
nəticə eyni olmalıdır, sayğac (`failed_logins`) 429 sorğularından artmamalıdır.

Refresh limitə düşmür (FR-011): panelə daxil ol, 11+ dəfə `POST /auth/refresh` çağır (və ya
paneldə tab-ları yenilə) — heç biri `429` almamalıdır.

## 6. Admin müdaxiləsi (SC-006)

Hesabı §2c kimi kilidlə, sonra:

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X PUT -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H 'Content-Type: application/json' -d '{"newPassword":"<yeni-parol>"}' \
  "$API/users/<id>/password"                                                 # 204/200
login "$USER" '<yeni-parol>'                                                 # 200 — gözləmədən
```

Eyni yoxlamanı deaktiv → aktiv keçidi ilə də et (`PUT /users/<id>` `isActive: false`, sonra
`true`).

## 7. Normal iş (SC-007) və panel

- Panelə (`web-cbar-admin-new`, test mühiti) real hesabla bir dəfə səhv, sonra düz parolla
  daxil ol — giriş uğurlu, "çox sorğu" yoxdur.
- Panel iş paketi deploy olunubsa: login formunda 11 dəfə səhv parol → az interfeysdə
  `auth:tooManyAttempts` mətni, en-də ingiliscə qarşılığı.

## 8. Nəticə

Hər bölmənin nəticəsini (status sayları, medianlar, log sətirləri) MR təsvirinə yaz.
`api-admin-review.md`-də #2-ni "qismən ✅ — IP limiti #5-dən sonra" kimi işarələ.
