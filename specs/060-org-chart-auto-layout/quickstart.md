# Quickstart — spec 060 yoxlaması

Bu sənəd yoxlama ssenariləridir. Kod `tasks.md`-dədir. Ünvanlar və hesablar `product-rest/api-cbar-admin/CREDENTIALS.md`-dədir.

Docker bu maşında işləmir (yaddaş qeydi). API-lər PGlite + socket ilə real SQL-ə qarşı yoxlanır. Frontendlər test API-yə qarşı
`npm run local:testcbar` ilə və ya MSW fikstürü + proxy ilə yoxlanır.

## 1. Admin API

1. `dotnet build` + `dotnet test CbarAdminApi.slnx` (`api-cbar-admin`).
2. Boş bazada migration `0045` iki dəfə işləyir (ikinci dəfə dəyişiklik yoxdur). `cbar_web_ro` cədvəli oxuya bilir.
3. `PUT /organization/chart/order`:
   - doğru `ids` → 204, `GET` yeni sıranı qaytarır;
   - əskik, təkrar və ya yad id → 400 problem+json;
   - olmayan `parentId` → 404.
4. `PUT /{id}`:
   - blok üçün `departmentsOpen: true` → detail-də `true`;
   - həmin kartı `departmentsOpen` olmadan saxlamaq → `true` qalır;
   - baş direktor üçün `true` → 400.
5. `audit_log`-da `org_chart_nodes.reorder` və `update` qeydləri var.

## 2. Public API

`GET /api/v1/organization/chart?locale=az`:

- hər node-da `departmentsOpen` var;
- blok 37 üçün `true`-dur (§5-dən sonra), qalanlar `false`.

## 3. Sayt (web-cbar-new)

1. `npm run verify`, sonra Node 22 ilə `npm run test:run` (yaddaş qeydi).
2. Unit testlər (`entities/org-chart/model/layout.test.ts`):
   - hər qayda L1–L11;
   - hər kart bir dəfə görünür;
   - `extraRoots`;
   - departamentləri filtrdən düşən blok `plain`-dir.
3. Komponent testləri: blok `<details>`-dir, `<summary>`-də keçid yoxdur, açılanda departament keçidləri görünür, "həmişə açıq" blokda
   `<details>` yoxdur.
4. Brauzerdə 1728 px, `/az/organization?section=divisions` (Edge CDP, `getBoundingClientRect`, yaddaş qeydi "Figma ↔ DOM"):
   - bütün bloklar bağlı: kartlar və xətlər [layout-rules.md](contracts/layout-rules.md) Figma nöqtələri ilə ±1 px uyğundur. R5
     fərqləri ayrıca göstərilir;
   - "Kredit təşkilatlarının… bloku" açıq: 3 departament görünür, "Maliyyə monitorinqi bloku" aşağı düşür, qonşu sütunlar tərpənmir.
     Açıq halın ölçüləri istifadəçinin ekran şəkli ilə tutuşdurulur (R6);
   - hər blokun açıq/bağlı hər birləşməsində kart düzbucaqlıları kəsişmir (SC-003). Bunu ölçmə skripti yoxlayır;
   - JS söndürülüb: açılıb-bağlanır (SC-005). Tab + Enter/Space işləyir;
   - uzun adlı kart: altındakılar və xətlər aşağı düşür.
5. 1024 və 390 px: ağac görünüşü əvvəlki kimidir. Mövcud `OrgChartTree` testləri dəyişmədən keçir (SC-006).

## 4. Panel (web-cbar-admin-new)

1. `npm run verify`.
2. "Təşkilat → Struktur sxemi":
   - canvas redaktoru, koordinat sahələri, "canvas-da yoxdur" nişanı və "Sıra" sahəsi yoxdur;
   - "Saytda bax" yeni pəncərədə saytın sxemini açır.
3. Blok 37-də "Sıranı dəyiş":
   - departamentin yerini dəyişmək dərhal saxlanır;
   - MSW ilə 500 → xəta toast-u göstərilir, sıra geri qayıdır.
4. Blok formunda "Departamentlər: Həmişə açıq" seçimi saxlanır və yenidən açılanda görünür. Baş direktor formunda bu seçim yoxdur.

## 5. Mühitlərin məlumatı (FR-017)

Test mühitində, deploydan sonra redaktor paneldən:

- 40–43 kartlarının valideynini 37 edir;
- 37-ni "həmişə açıq" edir;
- saytda nəticə §3.4 kimi yoxlanır.

Prod: `GET {prod api-cbar}/api/v1/organization/chart?locale=az`:

- `[]`-dirsə, heç nə lazım deyil;
- doludursa, eyni düzəliş redaktorla paneldən edilir.

## 6. Deploy sırası

`api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` → `web-cbar-new`. Hər addımdan sonra Grafana-da restart və log
(`Namespace cbar`) yoxlanır.
