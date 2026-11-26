# Spec 060 — plan qaralaması (2026-11-25, yarımçıq)

`/speckit-plan` yarıda saxlanıb. `plan.md` hələ şablondur. Bu fayl toplanmış faktları saxlayır ki, `research.md` onlardan yazılsın.

## Figma desktop ölçüləri (`2007:86378`, 971×771, mütləq koordinatlar)

- **Sədr** `2007:86445`: 266×98, kartın yeri (14747, 678).
  - Departament siyahısı `2007:86453`: 213 en, aralıq 4, x 15144.
  - Siyahıya gedən daraq: şaquli xətt x 15115, birinci sətrin mərkəzindən sonuncunun mərkəzinə qədər. Hər sətrə 29 px tick, sətrin
    mərkəzində.
  - Sədrdən gələn xətt kartın sağ kənarından (15013) y 731-dədir, kartın mərkəzi isə 727-dir.
- **Sədrin baş direktoru** (Azər Ələsgərov, `2007:86379`): ən sol sütun, x 14392, y 1119.
  - Xətt sədrin sol kənarından y 731-də x 14430-a gedir, sonra aşağı 1119-a düşür.
- **Müavinlər** (145×100):
  - Əliyar y 886-dadır, qalanları y 966-da.
  - Sədrdən xətt: sədrin altından 14880-də aşağı, y 829-da üfüqi bar (14536.5–15176.5), bardan Əliyar, Vüsal X və Gülər-ə düşür.
  - Əliyarın uşaq müavinləri (Toğrul, Əli): Əliyarın sağ kənarından y 920-də üfüqi xətt (14610–14843), 14690 və 14843-də 966-ya
    düşür.
- **Müavin → baş direktorlar**:
  - müavinin altından 35 px aşağı, üfüqi bar birinci sütunun mərkəzindən sonuncunun mərkəzinə qədər, bardan sütunlara 20 px düşür;
  - sütunların yuxarısı y 1119-dadır, sütunlar 68 en, aralıq 4;
  - müavin öz sütunlarının üstündə mərkəzlənir (yan departament sütunu bu hesaba daxil deyil).
- **Baş direktor** 68×68, padding 4. Altında bloklar, aralıq 10. Blok 68 en, padding 4. Baş direktorla blok arasında xətt yoxdur.
  Sütunlar bir-birindən asılı olmadan axır.
- **Müavinə birbaşa tabe blok** (Ödəniş `2007:86419`): öz sütunundadır, y 1194-dədir (≈ baş direktorun 68 + 10). Xətt müavinin
  barından gəlir.
- **"Həmişə açıq" blok** (Təşkilati inkişaf `2007:86471`):
  - blok kartı 68×37;
  - altında 8 px boşluqla üfüqi sıra (aralıq 4): solda blokun 4 departamenti (68 en, aralıq 8), sağda Gülərin yan departamentləri
    (68 en, x 15288).
- **Müavinin yan departamentləri** (Gülər):
  - müavinin sağ kənarından y 1014-də xətt x 15363-ə gedir, oradan aşağı 1308-ə;
  - departamentlərin sağ kənarına 5 px tick-lər var (y 1247, 1308).
- **Açılan siyahı**: Figma-da desktop-un açıq halı bu səhifədə ayrıca frame deyil.
  - Blok instance-ı: `2007:86393`, içi `I2007:86393;1965:60691`.
  - Komponentin əsas node-u (`1965:60690`?) oxunmadı, çağırış istifadəçi tərəfindən dayandırıldı.
  - Açıq halın ölçüləri istifadəçinin ekran şəklindən və ya komponentin özündən götürülməlidir.
- Figma-nın öz daxili uyğunsuzluqları (bir neçə px):
  - Əlinin kartı sütunlarına görə 5 px sağa sürüşüb;
  - Ödəniş bloku 1194-də, bloklar sırası isə 1197-də;
  - sədr xətti 731-də, kart mərkəzi 727-də.

  Qayda Figma-nın bu səhvlərini təkrarlamır. Fərqlər `research.md`-də qeyd olunur.

## Test mühiti (`api-cbar-test.cbar.az`, 40 kart)

Ağacda canvas üçün seçilmiş valideynlər var. Avtomatik düzülüşdən əvvəl düzəldilməlidir:

- 40–43 (Maliyyə idarəetməsi, Risklər, İnzibati işlər, Satınalmalar) hazırda Gülərin (31) uşağıdır. Blok 37-nin (Təşkilati inkişaf)
  uşağı olmalıdır, blok 37 isə "həmişə açıq" edilməlidir.
- 38–39 (İnsan resursları, Strategiya) Gülərin uşağı olaraq qalır: onlar yan departamentlərdir.
- 12 (Azər) sədrin uşağıdır: doğrudur.
- 10, 11 (Toğrul, Əli) Əliyarın (2) uşağıdır: doğrudur.
- 30 (Ödəniş bloku) Vüsal X-in (27) uşağıdır: doğrudur.

## Dizayn qərarları (qaralama, təsdiq gözləyir)

- **"Həmişə açıq" bayrağı.**
  - Yoldaş cədvəl `org_chart_node_details(node_id PK → org_chart_nodes, departments_open bool)`, miqrasiya `0045` (sonuncu `0044`).
    ALTER yoxdur, `cbar_web_ro`-ya GRANT verilir.
  - Entity hər iki `Cbar.Domain` nüsxəsinə əlavə olunur.
  - Admin upsert DTO-da `departmentsOpen bool?`: null olsa, saxlanmış dəyər qalır.
  - Detail və public node-da `departmentsOpen` göndərilir.
- **Sıra.** Ola bilsin `PUT /organization/chart/order` (qardaş id-ləri). Bu, spec-first-dir: əvvəl OpenAPI, `/api-endpoint`. Paneldə
  `shared/ui/sortable-list.tsx` / reorder dialoq istifadə olunur (spec 051/053 nümunəsi).
- **`PUT /layout`, `layout` və `connector`.** Silinmir, OpenAPI-də `deprecated` qeyd olunur. Sayt və panel onları oxumur (FR-015).
- **Sayt.**
  - `widgets/org-chart/org-chart-canvas.tsx` flex/grid axını ilə əvəz olunur. Blok native `<details>`-dir, client JS yoxdur.
  - Xətlər CSS border-ləri və ya qrup başına kiçik SVG ilə çəkilir, ölçülər Figma sabitlərindən gəlir (spec 032 sabitlər standartı).
  - `entities/org-chart/model/geometry.ts`-nin canvas hissəsi gedir.
- **Panel.** `canvas-editor.tsx` gedir. Ağac siyahısına sıra düymələri, blok formuna "Departamentlər" radio seçimi və "Saytda bax" keçidi
  əlavə olunur.
- **Deploy sırası.** `api-cbar-admin` → `api-cbar` → iki frontend.
- **Frontend skill gate.**
  - `senior-front`, `frontendpatterns`, `frontend-standards` və `ui-kit-usage` (hər iki komponent üçün) bu sessiyada oxunub.
  - Əsas pattern-lər: progressive enhancement və disclosure (`<details>`), Server Component; `'use client'` yoxdur.
