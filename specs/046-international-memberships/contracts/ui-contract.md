# UI contract — Beynəlxalq təşkilatlarda üzvlük (spec 046)

Mənbə: Figma "cbar website (Copy)", səhifə "International Cooperation". Desktop kadr `2224:7200` (sol menyu `2224:7201`, məzmun `2224:7202`),
cədvəl instance-ları: desktop `2287:120701` (984), tablet `2287:120799` (664), mobil `2287:120897` (342). Oxunub 2026-11-16.
Rənglər spec 045 ilə eynidir: mətn `#222222`, sərhəd `#D4D4D4`, başlıq sətri `#004976`, zebra `#FCFBF9`, "Üzvlük tarixi:" `#787878`. Şrift DM Sans.
Kodda semantik tokenlər (memorandum cədvəlinin istifadə etdikləri); hex yalnız tutuşdurma üçündür.

Səhifə çərçivəsi (sol menyu 312, aralıq 24, məzmun 984, H1 32/44 → mobil 24/32, H1 → blok 36) bölmə şablonundandır (spec 043) və dəyişmir.

## Blok

| Element | Dəyər |
|---|---|
| Cədvəl başlığı "Azərbaycan Respublikası Mərkəzi Bankının üzv olduğu təşkilatlar" | Figma-da `visible: false` → **ekranda yox**, `sr-only` H2, cədvəlin `aria-labelledby`-ı |
| Giriş (redaktor yazarsa) | `CmsContent variant="about"`, blokdan əvvəl, aralıq memorandum kimi |
| Controls sətri | en = məzmun, hündürlük 40, sağa düzlənib |
| Controls → cədvəl | 20 |

## Çeşidləmə düyməsi

| Element | Desktop / tablet | Mobil |
|---|---|---|
| Düymə | 40 hündürlük, padding 0 12, gap 6, radius 4; az en 230 | padding **sol 12, sağ 0**; az en 218 |
| "Üzvlük tarixi:" | 14/20, 400, `#787878` | eyni |
| "əvvəlcə yenilər" | 14/20, 500, `#004976` | eyni |
| Ox | 16×16 (vektor 10×12, stroke 1.5), `#004976` | eyni |
| Açılan siyahı | memorandum menyusu ilə eyni (Figma-da yoxdur) | eyni |

## Cədvəl

| Element | Desktop 984 | Tablet 664 | Mobil 342 |
|---|---|---|---|
| Çərçivə | border 1 `#D4D4D4` INSIDE, radius 4, `overflow: hidden` | = | = |
| Başlıq sətri | 44, padding 12 24, fon `#004976` | 44, padding 12 24 | **56**, padding 12 12 ("Üzvlük / tarixi" iki sətir) |
| Başlıq mətni | 14/20, 600, ağ | 14/20, 600 | 12/16, 600 |
| Sətir padding | 16 24 | 16 24 | 12 12 |
| Sətir hündürlüyü | 57 (bir sətir ad), 81 (iki) | 57 / 81 / 105 (üç) | 65 (iki sətir ad), 85, 105 |
| Sətir sərhədi | yuxarı 1 `#D4D4D4` | = | = |
| Zebra | 1-ci ağ, cütlər `#FCFBF9` | = | = |
| Təşkilat | 16/24, 600, sola; xana sağ padding 24 | = | 14/20, 600; xana sağ padding 8 |
| İl | 16/24, 500, **sağa** | = | 14/20, 500, sağa |
| "Üzvlük tarixi" başlığı | sağa | sağa | sağa, 2 sətir |
| Sütun enləri | Təşkilat qalan (796 + sol 24), İl 140 + sağ 24 = **164** | Təşkilat qalan (476), İl **164** | Təşkilat qalan (250, daxili sağ 8), İl 68 + 12 = **80** |

İki sütun bütün enlərdə qalır; üfüqi sürüşmə yoxdur, uzun ad sətir keçir. Linkli təşkilat adı: eyni şrift, `text-primary`, hover-da alt xətt,
`target="_blank" rel="noopener noreferrer"`.

## Çap

Çeşidləmə düyməsi çap olunmur (`data-print="hide"`), cədvəl cari sıra ilə tam çap olunur.

## Admin menyu (web-cbar-admin-new)

Kit tokenləri; Figma yoxdur. Qrup başlığı mövcud qrup başlığı üslubundadır (`text-xs font-medium uppercase text-muted-foreground`), üstəgəl sağda
16px ox (kit `ChevronDownIcon`, açıqda 180°). Qrup başlığı düymədir: hündürlük 32, padding 0 12, hover `bg-sidebar-accent`. Qrupun bəndləri mövcud bənd
üslubunda, sol boşluq dəyişmir. Aktiv qrupun başlığı `text-sidebar-foreground`.

## Ölçüldü (2026-11-16, T021)

Headless Edge + CDP `getBoundingClientRect`, 1728 / 744 / 390, scrollbar gizlədilib (Figma kadrlarında yoxdur). Sayt `next build` + `next start`
müvəqqəti surətdən; API test mühitidir, yalnız 554 səhifəsinin mətni seed `0029`-un HTML-i ilə proxy-dən verilir (seed hələ yayımlanmayıb).
38 yoxlamadan 31-i birbaşa keçdi; qalan 7-si aşağıdadır.

| Element | Figma | Sayt | Qərar |
|---|---|---|---|
| Cədvəl eni | 984 / 664 / 342 | 984 / 664 / 342 | uyğun |
| İl sütunu | 164 / 164 / 80 | 164 / 164 / 80 | uyğun |
| Təşkilat sütunu | 820 / 500 / 262 | 818 / 498 / 260 | uyğun: Figma stroke INSIDE-dır, CSS border çərçivənin içindən 2px götürür |
| Başlıq sətri | 44 / 44 / 56 | 45 / 45 / 57 | uyğun: border-collapse birinci sətrin 1px sərhədinin yarısını başlığa verir (spec 045 ilə eyni) |
| Sətir hündürlükləri | 57/81, 57/81/105, 65/85/105 | yalnız bu dəyərlər | uyğun |
| Çeşidləmə düyməsi | 230 / 230 / 218 | 229.45 / 229.45 / 217.45 | uyğun: DM Sans mətn eninin yuvarlaqlaşdırılması (0.55px) |
| Düymə padding | 0 12 / 0 12 / sol 12 sağ 0 | eyni | uyğun |
| Controls → cədvəl | 20 | 20 | uyğun |
| H1 → blok (desktop) | 36 | 36 | uyğun |
| Rənglər, şriftlər, zebra, sərhədlər | kontrakt | eyni | uyğun |
| Üfüqi sürüşmə | yox | yox | uyğun |
| `?sort=oldest`, `?sort=xyz`, en, JS-siz menyu | — | işləyir | uyğun |
| **H1 tablet** | 28/36 (`2224:8128`) | 32/44 | **açıq**: bölmə şablonu (`widgets/section-shell`, spec 028/043), bütün bölmə səhifələrinə aiddir |
| **H1 mobil** | 24/32 (`2224:8144`) | 22/28 | **açıq**: eyni səbəb |

H1 fərqi spec 046-nın kodundan deyil: şablon tablet-dən yuxarı `32/44`, mobil `22/28` verir. Düzəltmək bütün Haqqımızda / Media /
Beynəlxalq əməkdaşlıq səhifələrinin başlığını dəyişər, ona görə ayrıca qərar tələb edir. Yuxarıdakı "H1 32/44 → mobil 24/32" sətri Figma-nı təsvir edir.
