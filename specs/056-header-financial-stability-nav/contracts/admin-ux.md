# Admin UX contract: "Saytın menyusunda" kartı kök bölmə üçün (spec 056)

Spec 054 `contracts/admin-ux.md` §3-ü genişləndirir. Kart: `web-cbar-admin-new/src/features/pages/components/menu-visibility-card.tsx`,
qaydalar: `features/pages/model/menu-visibility.ts`.

## Seçimlər (kök bölmə, `parentId === null`)

| Seçim | Bayraqlar | Kök üçün izah |
|---|---|---|
| Hər yerdə | `true` / `true` | mövcud `allHint` |
| Yalnız açılan menyularda | — | **disabled**, mövcud `dropdownOnlyRoot` mətni |
| Menyularda yox | `false` / `false` | **yeni `noneRoot`**: "Bölmə geniş ekranın hamburger panelində görünməyəcək. Nav zolağı, planşet və mobil menyu, footer dəyişmir." |

Kökdən aşağıdakı səhifələr üçün izahlar dəyişmir.

## "Üst menyu" sətri (kök bölmə)

- Görünmə nəticəsi dəyişmir: kök üçün bayraq səbəb deyil (`menuVisibility`, `depth === 1`).
- Kök "Menyularda yox"dursa (`isInDropdownNav(flags) === false`) sətrə qeyd əlavə olunur (`menuVisibility.rootPanelHidden`): "Geniş
  ekranın hamburger panelində görünməyəcək. Nav zolağındakı ilk {{count}} bölmə zolaqda qalır." `count = MENU_BAR_SECTIONS` (9).
- Model funksiyası: `rootPanelHidden(flags, placement)`. `placement.depth === 1` və `!isInDropdownNav(flags)` olanda `true` qaytarır.
  Ağac yüklənməyibsə `parentId === null` ilə qərar verilir.

## Mətnlər

`src/locales/{az,en}/pages.json`, `menuVisibility.location.noneRoot`, `menuVisibility.rootPanelHidden`. `check:i18n` iki dili
tutuşdurur.

| Açar | az | en |
|---|---|---|
| `location.noneRoot` | Bölmə geniş ekranın hamburger panelində görünməyəcək. Nav zolağı, planşet və mobil menyu, footer dəyişmir. | The section will not be listed in the wide-screen hamburger panel. The nav bar, tablet and mobile menus and the footer do not change. |
| `rootPanelHidden` | Geniş ekranın hamburger panelində görünməyəcək. Nav zolağındakı ilk {{count}} bölmə zolaqda qalır. | Not listed in the wide-screen hamburger panel. The first {{count}} sections stay on the nav bar. |

## Testlər

- `menu-visibility.test.ts`: `rootPanelHidden` kök + "none" → `true`; kök + "all" → `false`; uşaq + "none" → `false`.
- `menu-visibility-card.test.tsx`: kök formasında "Menyularda yox" seçiləndə izah və qeyd görünür. "Hər yerdə"yə qayıdanda qeyd
  itir. Yalnız açılan menyular disabled qalır.
