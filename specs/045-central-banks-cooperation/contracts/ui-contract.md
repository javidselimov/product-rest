# UI contract — Memorandumlar cədvəli (spec 045)

Mənbə: Figma "cbar website (Copy)", səhifə "International Cooperation", bölmə `2220:58130`. Desktop `2198:112838` (məzmun `2198:112842`, cədvəl
bloku `2208:77938`, cədvəl instance `2286:121177`), tablet `2216:6616`, iPhone `2216:7341`.
Rənglər: mətn `#222222`, sərhəd `#D4D4D4`, başlıq sətri fonu `#004976` (brend), zebra `#FCFBF9`, ağ `#FFFFFF`. Şrift DM Sans.
Rənglər kodda semantik tokenlərlə verilir; hex yalnız tutuşdurma üçündür.

Bütün dəyərlər əsas komponentlərdən oxunub (2026-11-13): desktop `2208:5872` Sort, `2208:5878` Head, `2208:5885` Row; tablet `2216:6015`,
`2216:6022`; mobil `2221:2291`, `2221:2298`. Sütun eni = Figma xanası + sətrin sağ padding-i (son sütun üçün).

## Səhifə — desktop 1728 (məzmun sütunu 984, sol menyu 312, aralıq 24)

| Element | Dəyər |
|---|---|
| H1 | 32/44, 600 (bölmə şablonunun mövcud H1-i) |
| H1 → giriş → cədvəl bloku | 36 (məzmun sütununun `itemSpacing`-i) |
| Giriş | 16/28, 400, `#222222` |
| Cədvəl bloku | vertical, gap 16 |
| Cədvəl başlığı (H2) | 20/28, 600, `#222222` |
| Controls sətri | 984×40, məzmun sağa (`justify-end`) |
| Controls → cədvəl | 20 |

## Çeşidləmə düyməsi (bağlı)

| Element | Dəyər |
|---|---|
| Düymə | hündürlük 40, padding 0 12, gap 6, radius 4; en məzmuna görə (az: 183) |
| "Tarix:" | 14/20, 400, `#787878` |
| "əvvəlcə yenilər" | 14/20, 500, `#004976` |
| Ox ikonu | 16×16 çərçivə (vektor 10×12, stroke 1.5), `#004976` |
| Sərhəd / fon | yoxdur (fill və stroke boş) |
| Açılan siyahı | Figma-da yoxdur — fərz: düymənin altında sağa düzlənmiş panel, kit popover tokenləri, iki bənd 14/20, aktiv bənd 500 |

## Cədvəl — desktop

| Element | Dəyər |
|---|---|
| Cədvəl | en 984, border 1 `#D4D4D4` INSIDE, radius 4, `overflow: hidden` |
| Başlıq sətri | hündürlük 44, padding 12 24, fon `#004976` |
| Başlıq mətni | 14/20, 600, ağ `#FFFFFF` |
| Sətir | padding 16 24, min hündürlük 57 (bir sətir mətn), iki sətirlik ad → 81 |
| Sətir sərhədi | yuxarı 1 `#D4D4D4` |
| Zebra | tək sətirlər `#FFFFFF`, cüt sətirlər `#FCFBF9` (birinci sətir ağ) |
| Təşkilat | 16/24, 600, `#222222`, sola |
| Ölkə | 16/24, 600, `#222222`, sola |
| Tarix | 16/24, 500, `#222222`, **sağa** (xana `MAX`) |
| Sütun enləri | Təşkilat qalan en (694 + sol padding 24), Ölkə 178 (daxili sağ padding 24), Tarix 64 + sağ padding 24 = 88 |

## Tablet 744 (`2216:6624`: padding 40, yuxarı 8, aşağı 80)

| Element | Dəyər |
|---|---|
| Sol menyu | bölmə şablonunun tablet qaydası (spec 043) |
| Cədvəl | en 664, başlıq və sətir padding-i desktop-dakı kimi (12 24 / 16 24), şriftlər desktop-dakı kimi |
| Sütun enləri | Təşkilat qalan en (398), Ölkə 154 (daxili sağ padding 24), Tarix 64 + 24 = 88 |
| Düzləmə | Təşkilat və Ölkə sola, Tarix sağa |

## Mobil 390 (`2216:7346`: padding 24, yuxarı 16, aşağı 64, gap 32)

| Element | Dəyər |
|---|---|
| H1 | 24/32, 600 |
| Giriş | 16/26, 400 |
| Cədvəl başlığı (H2) | 18/26, 600 |
| "Tarix:" / seçim | 14/20, 400 / 500 |
| Başlıq sətri mətni | 12/16, 600; Ölkə və Tarix sağa düzlənib |
| Təşkilat | 14/20, 600, sola |
| Ölkə | 14/20, 600, sağa |
| Tarix | 14/20, 500, sağa |
| Başlıq sətri | hündürlük 40, padding 12 12 |
| Sətir | padding 12 12, iki sətirlik ad → 65 |
| Sütun enləri | Təşkilat qalan en (140, daxili sağ padding 8), Ölkə 110 (daxili sağ padding 12), Tarix 68 + 12 = 80 |

Cədvəl bütün enlərdə üç sütunludur; üfüqi sürüşmə yoxdur, uzun ad sətir keçir.

## Çap

Çeşidləmə düyməsi çap olunmur; cədvəl tam, cari sıra ilə çap olunur.
