# UI contract: spec 061

Desktop 1728 kadrı; ölçülər Figma bridge-dən (2026-11-27). Rənglər kit/site tokenləri ilə verilir, hex yalnız tutuşdurma üçündür.
Tablet (744) və mobil (390) kadrları implementasiyada eyni üsulla ölçülür (Figma rəqəmi + `getBoundingClientRect`, INSIDE stroke).

## §1 Bölmə şablonu (`section-shell`, spec 054 ilə eyni)

| Element | Figma | Dəyər |
|---|---|---|
| breadcrumb + paylaşma | `2910:20937` | 1320 en, padding 30/0, breadcrumb düymələri 14/28 medium, ikon düymələr 40 × 40, aralıq 10 |
| sol menyu | `2910:20943` | 312 en, padding 20, aralıq 16, radius 4, fon `#F5F5F5`; bənd 16/28 semibold |
| menyu ↔ məzmun | `2910:20942` | aralıq 24 |
| məzmun sütunu | `2910:20954` | 984 en; başlıq → məzmun 36 |
| səhifə başlığı | `2910:20956` | 32/44 semibold, `#222222` |
| məzmun → footer | `2910:20941` | 120 |

Mövcud `section-shell` bu ölçüləri artıq verir (spec 028/054). Fərq çıxsa shell-də deyil, bölmə konfiqində düzəldilir.

## §2 Giriş səhifəsi (`2846:137396`)

Başlıq + CMS mətni (`widgets/cms-content`), abzas 16/28, abzaslar arası 16. Yeni komponent yoxdur.

## §3 Fayl səhifəsi (`statistics-files`): Makro `2910:20935`, Pul-kredit `2931:24174`, Ödəniş `2939:26629`

Sıra (yuxarıdan aşağı, aralıq 48): [CMS mətni, yalnız boş deyilsə] → kateqoriya zolağı → siyahı → "Son yenilənmə" zolağı.

| Element | Figma | Dəyər |
|---|---|---|
| kateqoriya zolağı | `2910:20262` | məzmun eni, hündürlük 44, fon `#F9F9F9`, radius 4, bəndlər arası 0 |
| kateqoriya bəndi | `2915:2308` | padding 18/8, 16/28 medium; seçili: fon `#43B7A7` (teal), radius 4, mətn ağ |
| zolaq → siyahı | `Cədvəllər` | 32 |
| qruplar arası | `2910:20337` | 40 |
| qrup başlığı | `2910:20340` | 20 semibold, `#222222`; başlıq → kart 12 |
| fayl kartı | `2910:20342` | 984 × 78, padding 24/20, aralıq 24, radius 4, border 1 `#E5E5E5` (INSIDE), fon ağ |
| kart başlığı | `2910:20344` | 17/24 semibold |
| meta (sağda) | `2910:20345` | "Yenilənib: dd.mm.yyyy" 14 regular `#6B7280` + fayl nişanı, aralıq 20 |
| fayl nişanı | `Bülleten / Fayl` `2889:6372` | mövcud `FilePill` (11/14 semibold nişan + yükləmə ikonu); nişan rəngi formata görə: PDF `#C74040`, XLS `#218C54`, DOC `#2B579A`, XML `#E6911E`, ZIP `#5B6478` (`--site-file-badge-*`) |
| "Son yenilənmə" zolağı | `2910:20959` | 984 × 78, padding 24/20, aralıq 24, radius 4, border `#E5E5E5`; görünən: "Son yenilənmə: …" 16/24 (solda) və ZIP düyməsi (`2910:21865`: 166 × 36, padding 12/8, aralıq 10, radius 4, border `#D4D4D4`, qırmızı nişan `#C74040` içində "Hamısını yüklə (ZIP)" 11/14 semibold + yükləmə ikonu). "SON YENİLƏNMƏ", info və "Yayım qrafiki →" gizli qatdır — qurulmur |

Tablet (`· Tablet` komponentləri): zolaq çiplərdir, sığmırsa üfüqi sürüşür. Mobil (`· Mobile`, `Menu` oxu): kateqoriya `YearMenu` tipli açılan
menyu (`Menu=Yes` açıq hal). Dəqiq ölçülər implementasiyada.

Kart bütövlükdə bir linkdir (fayl yeni tabda), `DocumentCard` kimi; başlığın tam mətni (tarix daxil) ekran oxuyucusu üçün qalır.

## §4 NSDP (`3071:32077`, en)

Başlıq → "Datasets" (aralıq 12). Dataset kartı: başlıq 17/24 semibold + sağda iki fayl nişanı (XML `3071:2286`, sonra XLS), hər nişan öz
faylının linki. Kart bir link deyil (iki hədəf var); başlıq mətndir, nişanlar `aria-label`-lı linklərdir ("XML: <başlıq>").

## §5 Metodologiya (`3067:58867`), Reviziya (`3374:61131`)

Başlıq → "Sənədlər" (aralıq 12): mövcud `document-list` kartları, `statistics` variantı (§3 kartı, "Yenilənib" sətri olmadan; Figma-da
yoxdur). Reviziya kartının nişanı DOC.

## §6 Maliyyə sektorunun statistikası (`3487:293975`)

Başlıq → bir abzas 16/28 (aralıq 36). Alt səhifələr yalnız menyudadır.

## §7 Vəziyyətlər

| Vəziyyət | Görünüş |
|---|---|
| fayl yoxdur | yalnız başlıq (və mətn); zolaqlar yoxdur |
| qrup yoxdur / en | zolaq yoxdur, kartlar bir siyahı, qrup başlıqları yoxdur |
| tarix yoxdur | kartda "Yenilənib" sətri yoxdur; heç bir faylda tarix yoxdursa "Son yenilənmə" tarixi sətri yoxdur |
| API xətası | mövcud route error boundary (spec 002) |
| JS yoxdur | hamısı işləyir (linklər, `<details>`) |
