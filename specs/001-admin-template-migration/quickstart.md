# Quickstart: `web-cbar-admin-next` — icra və verification bələdçisi

Spec: [spec.md](./spec.md) | Plan: [plan.md](./plan.md) | Kontraktlar: [contracts/](./contracts/)

Bu sənəd feature-in **işlədiyini sübut edən** ssenariləri verir. İmplementasiya detalları
`tasks.md`-dədir.

## 1. Ön şərtlər

- Docker, .NET SDK, Node 22, npm; CBAR daxili şəbəkə/VPN + `web-cbar-admin-next/.env.nexus`
  (kit `@cbar/lib-react-ui-kit` Nexus-dan gəlir — `README §Quraşdırma`).
- Boş baza + seed + mock content (`GUIDE.md`): `.\dev.ps1 -Seed` və ya `./dev.sh seed`.
  Placeholder şəkillər (media id 1, 2) → `mock-content.sql` sırası pozulmasın.
- Giriş: `admin / ChangeMe123!` (`api-cbar-admin/CREDENTIALS.md`).

## 2. Quraşdırma və işə salma

```powershell
# Bir dəfə
cd web-cbar-admin-next
npm run install:public          # public paketlər
npm run install:nexus           # kit (VPN + .env.nexus)

# Bütün stack (köhnə panel 5173, yeni panel 5174 — yan-yana)
cd ..
.\dev.ps1                       # macOS/Linux: ./dev.sh
# Tək panel: cd web-cbar-admin-next && npm run dev   (API :5253 işləməlidir)
```

Yeni panel `http://localhost:5174`, köhnə `http://localhost:5173`; sorğular `/api/v1/*` →
Vite proxy → `http://localhost:5253`.
`logs/web-admin.log`-a yazılır. MSW ilə API-siz demo: `VITE_ENABLE_MSW=true npm run dev`.

## 3. Merge gate (hər faza sonunda)

```bash
cd web-cbar-admin-next
npm run verify        # eslint → tsc -b → vitest run → vite build — hamısı 0 exit
npm audit --audit-level=high    # critical/high = 0 (TipTap əlavəsindən sonra)
node scripts/check-kit-only.mjs # hex/rgb/oklch/bg-<rəng>-N və kit-dən kənar UI import-u = 0 (src/index.css istisna)
```

`roundtrip.test.ts` verify-in içindədir; canlı yoxlama (API işləyir):

```bash
npm run roundtrip -- "Haqqımızda" "Pul siyasəti"    # exit 0, "mismatches: 0"
```

## 4. Uçdan-uca ssenarilər (əl ilə, real API)

