# Contract: İctimai menyuda görünmə qaydaları (istehlak kontraktı)

**Sahibi**: `api-cbar` (`GET /api/v1/pages/tree?locale=`) + `web-cbar-new` (`src/shell/nav.ts`).
**İstehlakçı**: `web-cbar-admin-new` `features/pages/model/menu-visibility.ts` (yalnız əks etdirir, kod paylaşmır).
**Sinxronluq**: aşağıdakı fayllardan biri dəyişərsə bu sənəd və panel funksiyası eyni vaxtda yenilənir.

| # | Qayda | Mənbə |
| --- | --- | --- |
| 1 | `Status == Published` | `PagesController.GetTree` `Where` |
| 2 | `Active && Visible` | eyni |
| 3 | `locale == "en" ? ShowEn : ShowAz` | eyni |
| 4 | Həmin dildə `Title != null && Slug != null` (admin boş slug-u başlıqdan yaradır → praktikada "başlıq dolu") | `GetTree` `translated` + `api-cbar-admin` `UniqueSlugAsync` |
| 5 | Valideyn görünmürsə, səhifə **kökə qalxır** (menyuda üst səviyyə bölməsi olur) | `GetTree` `ParentId is null \|\| !ids.Contains(ParentId)` |
| 6 | Dərinlik ≤ 3 (kök = 1); daha dərin uşaqlar menyuya düşmür | `nav.ts` `MAX_DEPTH = 3` |
| 7 | Sıra: `SortOrder`, sonra `Id` | `GetTree` `OrderBy` |
| 8 | Link: `navUrl` → (xarici `https?://` olduğu kimi, daxili `/{locale}{navUrl}`); yoxdursa `FEATURE_ROUTES[slug]` və ya `/{locale}/{slug}` | `nav.ts` `navFor` |
| 9 | Üst bar ilk 8 kök bölməni göstərir, qalanı "digər" menyusundadır | `nav.ts` `VISIBLE_SECTIONS = 8` |
| 10 | Gecikmə: ağac 300 s keşlənir | `web-cbar-new/src/server/cached.ts` `TREE_REVALIDATE_SECONDS` |

Panel formu bu qaydalardan 1–6-nı canlı göstərir; 7–10 formdakı izah mətnindədir
(`pages:menuVisibility.hint`: "Dəyişiklik saytın menyusunda 5 dəqiqəyə qədər gecikmə ilə görünür").
