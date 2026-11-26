# Data model — spec 060

## Baza

### `org_chart_nodes` (mövcud, migration `0015`, dəyişmir)

`x/y/w/h` və `connector` qalır (FR-015). Heç bir komponent onları artıq oxumur və yazmır. Yeganə istisna köhnəlmiş `PUT /layout`-dur,
onu panel çağırmır.

`sort_order` qardaşlar arası sıradır. Yeni `PUT /order` onu `1..n` kimi yenidən yazır.

### `org_chart_node_details` (yeni, migration `0045-org-chart-node-details.sql`)

| Sütun | Tip | Qayda |
|---|---|---|
| `node_id` | `integer` PK | `org_chart_nodes(id)`. FK `ON DELETE CASCADE` yalnız `REFERENCES` icazəsi olanda (`0016` nümunəsi) |
| `departments_open` | `boolean NOT NULL DEFAULT false` | `true` = "həmişə açıq" |

- Sətir yoxdursa, dəyər `false`-dur ("açılan siyahı"). Mövcud 40 kart üçün backfill lazım deyil.
- Admin sətri `departments_open = true` olanda və ya sətir artıq varsa yazır. Kart silinəndə controller sətri də silir: FK olmayan
  mühitdə sətir qalmasın.
- `GRANT SELECT ... TO cbar_web_ro` (rol varsa).
- Seçim yalnız blok (4) və qrup (6) üçün mənalıdır. Başqa növdə saxlanmış `true` sayt tərəfindən nəzərə alınmır, admin isə onu yazmır
  (validasiya: başqa növdə `true` → 400).

### EF (`Cbar.Domain`, hər iki nüsxədə bayt-bayt)

```text
OrgChartNodeDetails { int NodeId (key); bool DepartmentsOpen }
OrgChartNode.Details  → OrgChartNodeDetails? (1:0..1, HasForeignKey NodeId)
CbarDbContext.OrgChartNodeDetails → ToTable("org_chart_node_details")
```

## API sahələri

Ətraflı: [contracts/admin-api.md](contracts/admin-api.md), [contracts/public-api.md](contracts/public-api.md).

| Yer | Sahə | Qayda |
|---|---|---|
| admin `OrgChartNodeUpsertDto` | `departmentsOpen: bool?` | `null` → saxlanmış dəyər qalır. Növ 4/6 deyilsə və `true`-dursa → 400 |
| admin detail | `departmentsOpen: bool` | həmişə göndərilir |
| admin `PUT /order` | `{ parentId: int?, ids: int[] }` | `ids` = həmin valideynin bütün uşaqları, deaktivlər də. Hər biri bir dəfə |
| public node | `departmentsOpen: bool` | növ 4/6 üçün saxlanmış dəyər, qalanları `false` |
| admin/public `layout`, `connector` | — | qalır, `deprecated` |

## Sayt: görünüş modeli

`entities/org-chart/model/layout.ts` daxilində saf funksiya: `buildChartLayout(nodes) → ChartLayout`. Qaydalar
[contracts/layout-rules.md](contracts/layout-rules.md)-dədir.

```text
ChartCard      { id, kind, name, role, curatorDirect, href }
ChartBlock     { card: ChartCard, departments: ChartCard[], mode: 'dropdown' | 'open' | 'plain' }
                 mode: departments boş → 'plain'; departmentsOpen → 'open'; qalan hal → 'dropdown'
ColumnItem     = { type: 'block', block: ChartBlock }
               | { type: 'other', card: ChartCard, children: ColumnItem[] }          (L11)
ChartColumn    { head: ChartCard | null, items: ColumnItem[] }
                 head = baş direktor; müavinə birbaşa tabe blokda null (L6, L8)
DeputyGroup    { deputy: ChartCard, childDeputies: DeputyGroup[], columns: ChartColumn[],
                 side: ChartCard[], sideJoinsOpenBlock: boolean }                      (L5–L7)
ChartLayout    { governor: ChartCard, departments: ChartCard[], leftColumns: ChartColumn[],
                 deputies: DeputyGroup[], extraRoots: ChartColumn[] } | null
```

- `null`: sədr kökü yoxdur. Səhifə spec 027-nin fallback-ini göstərir.
- `extraRoots`: sədrdən başqa köklər. Onlar sxemin altında adi sütundur, itmir (FR-002).
- Hər kart modeldə düz bir dəfə görünür. Test bunu yoxlayır: modelin kartları = API-nin kartları (SC-001).
- `OrgChartCardData` (`widgets/org-chart/model.ts`) `layout` və `connector`-u itirir, `departmentsOpen`-i qazanır. `OrgChartTree` onu
  oxumur.

## Panel: form modeli

| Sahə | Dəyişiklik |
|---|---|
| `sortOrder` | formdan gedir. Yeni kartda yeni qardaşların `max + 1`-i, redaktədə saxlanmış dəyər, valideyn dəyişəndə yeni qardaşların `max + 1`-i |
| `departmentsOpen` | radio "Departamentlər": "Açılan siyahı" (`false`), "Həmişə açıq" (`true`). Yalnız növ 4 və 6-da görünür. Başqa növdə `false` göndərilir |

Zod (`features/org-chart/model/schemas.ts`):

- `layout` və `connector` çıxır;
- `departmentsOpen: z.boolean().default(false)` əlavə olunur.

## Məlumat düzəlişi (FR-017)

Test mühiti, 2026-11-25-də yoxlanıb. Düzəlişi redaktor paneldən edir, SQL ilə yox.

| Kart | İndi | Olmalı |
|---|---|---|
| 40 Maliyyə idarəetməsi, 41 Risklərin idarə edilməsi, 42 İnzibati işlər, 43 Satınalmalar | valideyn 31 (Gülər) | valideyn 37 (Təşkilati inkişaf bloku) |
| 37 Təşkilati inkişaf bloku | açılan siyahı | həmişə açıq |
| 38 İnsan resursları, 39 Strategiya | valideyn 31 | dəyişmir (yan departamentlər, L7) |
| 12 Azər, 10–11 Toğrul/Əli, 30 Ödəniş bloku | — | doğrudur, dəyişmir |

Prod: [quickstart.md](quickstart.md) §5.