| # | Ssenari | Addımlar | Gözlənilən |
| --- | --- | --- | --- |
| Q1 | Giriş və qabıq (US1) | `/laws` aç → login-ə düşür → `admin` ilə gir | `/laws`-a qayıdır; sidebar 5 qrup; üst paneldə `admin`; tema/dil keçidi bütün paneli dəyişir; dar ekranda menyu çekmecədə |
| Q2 | Sessiya bitir (US1) | Gir, 15 dəq gözlə (və ya `Jwt:AccessTokenMinutes=1` ilə API) | Toast "sessiya bitdi", login səhifəsi, tam səhifə yenilənməsi yox; girişdən sonra əvvəlki ünvan |
| Q3 | Yanlış şifrə | `admin / yanlış` | Formda "istifadəçi adı və ya şifrə yanlışdır"; 5xx-də fərqli mesaj |
| Q4 | Konfiq CRUD (US2) | `/laws/categories` → Yeni → yalnız AZ ad → Saxla → siyahı → Redaktə → EN əlavə et → Saxla → Sil | Toast-lar; siyahıda ad; `/laws` formunda kateqoriya seçimi dərhal yeni adı göstərir (B1); silmə dialoqu adı göstərir |
| Q5 | Paged siyahı | `/laws` → axtarış yaz → filtr seç → səhifə 2 | URL `?search=…&status=…&page=2`; reload eyni vəziyyət; axtarış dəyişəndə `page` silinir; "N qeyd · səhifə X / Y" |
| Q6 | Validasiya | `/laws/new` → hər iki başlıq boş → Saxla | Sorğu getmir; AZ/EN tab nişanı qırmızı; "ən azı bir dildə başlıq" |
| Q7 | Media sahəsi + embarqo | `/homepage-blocks/banners/new` → Şəkil seç (seçici: axtarış, səhifələmə) → başlama/bitmə tarixi → Saxla | Siyahıda şəkil adı, tarixlər formatlı |
| Q8 | Səhifə ağacı (US3) | `/pages` → EN keçid → "Alt səhifə" → forma → Saxla → "Köçür" → valideyn seç | Ağac yenilənir; `removable=false` sətirdə Sil qeyri-aktiv; köçürmə dialoqunda öz/nəsil seçilmir; uşaqlı silmədə say |
| Q9 | Round-trip | "Haqqımızda" aç → heç nə dəyişmə → Saxla → `npm run roundtrip` | mismatches 0; accordion/cədvəl/iframe/media link sayları eyni |
| Q10 | Redaktor əməlləri | Səhifə formu: accordion, cədvəl + sətir/sütun, link dialoqu, fayl, şəkil, rəng, hizalama, önizləmə, HTML mənbə, tam ekran | Hər əməl HTML-də əks olunur; önizləmə saytabənzər; `readonly` səhifədə alət paneli sönülü |
| Q11 | Səhifə sənədləri | Sənəd əlavə et (AZ/EN başlıq + qrup) → yuxarı/aşağı → başlıq redaktə → ayır | Sıra dərhal dəyişir (PUT order tam siyahı); ayırma təsdiqlə |
| Q12 | Məzənnə vərəqi (US4) | `/currency-rates` → Yeni vərəq → tarix → USD dəyişdir → EUR sil → GBP əlavə → Saxla → Tarixlər çekmecəsi | "saxlanılmayıb" işarəsi; təkrar kod xətası; boş rate xətası; çekmecədə yeni tarix və say |
| Q13 | Valyuta siyahısı | `/currency-rates/currencies` → 3 sətirdə sıra/aktiv/ana səhifə dəyiş → "Saxla (3)" | Dəyişmiş sətirlər vurğulu; 3 PUT; başlıqda ana səhifə sayı |
| Q14 | AZIR / İnflyasiya upsert | Eyni tarix+term (il+ay+kod) ilə iki dəfə saxla | Bir sətir, dəyər yenilənib; filtrlər işləyir; silmə dialoqu |
| Q15 | Gəlirlik əyrisi | Yeni → parametr qrupu aç → 4 dəyər → sətirlər: `1Y`, `1Y` | Təkrar period xətası; qrup bağlı → `parameters: null`; boş sətir atılır |
| Q16 | Media kitabxanası (US5) | Yüklə (`.pdf`) → axtar → məzmuna bağlı faylı sil | Kart ad/ölçü/tarix; 409 mesajı banner; icazəsiz uzantı seçilmir |
| Q17 | İstifadəçilər | Yeni (zəif şifrə → xəta) → redaktə (username kilidli, aktivlik var) → Şifrəni sıfırla | 400 mesajı formda; sıfırlama dialoqu → toast |
| Q18 | Parametrlər | Yeni açar + yanlış JSON → düzgün JSON → mövcud açarı redaktə | Parser xətası göstərilir; açar kilidli; cədvəldə gözəl JSON |
| Q19 | Qaranlıq tema | Q4–Q18 ekranlarını `.dark`-da keç | Dialoq/çekmecə/cədvəl/redaktor oxunaqlı; xüsusi rəng yoxdur |
| Q20 | Dar ekran | 390 px eni | Cədvəllər öz konteynerində sürüşür, səhifə üfüqi sürüşmür |

Hər ssenari `spec.md` acceptance ssenarilərinə uyğundur; SC-001 (20 ekran işlək) Q1–Q18-in
tam keçməsi ilə təsdiqlənir.

## 5. Avtomatik testlər (renderApp + MSW)

```bash
npm run test:run                 # hamısı
npx vitest run src/features/crud # mühərrik
npx vitest run src/features/rich-text/roundtrip.test.ts
```

Gözlənilən əhatə: hər `features/<x>` üçün ən azı bir `*.test.tsx` (siyahı render + yaratma);
`shared/crud` (coerce, payload, path), `shared/lib` (sanitize-html, jwt), `shared/api` (üç error
forması) unit testləri; `auth-flow.test.tsx` (login → redirect → 401 → logout + toast).

## 6. Deploy yoxlaması

```bash
npm run docker:build             # BuildKit secret ilə image
docker run -p 8080:80 <image>    # /config.json → {"urls":{"apiUrl":"/api/v1"}} default
curl -s localhost:8080/config.json
```
`.ci-cd/*.yaml`-da `<<DEYISDIRIN>>`/`TODO(devops)` qalıqları DevOps təsdiqinə qədər qalır; CI
`app:check` gate-i verify ilə eynidir.

## 7. Problemlər

| Simptom | Səbəb / həll |
| --- | --- |
| Hər şey stilsiz | Kit quraşdırılmayıb (`npm run install:nexus`) və ya `src/index.css` route B bloku dəyişib |
| Panel açılır, siyahılar boş | Baza boş — seed və mock content (GUIDE.md); bug deyil |
| Hər sorğu 401 | API işləmir / token müddəti bitib / proxy hədəfi yanlış (`VITE_API_PROXY_TARGET`) |
| Şəkillər 404 | mock content sırası pozulub (media id 1, 2) |
| `npm run roundtrip` "ROOT NOT FOUND" | Seed-lənmiş səhifə başlığı fərqlidir — `/pages` ağacından dəqiq başlıq |
| Kit `Əvvəlki/Növbəti` ingiliscə | Bilinən kit problemi (spec D3) |
