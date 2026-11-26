# UI kontraktı (spec 041)

## Sayt (web-cbar-new): sol menyu qaydası

Bir funksiya: `entities/page-node` `isInSideNav(node, open)`, yəni `node.showInSideNav !== false || open.has(node.id)`.
`open` = `activeChainIds(section, isCurrent)`.

| Yer | Dəyişiklik |
|---|---|
| `widgets/section-shell/model.ts` `buildSectionShell` / `toNavItem` | `navRoot.children` və `node.children` `isInSideNav` ilə süzülür, sonra map olunur. Tədbirlər qaydası (`hideChildren`) olduğu kimi qalır |
| `widgets/section-sidebar/section-sidebar.tsx` `renderLevel` | `items` `isInSideNav(node, chainIds)` ilə süzülür. Başlıq bloku (bölmə kökü) dəyişmir |
| `shell/nav.ts`, `site-footer`, `mobile-nav`, breadcrumb | **dəyişmir** (FR-007) |

Gözlənən davranış (testlər bunu yoxlayır):

1. Gizli bənd, başqa səhifə açıqdır: bənd yoxdur, qardaşlarının sırası eynidir.
2. Gizli bəndin özü açıqdır: bənd öz yerindədir, `current`/`aria-current="page"`.
3. Gizli bəndin uşağı açıqdır: gizli bənd açıqdır (`open`), uşaq aktivdir.
4. Gizli bəndin uşaqları: bölmənin başqa səhifəsində görünmür, mega menyuda öz yerindədir, kökə qalxmır.
5. Sahəsi olmayan node: görünür.
6. Kopya bölməsi: eyni qayda, kök Kopyadır.

## Admin panel (web-cbar-admin-new)

### Forma

"Görünürlük" qrupu (`page-form.tsx` `flagGroups`): `['active', 'visible', 'showAz', 'showEn', 'showInSideNav']`. Checkbox mövcud
bayraqlar kimi render olunur.

### "Saytın menyusunda" kartı

Hər dil üçün iki sətir:

```
AZ  Üst menyu  [Görünəcək]
    Sol menyu  [Görünməyəcək]  Görünməyəcək: sol menyuda göstərilmir
               Səhifənin özü açıq olanda sol menyuda görünür.
```

`data-testid`: `menu-visibility-{locale}-top`, `menu-visibility-{locale}-side`. `promotedToRoot` qeydi üst menyu sətrinin altında
qalır.

### Ağac

`page-tree.tsx`: `!flags.visible` nişanından sonra `flags.showInSideNav === false` → `badges.sideNavHidden`.

### i18n açarları (`locales/{az,en}/pages.json`)

| Açar | az | en |
|---|---|---|
| `flags.showInSideNav` | Sol menyuda göstər | Show in left menu |
| `badges.sideNavHidden` | Sol menyuda gizli | Hidden in left menu |
| `menuVisibility.rows.top` | Üst menyu | Top menu |
| `menuVisibility.rows.side` | Sol menyu | Left menu |
| `menuVisibility.reasons.sectionRoot` | bölmənin kökü, sol menyunun başlığıdır | section root, it heads the left menu |
| `menuVisibility.reasons.sideNavOff` | sol menyuda göstərilmir | not shown in the left menu |
| `menuVisibility.reasons.parentSideNavOff` | valideyn sol menyuda gizlidir | a parent is hidden in the left menu |
| `menuVisibility.sideNavOpenOnly` | Səhifənin özü açıq olanda sol menyuda görünür. | Shown in the left menu while the page itself is open. |
| `menuVisibility.hint` (dəyişir) | Dəyişiklik saytda bir neçə saniyə ərzində görünür. | Changes reach the site within a few seconds. |

`check:i18n` az/en açar bərabərliyini yoxlayır.

## Redaktor təlimatları

`web-cbar-new/docs/media-cms-guide.md` "Sol menyu" bölməsinə və `about-cms-guide.md`-yə eyni cədvəl əlavə olunur:

| Bayraq | Üst menyu, mobil, footer | Sol menyu | Breadcrumb | Ünvanla açılır | Alt səhifələr |
|---|---|---|---|---|---|
| Aktiv (söndürülüb) | yox | yox | — | yox (404) | kökə qalxır |
| Menyuda görünür (söndürülüb) | yox | yox | qısa: Ana səhifə › Bölmə › Səhifə | bəli | kökə qalxır |
| Sol menyuda göstər (söndürülüb) | bəli | yalnız özü açıq olanda | bəli | bəli | sol menyuda gizlənir, yerində qalır |

`media-cms-guide.md`-nin Tədbirlər bölməsindəki "bu səhifələri gizlətməyin" xəbərdarlığı yeni bayraqla tamamlanır: "Sol menyudan
çıxarmaq lazımdırsa, 'Sol menyuda göstər'-i söndürün."
