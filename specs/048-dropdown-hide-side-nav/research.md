# Research: Sol menyuda gizli səhifələr açılan menyularda da görünməsin

## R1 — Süzgəc harada olsun

- **Decision**: `shell/nav.ts` `toSection` uşaqları `isInDropdownNav` ilə süzür.
- **Rationale**: mega-menyu (`visible`), hamburger paneli və mobil çekmecə (`all`) hamısı `buildNavSections`-dan gəlir. Bir yer üç
  menyunu eyni edir (qərar 1) və server-də işləyir, ona görə gizli bənd HTML-ə düşmür (klaviatura/ekran oxuyucusu üçün də yoxdur).
- **Alternatives**: komponentlərdə süzmək (`OverflowPanel`, `MobileNav`) — üç yerdə təkrar və mega-menyu ilə fərqlənmə riski;
  `api-cbar`-da süzmək — sol menyu və breadcrumb ağacda bəndi görməlidir (spec 041 açıq-səhifə istisnası), rədd.

## R2 — Kök bölmələr və footer

- **Decision**: kök düyünlərə süzgəc tətbiq olunmur.
- **Rationale**: kök heç bir sol menyuda bənd deyil (sol menyu kökün uşaqlarıdır), admin kartı da kök üçün `sectionRoot` deyir.
  Kökü bayraqla nav çubuğundan çıxarmaq gözlənilməz olardı. Footer yalnız kökləri göstərir, dəyişmir.
- **Alternatives**: kökü də süzmək — "Media" kökündə bayraq söndürülsə bölmə saytdan yox olardı; rədd.

## R3 — Açıq səhifə istisnası və bayrağın default-u

- **Decision**: yeni `isInDropdownNav(node) = node.showInSideNav !== false` `entities/page-node/lib/tree.ts`-də, `isInSideNav`-ın yanında.
- **Rationale**: qərar 2 — açılan menyu hər səhifədə eynidir. Header ağacı cari səhifəni bilmir, bilməsi də lazım deyil. Bayraq
  gəlməyəndə görünən sayılır (spec 041 default) — eyni ifadə `isInSideNav`-da var; ikinci funksiya mənanı adla verir.
- **Alternatives**: `isInSideNav(node, new Set())` çağırmaq — işləyir, amma "boş açıq dəst" niyyəti gizlədir.

## R4 — Admin kartı

- **Decision**: `menuVisibility` depth > 1 olan, öz qaydaları ilə görünən səhifəyə `sideNavOff` (öz bayrağı) və ya `parentSideNavOff`
  (kökdən aşağıdakı əcdad) səbəbini əlavə edir. `MenuHiddenReason` bu iki dəyəri alır; i18n mətnləri artıq var.
- **Rationale**: kart `sidePlacementUnder` nəticəsini hər iki funksiyaya ötürür, `sideNavHiddenAncestor` artıq hesablanır. `tooDeep`
  ilə birlikdə göstərilə bilər (səbəblər siyahıdır). `promotedToRoot` yalnız görünən səhifə üçündür, dəyişmir.
- **Alternatives**: kartda ayrıca "Hamburger" sətri — "Üst menyu" sətri artıq açılan menyulardır; yeni sətir lazımsız.
- **Placement bilinmirsə** (ağac yüklənməyib): öz qaydaları, səhifənin öz bayrağı daxil — sol menyu sətri də belə edir.

## R5 — Sənədlər

- **Decision**: `about-cms-guide.md` və `media-cms-guide.md` cədvəlində "Sol menyuda göstər" sətri "Üst menyu, mobil" sütununda "bəli"
  yerinə "kök: bəli; alt səhifə: yox" olur; `financial-literacy-cms-guide.md`, `cooperation-cms-guide.md` qeyd alır; `CLAUDE.md`
  (spec 041 bəndi) və `business_logic/new_business_logic.md` §5.1 yenilənir.
- **Rationale**: memory qaydası "menyu dəyişəndə sənədləri eyni dəyişiklikdə yenilə".
