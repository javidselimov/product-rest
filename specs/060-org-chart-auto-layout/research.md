# Research — spec 060 (struktur sxemi: koordinatsız düzülüş)

Tarix: 2026-11-26. Mənbələr:

- [research-notes.md](research-notes.md): Figma `2007:86378` ölçüləri və test mühitinin 40 kartı, 2026-11-25;
- kod: `OrgChartController` (admin), `OrganizationController.GetChart` (public), `widgets/org-chart`, `features/org-chart`;
- migration `0015`, `0016`.

## R1. Düzülüş texnikası: CSS axını, üfüqi ölçülər serverdə

- **Qərar.** Desktop sxemi CSS grid/flex axını ilə qurulur.
  - Kartların enləri və sütunların üfüqi yeri sabitdir. Onları saf funksiya ağacdan hesablayır (R3).
  - Şaquli yer mətnin hündürlüyündən və açıq `<details>`-dən asılıdır. Onu brauzer axını verir.
  - Xətlər SVG qatı deyil. Onlar birləşdirdikləri kartın wrapper-inə bağlı CSS border və pseudo-element seqmentləridir ("CSS tree"
    texnikası: siyahının hər sətri xəttin öz parçasını çəkir).
  - Bir neçə sıranı keçən xətt (sədr → Azər sütunu, Gülər → yan departamentlər) həmin sıraları əhatə edən grid elementidir. Sıra
    uzananda xətt də uzanır.
- **Səbəb.**
  - Açılan siyahı JS-siz işləməlidir (FR-007), altdakı kartlar və xətlər onunla birlikdə sürüşməlidir (FR-004).
  - Uzun ad kartı hündürləşdirməlidir (US2-4).
  - Hər ikisi yalnız axında, ölçmə olmadan alınır.
- **Rədd edilən alternativlər.**
  - Serverdə tam koordinat və bir SVG. Blok açılanda xətləri JS-siz yerindən tərpətmək olmur. Mətn sətrə keçəndə də qırılır.
  - Client-də ölçmə (`ResizeObserver` + SVG). `'use client'` tələb edir və JS-siz işləmir (SC-005). senior-front: "Server Component by
    default".
  - Spec 027 canvas-ının saxlanması. Canvas-da açıq/bağlı hal yoxdur (spec-in əsas problemi).

## R2. Açılan siyahı: native `<details>`

- **Qərar.**
  - Departamentləri olan və "həmişə açıq" olmayan blok (və qrup) `<details>`-dir. `<summary>` blok kartının özüdür.
  - Caret `group-open:rotate-180` ilə çevrilir. Departamentlər `<summary>`-dən sonra blokun enində sütundur.
  - `<summary>`-nin içində keçid yoxdur (FR-006). Hər `<details>` müstəqildir: `name` atributu yoxdur (spec defoltu 6).
- **Səbəb.** frontendpatterns: "platform first", progressive enhancement. Klaviatura (Enter/Space) və açıq/bağlı halının elan olunması
  pulsuz gəlir. `OrgChartTree` də eyni texnikanı işlədir (spec 027).
- **Rədd edildi.** `button` + `aria-expanded` + state: JS lazımdır. `:target`: bir anda yalnız bir blok açıq ola bilir, URL dəyişir.

## R3. Düzülüş modeli: saf `buildChartLayout`

