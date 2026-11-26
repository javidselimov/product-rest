# Lokal mühitin qaldırılması

cbar.az saytının dörd komponentini bir maşında işə salmaq üçün bələdçi.

- [Sistem necə qurulub](#sistem-necə-qurulub)
- [Tələblər](#tələblər)
- [Sürətli başlanğıc](#sürətli-başlanğıc)
- [Admin panelə giriş](#admin-panelə-giriş)
- [Əl ilə qaldırmaq](#əl-ilə-qaldırmaq)
- [Ünvanlar və giriş məlumatları](#ünvanlar-və-giriş-məlumatları)
- [Data (seed)](#data-seed)
- [Data nə vaxt itir, nə vaxt qalır](#data-nə-vaxt-itir-nə-vaxt-qalır)
- [Dayandırmaq](#dayandırmaq)
- [Problemlərin həlli](#problemlərin-həlli)

---

## Sistem necə qurulub

```
web-cbar-admin  ──JWT──▶  api-cbar-admin ──yazır──┐
(admin panel)             (CMS API)               ├─▶  PostgreSQL
                                                  │    (+ MinIO fayllar üçün)
web-cbar        ─────────▶  api-cbar   ──oxuyur───┘
(public sayt)             (public API)
```

İki API eyni bazanı bölüşür. `api-cbar-admin` sxemin sahibidir və yeganə yazma
hüququ olan servisdir; `api-cbar` isə yalnız `SELECT` icazəsi olan `cbar_web_ro`
rolu ilə qoşulur və public saytı qidalandırır.

Lokal mühitdə **iki qat** var:

| Qat | Nə işləyir | Harada |
|---|---|---|
| İnfrastruktur | Postgres, Redis, MinIO, Meilisearch, Mailpit | Docker konteynerləri |
| Tətbiq serverləri | 2 .NET API + 2 node dev server | Birbaşa maşında (konteynerdə **yox**) |

Repolarda `Dockerfile` var, amma onlar CI/deploy üçündür. Lokalda serverlər
birbaşa işlədilir ki, kod dəyişəndə hot-reload dərhal işləsin.

---

## Tələblər

| Alət | Qeyd |
|---|---|
| Docker Desktop | compose v2 ilə |
| .NET SDK 10 | `dotnet --version` → `10.x` |
| Node.js | 20+ (yoxlanılıb: 24) |
| `curl` | seed üçün. Windows 10 1803+ və macOS-da hazır gəlir |
| `lsof` | **yalnız** `dev.sh` üçün (macOS-da hazırdır, Linux-da `apt install lsof`) |

Dörd qovluq yan-yana olmalıdır — repo elə bu quruluşdadır:

```
rspackss/
  api-cbar/          public API
  api-cbar-admin/    admin API — docker-compose.yml, migrationlar, seed burdadır
  web-cbar/          Next.js public sayt
  web-cbar-admin/    React + Vite admin panel
  dev.ps1  dev.sh    bu bələdçidəki skriptlər
```

---

## Sürətli başlanğıc

**Windows:**

```powershell
.\dev.ps1 -Seed
```

**macOS / Linux:**

```bash
chmod +x dev.sh      # bir dəfəlik
./dev.sh seed
```

Skript ardıcıl olaraq: alətləri yoxlayır → Docker Desktop işləmirsə başladıb
gözləyir → konteynerləri qaldırır → Postgres qəbul edənə qədər gözləyir →
`node_modules` yoxdursa `npm install` edir → 4 portu təmizləyir → serverləri
düzgün sıra ilə qaldırıb hər birinin healthcheck-ini gözləyir → boş bazadırsa
data yükləyir.

### Bayraqlar

| Windows | macOS/Linux | Nə edir |
|---|---|---|
| `.\dev.ps1` | `./dev.sh` | Hər şeyi qaldırır (data yükləmir) |
| `.\dev.ps1 -Seed` | `./dev.sh seed` | Qaldırır və **boş** bazaya data yükləyir |
| `.\dev.ps1 -Stop` | `./dev.sh stop` | 4 serveri dayandırır, Docker qalır |
| `.\dev.ps1 -Stop -Docker` | `./dev.sh stop docker` | Hər şeyi dayandırır (volume-lara toxunmur) |
| `.\dev.ps1 -NoInstall` | — | `npm install` yoxlamasını atlayır |

Loglar `logs/` qovluğuna yazılır (`.gitignore`-dadır):
`api-admin.log`, `api-web.log`, `web-admin.log`, `web-admin-next.log`, `web-public.log`,
`web-public-next.log`.

### Yeni admin panel (`web-cbar-admin-next`)

Köhnə `web-cbar-admin` paritet təsdiqlənənə qədər işlək qalır; yeni panel
(`new-template` — CBAR React Template kopyası, `@cbar/lib-react-ui-kit`) skript
ilə **yan-yana** qaldırılır: köhnə **5173**, yeni **5174**. API-nin CORS siyasəti
yalnız 5173-ə icazə verdiyi üçün köhnə panel (API-yə birbaşa müraciət edir) o
portda qalır; yeni panel `/api`-ni Vite proxy ilə eyni mənbədən göndərdiyi üçün
portu sərbəstdir. Spec: `specs/001-admin-template-migration/`.

Quraşdırma fərqlidir — UI kit daxili Nexus-dan gəlir:

```bash
cd web-cbar-admin-next
npm run install:public      # public paketlər (VPN lazım deyil)
npm run install:nexus       # kit — VPN + .env.nexus (bax .env.nexus.example)
```

Skript `node_modules` yoxdursa bunu özü edir; `.env.nexus` yoxdursa xəbərdarlıq
verib davam edir (panel açılır, amma stilsiz). Sorğular `/api/v1/*` → Vite proxy
→ `http://localhost:5253` (`.env.development`). API-siz demo:
`VITE_ENABLE_MSW=true npm run dev`. Keyfiyyət qapısı `npm run verify`; redaktor
round-trip yoxlaması (API işləyərkən):

```bash
npm run roundtrip -- "Haqqımızda" "Pul siyasəti"
```

### Yeni public sayt (`web-cbar-next`)

Köhnə `web-cbar` paritet təsdiqlənənə qədər işlək qalır; yeni sayt (`nextjs-template`
kopyası, `@cbar/lib-react-ui-kit`) skript ilə **yan-yana** qaldırılır: köhnə **3000**,
yeni **3001**. Hər iki sayt `api-cbar`-a yalnız server tərəfdən müraciət edir, ona görə
CORS dəyişikliyi lazım deyil. Spec: `specs/002-public-site-template-migration/`.

Quraşdırma VPN tələb etmir — UI kit repo-dakı `vendor/*.tgz` arxivindən açılır:

```bash
cd web-cbar-next
npm run install:public      # public paketlər
npm run install:offline     # kit — vendor arxivindən, şəbəkəsiz
npm run dev                 # http://localhost:3001 → /az
```

Skript `node_modules` yoxdursa bunu özü edir. API ünvanı `API_URL` mühit dəyişənidir
(`.env.development`: `http://localhost:5139`); keyfiyyət qapısı `npm run verify`.
Docker image-i isə kiti Nexus-dan alır (`install:nexus`) — köhnə admin panel kimi.

Təkrar işə salmaq təhlükəsizdir — skript əvvəlcə 5253/5139/5173/5174/3000/3001 portlarında
nə varsa dayandırır, sonra qaldırır.

---

## Admin panelə giriş

http://localhost:5173

```
İstifadəçi:  admin
Şifrə:       ChangeMe123!
```

Bu istifadəçi təzə bazada `db/seed.sql` tərəfindən yaradılır (yalnız Development
mühitində). Bazada başqa istifadəçi yoxdur — yeni istifadəçiləri admin panelin
*Administration → Users* bölməsindən yaratmaq lazımdır.

Hazır rollar:

| Kod | Ad | Səlahiyyət |
|---|---|---|
| `admin` | Administrator | tam giriş — **yalnız bu rol istifadəçiləri idarə edə bilir** |
| `moderator` | Moderator | kontent |
| `meas_manager` | MEAS Manager | qiymətli kağızlar reyestri |

API-dən token almaq:

```bash
curl -X POST http://localhost:5253/api/v1/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"username":"admin","password":"ChangeMe123!"}'
```

Cavabdakı `accessToken` 15 dəqiqə etibarlıdır. Admin API-nin bütün endpoint-ləri
(login-dən başqa) bu tokeni `Authorization: Bearer <token>` başlığında gözləyir.

> ⚠️ **Bunlar yalnız lokal development üçündür.** Şifrə, JWT imza açarı
> (`appsettings.Development.json` → `Jwt:SigningKey`), baza şifrələri və MinIO
> açarları repoda açıq yazılıb. Staging və production öz sirlərini vault-dan
> almalıdır — bu dəyərlər heç bir deploy olunmuş mühitdə işlədilə bilməz.

---

## Əl ilə qaldırmaq

Skriptdən istifadə etmirsənsə, **hər addım ayrı terminalda** qalmalıdır.

### 1. İnfrastruktur

```bash
cd api-cbar-admin
docker compose up -d
```

Postgres hazır olana qədər gözlə (~5-10 saniyə):

```bash
docker exec cbar-local-postgres-1 pg_isready -U cbar -d cbar
```

### 2. Admin API — mütləq ikinci

```bash
dotnet run --project src/Cbar.AdminApi        # http://localhost:5253
```

> **Bu sıra pozula bilməz.** Admin API sxemin sahibidir: başlayanda
> `db/migrations/*.sql` faylarını tətbiq edir və baza boşdursa (yalnız
> Development mühitində) `db/seed.sql`-i işlədir. `seed.sql` isə `api-cbar`-ın
> qoşulduğu `cbar_web_ro` rolunu yaradır. Bu bitmədən `api-cbar` qaldırılsa,
> qoşula bilməyəcək.

Log-da bunu görməlisən:

```
[INF] Applying migration 0001-initial-schema.sql
[INF] Empty database — applying dev seed seed.sql
[INF] Now listening on: http://localhost:5253
```

### 3. Public API

```bash
cd ../api-cbar
dotnet run --project src/Cbar.WebApi          # http://localhost:5139
```

### 4-5. Frontendlər

Sıra fərq etmir, amma hər ikisi 2-ci addımdan sonra olmalıdır.

```bash
cd ../web-cbar-admin && npm install && npm run dev     # http://localhost:5173
cd ../web-cbar       && npm install && npm run dev     # http://localhost:3000
```

Yeni admin panel (köhnə ilə yanaşı, 5174):

```bash
cd ../web-cbar-admin-next && npm run install:public && npm run install:nexus && npm run dev   # http://localhost:5174
```

Yeni public sayt (köhnə ilə yanaşı, 3001; kit vendor arxivindən, VPN-siz):

```bash
cd ../web-cbar-next && npm run install:public && npm run install:offline && npm run dev   # http://localhost:3001
```

`npm install` yalnız birinci dəfə (və `package.json` dəyişəndə) lazımdır.

---

## Ünvanlar və giriş məlumatları

| Nə | Ünvan | Giriş |
|---|---|---|
| Public sayt (köhnə) | http://localhost:3000/az | — |
| Public sayt (yeni, `web-cbar-next`) | http://localhost:3001/az | — |
| Admin panel (köhnə) | http://localhost:5173 | `admin` / `ChangeMe123!` |
| Admin panel (yeni, `web-cbar-admin-next`) | http://localhost:5174 | `admin` / `ChangeMe123!` |
| Public API | http://localhost:5139/healthz | — |
| Admin API | http://localhost:5253/healthz | JWT (login endpoint) |
| PostgreSQL | `localhost:5433`, baza `cbar` | `cbar` / `cbar_local_dev` |
| MinIO konsol | http://localhost:9003 | `cbar` / `cbar_local_dev` |
| Meilisearch | http://localhost:7700 | master key `cbar_local_dev_master_key` |
| Mailpit | http://localhost:8025 | — |

OpenAPI sənədi: `/openapi/v1.json` — public API-də hər mühitdə, admin API-də yalnız
`Development` və `Staging`-də (prod-da yoxdur).

> Postgres 5432 yox, **5433**-dədir; MinIO 9000/9001 yox, **9002/9003**-dədir —
> həmin portlar başqa lokal proyekt tərəfindən tutulub. Ətraflı:
> [`api-cbar-admin/CREDENTIALS.md`](api-cbar-admin/CREDENTIALS.md).

Frontendlər bu API ünvanlarını default olaraq bilir, `.env` faylı lazım deyil.
Port dəyişdirsən: admin panel üçün `VITE_API_URL`, public sayt üçün `API_URL`.

---

## Data (seed)

Təzə baza **boş** olur. `seed.sql` yalnız referans data verir — locale-lər,
rollar, admin istifadəçi və 12 valyutanın adı. Heç bir kontent yoxdur, ona görə
sayt boş görünür. Bu bug deyil: public API-nin hər sorğusu `Status == Published`
+ soft-delete + `PublishedAt` embarqosu ilə süzülür, boş cədvəldən boş cavab gəlir.

### Development kontenti

Repoda hazır mock data var:

```
api-cbar-admin/db/dev/
  mock-content.sql       134 səhifə, 12 press-reliz, 11 hüquqi akt, 739 məzənnə,
                         təşkilat strukturu, pul nişanları, qalereyalar,
                         gəlirlilik əyriləri, MEAS reyestri
  placeholder-1.svg      şəkil yerinə istifadə olunan fayllar
  placeholder-2.svg
```

Yükləmək:

```powershell
.\dev.ps1 -Seed          # və ya:  ./dev.sh seed
```

Skript yalnız `pages` və `media_assets` cədvəlləri **boş** olanda seed edir.
Data varsa xəbərdarlıq verib keçir — dublikat yaranmır.

### Niyə iki addımdır

`mock-content.sql` faylında `media_assets` sətirləri **yoxdur**. Şəkillərin
baytları Postgres-də yox, MinIO-dadır. Ona görə seed belə işləyir:

1. İki SVG admin API-nin `/api/v1/media` endpoint-inə yüklənir → MinIO-ya düşür
   və `media_assets`-də **1** və **2** id-lərini alır.
2. `mock-content.sql` restore olunur — içindəki bütün `media_id` dəyərləri məhz
   bu iki id-yə istinad edir.

> Sırayı pozsan **heç bir xəta almayacaqsan**: dump `DISABLE TRIGGER ALL` ilə
> tətbiq olunur, yəni FK yoxlaması söndürülür. Sadəcə bütün şəkillər 404
> olacaq. Yoxlamaq üçün:
>
> ```bash
> curl -o /dev/null -w "%{http_code}\n" http://localhost:5139/media/1
> ```

### Əl ilə seed

```bash
cd api-cbar-admin
TOKEN=$(curl -s -X POST localhost:5253/api/v1/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"username":"admin","password":"ChangeMe123!"}' \
        | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

curl -s -X POST localhost:5253/api/v1/media -H "Authorization: Bearer $TOKEN" \
     -F "file=@db/dev/placeholder-1.svg"
curl -s -X POST localhost:5253/api/v1/media -H "Authorization: Bearer $TOKEN" \
     -F "file=@db/dev/placeholder-2.svg"

docker cp db/dev/mock-content.sql cbar-local-postgres-1:/tmp/c.sql
docker exec -i cbar-local-postgres-1 psql -U cbar -d cbar \
       --single-transaction -v ON_ERROR_STOP=1 -f /tmp/c.sql
```

> `docker cp` + `psql -f` istifadə olunur, pipe yox: fayl UTF-8-dir və pipe
> zamanı Azərbaycan hərfləri korlana bilər.

### Dump-ı yeniləmək

Bazadakı dataya əlavə etdikdən sonra:

```bash
cd api-cbar-admin
docker exec cbar-local-postgres-1 pg_dump -U cbar -d cbar \
  --data-only --no-owner --no-privileges --disable-triggers \
  --exclude-table=locales --exclude-table=roles \
  --exclude-table=permissions --exclude-table=role_permissions \
  --exclude-table=users --exclude-table=currencies \
  --exclude-table=currency_translations --exclude-table=schema_migrations \
  --exclude-table=audit_log --exclude-table=media_assets \
  --exclude-table=refresh_tokens --exclude-table=user_sessions \
  2>/dev/null > db/dev/mock-content.sql
```

Çıxarılan cədvəllər: `seed.sql`-in özünün doldurduqları, sistem cədvəlləri və
`media_assets` (yuxarıdakı səbəbə görə). `--disable-triggers` lazımdır, çünki
`pages` cədvəlində özünə istinad edən FK var (`parent_id`) və `--data-only`
dump-da sətirlərin sırası valideyn-övlad münasibətinə zəmanət vermir.

> `2>/dev/null` vacibdir — əks halda `pg_dump`-ın xəbərdarlıqları SQL faylının
> içinə düşür.

### Real kontent

Bu mock datadır, real cbar.az kontenti deyil. Repodakı `scripts/seed_*.py`
skriptləri real kontenti yükləyir, amma başqa maşındakı dump qovluqlarını
tələb edirlər və olduğu kimi işə düşmür. Real data üçün komandadan `pg_dump`
istəmək lazımdır.

---

## Data nə vaxt itir, nə vaxt qalır

Data **named volume**-lardadır, konteynerin içində deyil:

```
cbar-local_pgdata     → Postgres
cbar-local_miniodata  → MinIO faylları
cbar-local_meilidata  → Meilisearch indeksi
```

**Data qalır:**

| Əməliyyat |
|---|
| Docker Desktop-u bağlamaq / kompüteri söndürmək |
| `docker compose stop` / `restart` |
| `docker compose down` (konteynerlər silinir, volume yox) |
| `.\dev.ps1 -Stop -Docker` |

**Data silinir:**

| Əməliyyat |
|---|
| `docker compose down -v` |
| `docker volume rm cbar-local_pgdata` |
| `docker system prune --volumes` |
| Docker Desktop → *Clean / Purge data* |

Yenidən qaldıranda MigrationRunner `schema_migrations` cədvəlinə baxıb
migrationların artıq tətbiq olunduğunu görür, baza boş olmadığı üçün `seed.sql`-i
təkrar işlətmir — data dublikat olmur.

**Sıfırdan başlamaq** (bütün datanı silib təzədən qurmaq):

```powershell
.\dev.ps1 -Stop -Docker
docker volume rm cbar-local_pgdata cbar-local_miniodata
.\dev.ps1 -Seed
```

---

## Dayandırmaq

```powershell
.\dev.ps1 -Stop            # yalnız 4 server
.\dev.ps1 -Stop -Docker    # + konteynerlər
```

```bash
./dev.sh stop
./dev.sh stop docker
```

Əl ilə: hər terminalda `Ctrl+C`, sonra `cd api-cbar-admin && docker compose stop`.

> Terminal bağlansa serverlər dayanır, Docker konteynerləri isə **dayanmır** —
> onlar `-d` ilə detached rejimdə işləyir.

---

## Problemlərin həlli

### Skript işə düşmür: `dev.ps1 cannot be loaded`

Windows-da default execution policy `Restricted` ola bilər:

```powershell
powershell -ExecutionPolicy Bypass -File .\dev.ps1
```

Faylı şəbəkə ilə köçürmüsənsə, Windows onu bloklaya bilər: `Unblock-File .\dev.ps1`.
Git ilə gələndə bu problem olmur.

### `lsof: command not found` (dev.sh)

Linux-da: `sudo apt install lsof`. Windows-da `dev.sh` işləmir — `dev.ps1`
istifadə et.

### Port məşğuldur

Skript özü təmizləyir. Əl ilə:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object OwningProcess
taskkill /PID <pid> /T /F
```

```bash
lsof -ti tcp:3000 | xargs kill -9
```

> `/T` (və ya prosesin uşaqlarını öldürmək) vacibdir: `dotnet run` və
> `npm run dev` əsl serveri uşaq proses kimi yaradır. Yalnız valideyni
> öldürsən port məşğul qalır.

### `api-cbar` qalxmır

Çox güman `api-cbar-admin`-dən əvvəl başladılıb. `logs/api-web.log`-a bax.
Həlli: admin API-ni qaldır, migration/seed loglarını gözlə, sonra `api-cbar`-ı
yenidən başlat.

### Sayt açılır amma boşdur

Bazada kontent yoxdur. [`Data (seed)`](#data-seed) bölməsinə bax. Yoxlamaq:

```bash
curl "http://localhost:5139/api/v1/homepage?locale=az"
```

Cavab `{"banners":[],"newsSlider":[],...}` şəklindədirsə, baza boşdur.

### Şəkillər görünmür (404)

Seed zamanı media yüklənməyib, yəni `mock-content.sql` şəkillər MinIO-ya
düşmədən restore olunub. Ən sadə həlli — bazanı sıfırlayıb `-Seed` ilə təzədən
qurmaq (yuxarıdakı «Sıfırdan başlamaq»).

### Docker daemon işləmir

`dev.ps1` Docker Desktop-u özü tapıb başladır və gözləyir. `dev.sh` başlatmır —
macOS-da Docker Desktop-u əl ilə aç.

### `dotnet run` xəta verir

Skript alətin **mövcudluğunu** yoxlayır, **versiyasını** yox. `.NET 10` lazımdır:

```bash
dotnet --list-sdks
```

### "An Application Control policy has blocked this file" (Windows)

`logs/api-admin.log` və ya `logs/api-web.log`-da bu görünürsə:

```
Unhandled exception: An error occurred trying to start process
'...\bin\Debug\net10.0\Cbar.AdminApi.exe' ... An Application Control policy has blocked this file.
```

Windows 11-in **Smart App Control** (və ya WDAC) funksiyası `dotnet build`-in
yaratdığı imzasız `Cbar.AdminApi.exe` / `Cbar.WebApi.exe` stub-unu bloklayır. Bu,
Windows yeniləməsindən sonra əvvəl işləyən maşında da birdən başlaya bilər, çünki
qərar bulud reputasiyasına görə verilir və hər fayl üçün ayrıca hesablanır.

Hər iki API-nin csproj-unda `<UseAppHost>false</UseAppHost>` var: exe ümumiyyətlə
yaranmır, `dotnet run` tətbiqi imzalı `dotnet.exe` ilə `dotnet Cbar.AdminApi.dll`
kimi işə salır. `launchSettings.json` (port, Development mühiti) əvvəlki kimi
oxunur. Xəta yenə çıxırsa, çox güman köhnə `bin/` qalıb:

```bash
cd api-cbar-admin && rm -rf src/Cbar.AdminApi/bin src/Cbar.AdminApi/obj && dotnet build src/Cbar.AdminApi
```

Baş verib-vermədiyini Windows jurnalından görmək olar:

```powershell
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-CodeIntegrity/Operational'; Id=3077} -MaxEvents 20 |
  Select-Object TimeCreated, Message
```

Deploy-a təsiri yoxdur: `Dockerfile` onsuz da `/p:UseAppHost=false` ilə publish edir
və `ENTRYPOINT ["dotnet", "Cbar.AdminApi.dll"]` işlədir.

### `npm install` `package-lock.json`-u dəyişir

Bu npm-in öz davranışıdır. İstəmirsənsə:
`git checkout web-cbar-admin/package-lock.json`.

### Loglara baxmaq

```powershell
Get-Content logs\api-admin.log -Tail 50 -Wait
```

```bash
tail -f logs/api-admin.log
```

Konteyner logları: `docker compose -f api-cbar-admin/docker-compose.yml logs -f postgres`
