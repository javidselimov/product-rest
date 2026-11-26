# Cookie registri

Konstitusiya **Maddə VIII.6** cookie sayının və adlarının bir yerdə
sənədləşdirilməsini tələb edir. Bu fayl həmin yerdir və şablonun **içində**
yaşayır — spec artefaktları ilə birlikdə köçürülmür, ona görə yeni layihə onu
həmişə yanında tapır.

Kod tərəfi: [`src/shared/config/cookies.ts`](../src/shared/config/cookies.ts)
(adlar və ömür) və [`src/server/session.ts`](../src/server/session.ts)
(sessiya cookie-si, server-only).

---

## Şablonun qurduğu cookie-lər

`ui-theme` (tema seçimi) spec 022 ilə ləğv olunub — sayt yalnız açıq temadadır.

| Ad | Məqsəd | `HttpOnly` | `Secure` | `SameSite` | Ömür | Kim yazır |
| --- | --- | --- | --- | --- | --- | --- |
| `web-cbar-next-session` | Sessiya: access token + istifadəçi profili | **bəli** | bəli | `Lax` | `expiresAt` (defolt 8 saat) | yalnız server (`/api/session`) |
| `NEXT_LOCALE` | Dil seçimi (`az` \| `en`) | xeyr | bəli | `Lax` | 1 il | client (dil dəyişdiricisi) + proxy sinxronlaşdırması |

**Analitik və izləmə cookie-si yoxdur** və əlavə edilə bilməz — konstitusiya
Maddə VIII.6 bunu açıq qadağan edir.

Sessiya cookie-sinin adı deploy-da `.ci-cd/*.yaml`-dakı `SESSION_COOKIE_NAME`
dəyişənindən gəlir. Repo-da işlək defolt (`next-template-session`) qalır, çünki
`web-cbar-next-session` RFC 6265-ə görə **etibarlı cookie adı deyil** (`<` və `>`
token simvolu deyil) və lokal dev-i qırardı.

---

## Üçüncü tərəf widget-in cookie-si (spec 007)

Müyəssərlik menyusu (`public/vendor/accw/`) admində aktiv olanda brauzerdə öz
cookie-sini yazır. Kodu bizim deyil (vendor surəti, sapma D-1), ona görə
`src/shared/config/cookies.ts`-də yoxdur və bayraqlarını dəyişə bilmirik.

| Ad | Məqsəd | `HttpOnly` | `Secure` | `SameSite` | Ömür | Kim yazır |
| --- | --- | --- | --- | --- | --- | --- |
| `accw` | Müyəssərlik seçimləri (şrift ölçüsü, kontrast, dil…) JSON kimi, `path=/` | xeyr | xeyr | yoxdur | **brauzer sessiyası** | client (vendor widget) |

- Ömür vendor kodundakı xətadan sessiyadır: `expires` hesablaması `NaN` verir və
  `Invalid Date` yazılır. Brauzer bağlananda seçimlər sıfırlanır (spec US1-3).
- Sensitive məlumat daşımır, izləmə məqsədi yoxdur — funksional cookie-dir
  (Maddə VIII.6).
- Menyu deaktiv olanda skript yüklənmir və cookie yazılmır. Əvvəldən qalmış
  cookie zərərsizdir: onu oxuyan kod yoxdur.

## Niyə sessiya cookie-dədir

Access token client JavaScript-inə **heç vaxt** verilmir (konstitusiya v2.0.0
Maddə V):

- `localStorage`, `sessionStorage`, URL və JS-dən oxunan cookie qadağandır;
- token `HttpOnly` cookie-dədir, ona görə XSS ilə oxuna bilmir;
- client yalnız **istifadəçi profilini** və icazə dəstini görür;
- `POST /api/session` cavabında `accessToken` sahəsi yoxdur — bu, avtomatlaşdırılmış
  testlə yoxlanılır (`src/app/api/session/route.test.ts`).

## Niyə tema və dil cookie-dədir

Server root layout ilk render-də `<html lang class>` verə bilsin deyə (R-005).
Alternativ — blocking inline script — CSP-də `'unsafe-inline'` tələb edərdi və
tema sıçrayışı yaradardı. Hər ikisi sensitive deyil, ona görə `HttpOnly`
qoyulmur: client onları oxumalı və yazmalıdır (Maddə VIII.6 buna açıq icazə verir).

## Yeni cookie əlavə edərkən

1. Adı və ömrü `src/shared/config/cookies.ts`-ə əlavə et.
2. Bu cədvələ sətir yaz — məqsəd, bayraqlar, ömür, kim yazır.
3. Sensitive məlumat daşıyırsa `HttpOnly` **məcburidir** və yazma yalnız
   `src/server/` altından ola bilər (Maddə XI.2).
4. Analitik/izləmə məqsədi varsa — əlavə etmə.
