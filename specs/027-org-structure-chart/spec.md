# Spec 027 — Təşkilati struktur sxemi (adminkadan idarə olunan, klikli)

**Status:** implementasiya olunub (2026-10-29), test mühitində yoxlanmayıb
**Komponentlər:** api-cbar-admin, api-cbar, web-cbar-new, web-cbar-admin-new (dörd ayrı MR)
**Deploy sırası:** api-cbar-admin (miqrasiya 0015) → api-cbar → web-cbar-new və web-cbar-admin-new

## Problem

"Struktur və əsasnamələr" səhifəsindəki (`/organization?section=divisions`) təşkilati sxem
CMS-ə yüklənmiş bir şəkil idi (spec 024 FR-015). Bunun nəticələri:
- şəxs dəyişəndə dizayner yeni şəkil çəkməli olurdu;
- sxemdə klik yox idi;
- mobil üçün ayrıca görünüş yox idi.

## Qərarlar (istifadəçi ilə, 2026-10-29)

- **Klik:** kart mövcud səhifəyə keçir — şəxs `/organization/staff/detail/{id}`, blok və departament `/organization/divisions/{id}`.
- **Mətn:** node `OrganizationStaff` və ya `OrganizationDivision` qeydinə bağlanır, ad və vəzifə oradan gəlir. Hər dil üçün `title`/`subtitle` override-dır. Bağlı olmayan node-un öz adı olmalıdır.
- **Desktop:** Figma ilə piksel-piksel eyni olmalıdır. Hər kartın `x/y/w/h` koordinatı adminkadakı canvas redaktorunda əllə verilir (984 px canvas).
- **Planşet və mobil** tamamilə başqa sxemdir: alt-alta ağac. O, `parentId` + `sortOrder`-dan avtomatik qurulur, koordinatlar orada işlənmir.

## Figma

| Görünüş | Node | Qeyd |
|---|---|---|
| Desktop | `2007:86376` (sxem `2007:86377`, qrup `2007:86378`) | 984×821, absolute kartlar, `#AFAFAF` xətlər |
| Planşet | `2007:86360` (sxem `2007:86365`, 664 en) | sənədlər sxemdən **əvvəl**, aralıq 36 |
| Mobil | `2007:86347` (342 en) | planşetlə eyni komponent |
| Komponentlər | `Prototype` səhifəsi `1838:*` | Governor, Person `1838:40425`, Block header `1838:40494`, Department `1838:40462`, Connector `1838:40232` |

Kart stilləri və rənglər `web-cbar-new/src/widgets/org-chart/*.tsx` başlıqlarındadır. Kitdə olmayan
rənglər `globals.css`-də `--site-org-*` D-2 literalıdır.

## Davranış

- **Desktop** (≥1360) — `OrgChartCanvas`:
  - kartlar `absolute` yerləşir, xətlər SVG ilə çəkilir;
  - avtomatik xəttin üç halı var (aşağı, sağ, sol). Qaydalar `entities/org-chart/model/geometry.ts`-dədir;
  - redaktor xətti əl ilə nöqtələrlə (`connector`) də verə bilər;
  - departamenti canvas-da olmayan blok caret ilə göstərilir.
- **Planşet/mobil** — `OrgChartTree`:
  - budaq xətləri var;
  - blok native `<details>` accordion-dur;
  - departamentin fonu üç cürdür: blokun içində boz, birbaşa tabe ağ, kuratora tabe teal 16%.
- **JS-siz:** client JS yoxdur, kartlar adi keçiddir.
- **Kuratora birbaşa tabe** (`curatorDirect`): kartın adına `*` əlavə olunur və altda "* Kuratora birbaşa tabe olan şöbə" qeydi çıxır.
- **Fallback:** sxem boşdursa və ya sorğu yıxılırsa, köhnə görünüş qalır (CMS şəkli və şöbə siyahısı). Sxem varsa CMS şəkli və düz siyahı göstərilmir, əsasnamələr (səhifənin əlavələri) qalır.
- **Public API filtrləri:** deaktiv node, deaktiv staff/division-a bağlı node və həmin dildə adı olmayan node budağı ilə birlikdə atılır. Link yalnız bağlı səhifə həmin dildə mövcuddursa verilir.

## Kontrakt

- Miqrasiya `api-cbar-admin/db/migrations/0015-org-chart-nodes.sql` iki cədvəl yaradır: `org_chart_nodes` və `org_chart_node_translations`.
- Staff və division FK-ları yalnız REFERENCES icazəsi olan mühitdə əlavə olunur (0014 kimi). Olmayan mühitdə staff/division DELETE endpoint-ləri link-i özü təmizləyir.
- Admin endpoint-ləri: `GET|POST /api/v1/organization/chart`, `GET|PUT|DELETE /api/v1/organization/chart/{id}`, `PUT /api/v1/organization/chart/layout`.
- Public endpoint: `GET /api/v1/organization/chart?locale=`.
- Sxemlər: `openapi/components/schemas/organization.yaml` (`OrgChart*`), hər iki API-də.

## Admin panel

Təşkilat → "Struktur sxemi" tab-ı (`/organization/chart`) iki hissədən ibarətdir:
- **Ağac siyahısı:** əlavə et, redaktə et, sil. Sıra formdakı `sortOrder`-dir, valideyn TreeSelect ilə seçilir.
- **Desktop canvas redaktoru:**
  - sürükləmə (Shift ilə 8 px tor), küncdən ölçü dəyişmə, ox düymələri ilə 1 px (Shift ilə 10 px) tərpətmə;
  - x/y/en/hündürlük inputları və xətt nöqtələri;
  - canvas-da olmayan kartların siyahısı;
  - bir `PUT /layout` ilə yadda saxlama.

Canvas-dakı kart rəngləri kit token-larından gələn önizləmədir (check:kit). Koordinatlar və xətlər public saytla eynidir.

## Açıq qalanlar

- [ ] Test mühitində runtime yoxlaması: miqrasiya, endpoint-lər, saytda 1728/744/390 enlərində Figma ilə ölçü tutuşdurması. Lokalda Docker işləmir.
- [ ] Real sxemin adminkada daxil edilməsi (≈50 kart). Figma koordinatlarından dev seed hazırlanmayıb.
- [ ] Blok kartının mətn rəngi Figma-dan ölçülə bilmədi (bridge instance-içi node-u tapmır). Ağ götürülüb.
- [ ] Ağac siyahısında drag-and-drop sıralama yoxdur, sıra formda `sortOrder` ilə dəyişir.
- [ ] Router səviyyəsində "yadda saxlanmamış dəyişiklik" bloku yoxdur. Yalnız `beforeunload` var.