- **Qərar.** `web-cbar-new/src/entities/org-chart/model/layout.ts` ağacı tipli görünüş modelinə çevirir (discriminated union, bax
  [data-model.md](data-model.md#sayt-görünüş-modeli)). Funksiya DOM-suzdur, unit testlidir.
  - Qaydalar [contracts/layout-rules.md](contracts/layout-rules.md)-dədir.
  - Widget yalnız modeli render edir.
  - Qaydaya düşməyən birləşmə (FR-003, son bənd) `other` sütun uşağı olur və itmir.
- **Səbəb.** Növ birləşmələrinin məntiqi render-dən ayrılır, Figma qaydaları testdə yoxlanır. senior-front: "derive, don't store".
- **Rədd edildi.** Qaydaları JSX içində `kind` yoxlamaları ilə yazmaq: Switch Statements smell, test edilməz.

## R4. Ölçü sabitləri

- **Qərar.** Figma rəqəmləri adlı sabitlərdir: `widgets/org-chart/constants.ts` (`CHART` obyekti: kart enləri, aralıqlar, tick
  uzunluqları). Bu, spec 032 standartıdır.
- Rəqəmlərin özü [contracts/layout-rules.md](contracts/layout-rules.md) §Ölçülər-dədir.

## R5. Figma-nın daxili uyğunsuzluqları

- **Qərar.** Qayda Figma-nın bir neçə px-lik səhvlərini təkrarlamır. Siyahı
  [contracts/layout-rules.md](contracts/layout-rules.md#figma-dan-qəsdən-fərqlər-r5)-dədir: 7 yer, hamısı ≤ 5 px. ±1 px yoxlamasında
  (SC-002) bu yerlər istisna kimi göstərilir. Əliyar → uşaq müavinlər xəttinin yeri implementasiyada ölçülür.

- **Səbəb.** Avtomatik qayda ardıcıl olmalıdır. Figma-nın əl ilə yerləşdirmə səhvləri qayda deyil.

## R6. Açıq halın ölçüləri

- **Vəziyyət.** Blok komponentinin açıq halı oxunmayıb. `figma_node 1965:60690` (depth 2) 2026-11-26-da 300 s-də cavab vermədi. Yaddaş
  qeydinə görə təkrar sorğu plugini çökdürür.
- **Qərar (defolt).**
  - Açılan siyahı "həmişə açıq" blokun Figma quruluşunu təkrarlayır: blokdan 8 px aşağı, departament kartları 68 en, aralıq 8.
  - Kart stili spec 027-nin departament kartıdır.
- **Yoxlama.** Implementasiyanın birinci sayt tapşırığı bu rəqəmləri istifadəçinin göndərdiyi ekran şəklindən və ya komponentin daha kiçik
  node-undan ölçür ("Kredit təşkilatlarının… bloku", 3 departament). Fərq çıxarsa, yalnız `CHART.dropdown*` sabitləri dəyişir.
- Bu, NEEDS CLARIFICATION deyil: quruluş məlumdur, yalnız iki rəqəm yoxlanacaq.
- **Ölçüldü (2026-11-26, T020).** İstifadəçinin açıq hal ekran şəkli (Fuad İsayevin sütunu, "Kredit təşkilatlarının…" və "Maliyyə
  monitorinqi" blokları açıq), piksel skanı ilə. Miqyas 1.25 (baş direktor kartı 85 ekran px = 68). Blokdan siyahıya 10 px = **8** (defolt
  düz), departamentlər arası 5 px = **4** (defolt 8 idi, düzəldi), departament eni 85 px = **68**, son departamentdən növbəti bloka 12 px =
  10 (`columnItemGap`). `CHART.dropdownItemGap` 4 oldu.

## R7. "Həmişə açıq" seçiminin saxlanması

- **Qərar.** Yoldaş cədvəl `org_chart_node_details(node_id PK, departments_open bool NOT NULL DEFAULT false)`, migration
  `0045-org-chart-node-details.sql`.
  - FK şərtlidir, `has_table_privilege(..., 'REFERENCES')` ilə (`0016` nümunəsi).
  - `cbar_web_ro`-ya `GRANT SELECT` verilir.
  - Sətir yoxdursa, dəyər `false`-dur. Sətir yalnız `true` olanda və ya artıq sətir varsa yazılır.
  - Entity `OrgChartNodeDetails` hər iki `Cbar.Domain` nüsxəsinə bayt-bayt əlavə olunur.
- **Səbəb.** `ALTER TABLE` paylaşılan mühitdə "must be owner of table" ilə yıxıla bilər (CLAUDE.md §Migrations, yaddaş qeydi).
- **Rədd edildi.** `org_chart_nodes`-a sütun əlavə etmək (ALTER). `kind` dəyərini dəyişmək (yeni növ "açıq blok"): mənanı qarışdırır,
  tablet ağacına da təsir edir.

## R8. Qardaşlar arası sıra: `PUT /api/v1/organization/chart/order`

- **Qərar.**
  - Body `{ parentId: int|null, ids: int[] }`. `ids` həmin valideynin bütün uşaqları olmalıdır, deaktivlər də daxil (`ContentSupport.InvalidOrder`).
  - Server `sortOrder = i + 1` yazır, audit `org_chart_nodes.reorder` olur, cavab 204-dür.
  - İcazə `Organization.Update`-dir. Spec-first: əvvəl OpenAPI, `/api-endpoint` skill-i.
- **Səbəb.** Spec 051/053 nümunəsi (`FaqTopicsController.Reorder`): bir çağırış, bir audit qeydi. Bütün qardaşlar bir dəfəyə yazılır,
  sıra ziddiyyəti yaranmır.
- **Rədd edildi.** Hər kart üçün `PUT /{id}` ilə `sortOrder`: bir hərəkət iki yazı tələb edir, aralıqda yarımçıq sıra qalır.

## R9. Paneldə sıra: mövcud `ReorderDialog`

- **Qərar.**
  - Ağac siyahısında ən azı iki uşağı olan kartda "Sıranı dəyiş" ikon düyməsi olur. Siyahının başında köklər üçün də bir düymə var.
  - Düymə `features/crud/components/reorder-dialog.tsx`-i açır: `load` = keşdəki siyahıdan həmin valideynin uşaqları, `save` = R8.
  - Dialoqun `SortableList`-i sürükləmə və yuxarı/aşağı düymələri verir, hər hərəkəti dərhal saxlayır. `onError`-da əvvəlki sıranı qaytarır
    (FR-011, US3-5).
  - Formdan "Sıra" sahəsi gedir:
    - yeni kart yeni qardaşlarının sonuna düşür (indiki `max + 1`);
    - redaktədə saxlanmış dəyər geri göndərilir;
    - valideyn dəyişəndə kart yeni qardaşlarının sonuna düşür.
- **Səbəb.** Yeni komponent yoxdur. Spec 053-dən bəri panelin standart sıra UI-si budur.
- **Rədd edildi.** Ağac siyahısının özündə sürükləmə: valideynlər arası səhv sürükləmə riski yaranır, yeni komponent lazımdır.

## R10. "Saytda bax"

- **Qərar.** Yeni build-time dəyişən `VITE_SITE_URL` `.env.development`, `.env.dev`, `.env.test` və `.env.production`-a əlavə olunur.
  Hostlar `TODO(devops)` qeydi ilə yazılır.
  - Keçid `${VITE_SITE_URL}/az/organization?section=divisions`-dir, `target="_blank" rel="noopener"`.
  - Dəyişən boşdursa, keçid görünmür.
- **Səbəb.** Panelin API ünvanı da build-time-dır (Maddə III.5). Panel saytın ünvanını başqa yerdən bilmir.

## R11. Köhnə koordinatlar

- **Qərar.**
  - `x/y/w/h/connector` bazada və hər iki API cavabında qalır (FR-015). OpenAPI-də `deprecated: true` qeyd olunur.
  - `PUT /layout` route-u qalır, `deprecated` olur. Route silinmədiyi üçün spec-first hook bloklamır.
  - Sayt və panel bu sahələri oxumur:
    - Zod sxemlərindən çıxır, Zod onları sakitcə atır;
    - `canvas-editor.tsx` silinir, `model/geometry.ts` və `model/layout.ts` (admin) silinir;
    - saytda `entities/org-chart/model/geometry.ts` silinir, `buildTree` yeni `layout.ts`-ə keçir.
- **Səbəb.** Geri qayıtmaq lazım olsa, məlumat itmir. İstifadə olunmayan kod qalmır (senior-front: "prefer deleting").

## R12. Köhnə API ilə uyğunluq (FR-016)

- **Qərar.** Saytın Zod sxemində `departmentsOpen: z.boolean().default(false)` yazılır. Sahəni göndərməyən köhnə `api-cbar` bütün blokları
  "açılan siyahı" kimi göstərir.
- Panel köhnə admin API ilə yeni sahəni göndərsə belə, .NET bilinməyən sahəni nəzərə almır. Deploy sırası bunu onsuz da istisna edir.

## R13. Enli sxem (FR-009)

- **Qərar.**
  - Sxem `overflow-x-auto` olan wrapper-dədir. Wrapper-də `tabIndex={0}`, `role="region"` və `aria-label` (i18n `chart.label`) var.
  - Səhifənin özü sürüşmür.
  - Figma sxemi 971 px-dir, konteyner 984 px-dir. İndiki 40 kartda sürüşmə yaranmır.

## R14. Mühitlərin məlumatı (FR-017)

- **Test.** Düzəliş [data-model.md](data-model.md#məlumat-düzəlişi-fr-017)-dədir:
  - 40–43 → valideyn 37;
  - 37 → "həmişə açıq".
  - Qalan valideynlər yoxlanıb və doğrudur.
- **Prod.** Prod-un ünvanları `TODO(devops)`-dadır, buradan yoxlanmadı. Deploydan əvvəl `GET /api/v1/organization/chart?locale=az`
  yoxlanır ([quickstart.md](quickstart.md) §5):
  - boşdursa, düzəliş yoxdur;
  - doludursa, redaktor eyni düzəlişi paneldən edir.

## R15. Planşet və mobil

- **Qərar.** `OrgChartTree` dəyişmir, `departmentsOpen`-i oxumur (SC-006). Mövcud testləri dəyişmədən keçməlidir.

## R16. Deploy sırası

`api-cbar-admin` (migration `0045`, `order`, `departmentsOpen`) → `api-cbar` (`departmentsOpen` sayta) → `web-cbar-admin-new` →
`web-cbar-new`. Bunlar dörd ayrı upstream MR-dir. Sayt R12 sayəsində köhnə API ilə də işləyir. Panelin sıra dialoqu isə yeni admin API
olmadan 404 alır, ona görə panel admin API-dən sonra deploy olunur.
