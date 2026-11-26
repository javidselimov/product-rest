# Quickstart: login vaxt bərabərliyini yoxlamaq

Lokalda .NET SDK yoxdur, ona görə yoxlama deploy olunmuş **`test` mühitində** aparılır:
`https://api-cbar-admin-test.cbar.az/api/v1` (`.ci-cd/test.yaml`, `TODO(devops)`). Build və deploy
GitLab-dakı `api-cbar-admin` repo-sunun `test` branch-indən avtomatik gedir. Bu checkout-dan
(GitHub `origin`) push heç nə deploy etmir. §2-yə keçməzdən əvvəl GitLab-da commit-in deploy
job-unun yaşıl olduğunu yoxla (tasks T007).

## Ön şərtlər

- `curl` və `bash` (Git Bash kifayətdir).
- Test mühitində üç login adı:
  - `EXISTING` — mövcud, aktiv hesab (parolu bilinən, SC-004 üçün);
  - `INACTIVE` — deaktiv edilmiş hesab (yoxdursa admin paneldən test hesabı yaradıb deaktiv et);
  - `MISSING` — heç vaxt olmamış ad, məsələn `nobody-$(date +%s)`.
- Ölçüm vaxtı test mühitində başqa yük olmasın (mümkün qədər).
- ⚠️ #2 (rate limiter) eyni MR-dadırsa: 90+ sorğu limiterə dəyə bilər. Ya limiti ölçüm müddətinə
  qaldır, ya da sorğular arasına fasilə qoy və `429` cavablarını nəticədən çıxar.

## 1. Baseline — deploy-dan ƏVVƏL

Fərqin həqiqətən mövcud olduğunu sübut etmək üçün eyni skripti dəyişiklikdən əvvəl işlət
(layihə qaydası: əvvəl ölç, sonra iddia et).

```bash
API=https://api-cbar-admin-test.cbar.az/api/v1
EXISTING=admin; INACTIVE=<deaktiv-ad>; MISSING="nobody-$(date +%s)"
N=30

probe() {  # $1 = username, $2 = password → "status time"
  curl -s -o /dev/null -w '%{http_code} %{time_total}\n' \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"$1\",\"password\":\"$2\"}" "$API/auth/login"
}

: > missing.txt; : > wrongpw.txt; : > inactive.txt
for i in $(seq $N); do            # növbələşdirilmiş sıra (research R6)
  probe "$MISSING"  'wrong-pass' >> missing.txt
  probe "$EXISTING" 'wrong-pass' >> wrongpw.txt
  probe "$INACTIVE" 'wrong-pass' >> inactive.txt
done

median() { awk '{print $2}' "$1" | sort -n | awk '{a[NR]=$1} END{print (NR%2 ? a[(NR+1)/2] : (a[NR/2]+a[NR/2+1])/2)}'; }
for f in missing wrongpw inactive; do
  echo "$f: median=$(median $f.txt)s statuses=$(awk '{print $1}' $f.txt | sort | uniq -c | tr '\n' ' ')"
done
```

**Gözlənilən (baseline)**: `wrongpw` mediani `missing` və `inactive`-dən ~0.25 s böyükdür.
Rəqəmləri MR təsvirinə yaz.

## 2. Deploy-dan SONRA — eyni skript

**Gözlənilən**:

| Yoxlama | Meyar |
|---|---|
| `missing` vs `wrongpw` median fərqi | < 0.025 s (SC-001) |
| `inactive` vs `wrongpw` median fərqi | < 0.025 s (SC-002) |
| Status kodları | üç faylda hamısı `401` (SC-003) |

## 3. Cavab gövdəsi eyniliyi (SC-003)

```bash
for u in "$MISSING" "$INACTIVE" "$EXISTING"; do
  curl -s -D - -H 'Content-Type: application/json' \
    -d "{\"username\":\"$u\",\"password\":\"wrong-pass\"}" "$API/auth/login" \
    | grep -v -i '^date:\|^x-request-id\|^traceparent'; echo; echo ---
done
```

**Gözlənilən**: üç blok `Date` və request-id kimi dəyişən başlıqlardan başqa eynidir; gövdə
`{"message":"Invalid credentials."}`.

## 4. Uğurlu login dəyişməyib (SC-004, FR-006)

```bash
: > ok.txt
for i in $(seq 10); do probe "$EXISTING" '<doğru-parol>' >> ok.txt; done
echo "ok: median=$(median ok.txt)s statuses=$(awk '{print $1}' ok.txt | sort | uniq -c)"
```

**Gözlənilən**: 10/10 `200`. Medianı baseline-ın yanına yaz. Kəskin fərq (> 0.25 s) araşdırma
səbəbidir, amma meyar deyil (SC-004).
Sonra admin paneldə (`web-cbar-admin-next`) normal giriş et və səhifəni yenilə — sessiya bərpa
olunur (refresh cookie dəyişməyib).

## 5. Log

Test mühitinin pod loglarında hər uğursuz cəhd üçün bugünkü kimi
`Login failure for <ad> from <ip>` xəbərdarlığı görünür (FR-005). Dummy hash heç bir log
sətrində yoxdur.
