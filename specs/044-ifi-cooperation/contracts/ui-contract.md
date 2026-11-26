# UI contract — IFI kartları (spec 044)

Mənbə: Figma "cbar website (Copy)", `2189:3133` (səhifə), `2172:3599` (komponent seti), `2172:3489` (açıq nümunə). Ölçülər 1728px en üçündür.
Rənglər: mətn `#222222`, ikinci dərəcəli `#787878`, sərhəd `#D4D4D4`, brend `#004976`, vurğu `#4BC7B5`, missiya fonu `#D6EAF4`. Şrift DM Sans.

## Səhifə (məzmun sütunu 984)

| Element | Dəyər |
|---|---|
| Header → Təşkilatlar bloku aralığı | 32 |
| H1 | 32/42, 600 (spec 043 şablonu: mövcud `CmsContent variant="about"` H1) |
| H1 → giriş | 36 |
| Giriş | 16/26, 400 |
| "Əməkdaşlıq edilən təşkilatlar" | 20/auto (26), 600 |
| Başlıq → kartlar, kartlar arası | 16 |

## Kart (bağlı, 984×92)

| Element | Dəyər |
|---|---|
| Kart | padding 16, border 1 `#D4D4D4` INSIDE, radius 4, fon ağ |
| Başlıq sətri | horizontal, gap 12, items center, hündürlük 58 (loqo ilə) |
| Loqo | 103×58, `object-fit: cover` (Figma FILL) |
| Ad | 18/24, 600, `#222222`, flex 1 |
| "Üzvlük: 1992" | 14/auto (18), 400, `#787878` |
| Ox | 20×20, caret, `#4BC7B5`; bağlı → aşağı (180°), açıq → yuxarı |

## Kart (açıq) — məzmun

| Element | Dəyər |
|---|---|
| Başlıq sətri → məzmun | 16 |
| Məzmun blokları arası | 16 |
| "Əsas missiya" qutusu | fon `#D6EAF4`, padding 20, radius 4, gap 8 |
| — etiket | 16/auto (21), 600, `#004976` |
| — mətn | 16/24, 400 |
| Üzvlük giriş sətri | 16/24, 600 |
| Tarix şəbəkəsi | wrap, gap 16 (sətir və sütun), 3 sütun |
| Tarix kartı | 306×123, padding 20, gap 10, border 1 `#D4D4D4`, radius 4 |
| — tarix | 18/auto (23), 600, `#004976`, `DD.MM.YYYY` |
| — qurum adı | 16/24, 400 |
| Mətn paraqrafları | 16/26, 400 |
| Sayt linki | 16/auto (21), 600, `#004976`, underline; "↗" 6px aralıqla, underline yox |

## Kiçik ekranlar (Figma-da yoxdur — fərz)

- 744: tarix şəbəkəsi 2 sütun.
- 390: tarix şəbəkəsi 1 sütun; başlıq sətrində il adın altına keçir, loqo 103×58 qalır.
