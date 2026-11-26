# Contract: `web-cbar-admin-new` sessiya davranışı

UI və transport qatının müşahidə olunan davranışı. Testlər (Vitest + MSW) bu
müqaviləyə qarşı yazılır.

## 1. Bootstrap

| Vəziyyət | `POST /auth/refresh` nəticəsi | Nəticə |
| --- | --- | --- |
| Etibarlı cookie | `200` | store `authenticated`, istənən qorunan ünvan açılır, login ekranı görünmür |
| Cookie yox / etibarsız | `401` | store `anonymous`, qorunan ünvan → `/login?redirect=<ünvan>`, toast **yoxdur** |
| Şəbəkə / 5xx | xəta | store `anonymous`, `/login`; toast yoxdur (istifadəçi yenidən daxil ola bilər) |
| Köhnə API (endpoint yoxdur) | `404`/`405` | `anonymous` kimi |

Bərpa bitənə qədər router render olunmur (`status = 'restoring'`).
`/login` ünvanında olan və bərpası uğurlu olan istifadəçi `redirect`-ə və ya `/`-ə yönləndirilir.

## 2. Sorğu axını

1. Access token `expiresAt - 30 s`-dən əvvəldirsə → birbaşa göndərilir.
2. Yoxsa → əvvəlcə refresh (single-flight), sonra göndərilir.
3. `401` gəldi (URL `/auth/*` deyil, sorğu hələ təkrarlanmayıb) → refresh → sorğu **bir dəfə** təkrar.
4. Refresh nəticələri:
   - `200` → store yenilənir, gözləyən bütün sorğular yeni tokenlə davam edir;
   - `401 refresh_stale` → bir dəfə təkrar refresh (başqa tab artıq rotasiya edib);
   - digər `401` → `expireSession()`: store + query cache təmizlənir, `/login?redirect=…`,
     "sessiya bitdi" warning toast-u;
   - şəbəkə / 5xx / timeout → orijinal sorğunun xətası qaytarılır, **çıxış yoxdur**.
5. Eyni anda N sorğu refresh tələb edərsə → **1** `POST /auth/refresh`.
6. Tablar arası: `navigator.locks.request('cbar-admin-refresh')` altında refresh; lock
   alındıqdan sonra store-dakı token artıq təzədirsə, refresh atlanır. `navigator.locks`
   yoxdursa yalnız tab daxili single-flight.

## 3. Çıxış

- Topbar "Çıxış": `POST /auth/logout` (credentials ilə) → nəticədən asılı olmayaraq lokal
  çıxış (store + query cache + `/login`), toast yoxdur.
- `BroadcastChannel('cbar-admin-auth')` üzərindən `{ type: 'logout' }` göndərilir; digər
  tablar lokal çıxış edir (serverə sorğu və toast olmadan). `BroadcastChannel` yoxdursa,
  digər tab ən gec növbəti refresh-də çıxır.

## 4. Login

- `POST /auth/login` `withCredentials: true` ilə (cross-origin `Set-Cookie` üçün).
- Login-in öz `401`-i refresh axınını işə salmır, "sessiya bitdi" göstərmir (bugünkü kimi).

## 5. Saxlama

- `localStorage` / `sessionStorage` / JS cookie-də token, refresh dəyəri və ya istifadəçi
  snapshot-ı **yoxdur**. Refresh token panel JS-inə heç vaxt gəlmir.
- Silinir: `scheduleExpiry` taymeri (avtomatik çıxış yalnız rədd edilmiş refresh ilə).

## 6. MSW (test/demo)

Handler-lər real kontraktı ([auth-api.md](./auth-api.md)) təqlid edir. Node mühitində
brauzer cookie-si olmadığı üçün handler modul səviyyəli "aktiv sessiya" vəziyyəti saxlayır
(login → aktiv, logout → yox, test helper ilə vaxtı keçmiş/reused vəziyyət qurulur).
