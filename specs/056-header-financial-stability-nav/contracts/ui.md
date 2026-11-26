# UI contract: header naviqasiyası (spec 056)

Spec 042-nin `contracts/ui.md`-sini genişləndirir. Orada deyilməyən hər şey əvvəlki kimidir.

## Sabitlər (`web-cbar-new/src/shell/constants.ts`)

| Ad | Dəyər | Məna |
|---|---|---|
| `VISIBLE_SECTIONS` | 9 | `desk`-dən (≥1360) nav zolağındakı bölmələr — Figma `I813:25657;9:29` |
| `VISIBLE_SECTIONS_NARROW` | 8 | `lg`–`desk` (1024–1359) zolaqda sığan bölmələr (research R2, ölçmə ilə) |

## En üzrə tərkib

| En | Nav zolağı | Hamburger paneli | Mobil çekmecə |
|---|---|---|---|
| <744 | yox | yox | bütün kök bölmələr — **dəyişmir** |
| 744–1023 | yalnız hamburger | bütün kök bölmələr — **dəyişmir** | yox |
| 1024–1359 | ilk 8 | 9-cu və sonrakılar (bayraq nəzərə alınmır) | yox |
| ≥1360 | ilk 9 | 10-cu və sonrakılar, **üst zolaq bölmələri və `inDropdownNav: false` kökləri istisna** | yox |

Seed-dən sonra test ağacı ilə ≥1360 paneli (az): İstehlakçıların və investorların hüquqları, Rəqəmsal maliyyə ekosistemi,
Beynəlxalq əməkdaşlıq, Maliyyə savadlılığı, FinCERT, Naxçıvan MR İdarəsi. en: Consumer and Investor Rights, Digital financial
ecosystem, International Cooperation, Financial Literacy, FinCERT.

## Sinif qaydası

Nav zolağının `li`-si (`MegaMenu`, indeks `i`, `visible`-dan):

- həmişə `max-lg:hidden` (mövcud);
- `i >= VISIBLE_SECTIONS_NARROW` → əlavə `max-desk:hidden`.

Panelin kök `li`-si (`OverflowPanel`, indeks `i`, `all`-dan):

- `i < VISIBLE_SECTIONS_NARROW` → `lg:hidden` (mövcud qayda, sərhəd dəyişir);
- `VISIBLE_SECTIONS_NARROW <= i < VISIBLE_SECTIONS` → `desk:hidden`;
- üst zolaq bölməsi (spec 042) → `desk:hidden`;
- `inDropdownNav === false` → `desk:hidden`.

Şərtlər birləşə bilər; `desk:hidden` bir dəfə yazılır.

Hamburger düyməsi: `lg`–`desk`-də panel boş deyilsə görünür (`all.length > VISIBLE_SECTIONS_NARROW`). `desk`-dən isə panelin ən azı
bir görünən bölməsi olanda görünür. Bütün qalan bölmələr gizlidirsə, düymə `desk:hidden` alır və boş panel açılmır.

## Sütunlar (≥1360)

Panel `columns-4` qalır. `desk`-də paneldə görünən 2-ci, 3-cü və 4-cü bölmə `desk:break-before-column` alır
(`OVERFLOW_PANEL_COLUMNS`). Beləcə ilk üç bölmə öz sütununu açır, qalanları sonuncu sütunda yığılır, Figma `1088:26873`-dəki kimi:
1) İstehlakçı, 2) Rəqəmsal, 3) Beynəlxalq, 4) Savadlılıq + FinCERT + Naxçıvan. Brauzerin öz balansı bunu verməmişdi (research
"Ölçmə nəticələri"). Firefox multicol-da sütun keçidini dəstəkləmir, orada balans qalır.

## "Maliyyə sabitliyi"nin mega-menyusu

Figma-da çəkilməyib. Mövcud `SectionPanel` şablonu işlənir: başlıq, xətt, sütunlar. Hər uşaq bir sütundur, "Dayanıqlı Maliyyə"nin
alt səhifələri onun sütununda siyahıdır. Kod dəyişmir.

## Dəyişməyənlər

Mobil çekmecə, planşet paneli, footer (sabit siyahı, "Maliyyə sabitliyi" artıq oradadır), breadcrumb, sol menyular, üst zolaq,
alt bəndlərin süzgəci (spec 048/054).
