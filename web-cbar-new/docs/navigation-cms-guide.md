# Header menyuları — redaktor qeydi (spec 056)

Saytın yuxarı menyuları CMS səhifə ağacından qurulur. Kodda bölmə siyahısı yoxdur: sıranı, adları və menyudakı yeri admin
paneldə **Səhifələr** bölməsi idarə edir.

Spec: `../../specs/056-header-financial-stability-nav/`. Figma: nav zolağı `I813:25657;9:29`, hamburger paneli `1088:26873`.

## Nav zolağı

- Zolaq ağacın **ilk 9 kök bölməsidir**, admin-dəki sıra ilə. Bu gün: Haqqımızda, Pul siyasəti, Maliyyə sabitliyi, Bazar
  iştirakçıları, Hüquqi aktlar, Ödəniş sistemləri, Milli pul nişanları, Statistika, Nəşrlər və tədqiqatlar.
- 1024–1359px enində 9 bölmə bir sətirə sığmır. Orada zolaqda ilk 8 bölmə qalır, 9-cu hamburger panelinə keçir.
- Kök bölmənin sırasını dəyişmək zolağı da dəyişir. Məsələn, 10-cu yerə qoyulan bölmə zolaqdan çıxır və hamburgerə keçir.
- Bölmənin üzərinə gələndə onun alt səhifələri açılan menyuda görünür. Menyuda 3 səviyyə göstərilir.

## Hamburger paneli

Zolağa sığmayan kök bölmələr hamburger panelindədir.

| Ekran | Paneldə nə var |
|---|---|
| 1360px və daha geniş | 10-cu və sonrakı bölmələr, bunlardan başqa: üst zolaqda keçidi olan bölmələr (Media, İnsan resursları) və **«Menyularda yox»** seçilmiş kök bölmələr |
| 1024–1359px | 9-cu və sonrakı bütün bölmələr |
| Planşet (744–1023px) | bütün bölmələr |
| Mobil | hamburger paneli yoxdur, çekmecədə bütün bölmələr var |

1360px-dən geniş ekranda panel 4 sütundur. Görünən ilk üç bölmə öz sütununu açır, qalanları dördüncü sütunda alt-alta düzülür.

### Kök bölməni geniş paneldən çıxarmaq

1. **Səhifələr** → kök bölmənin formu (məsələn, «İstinadlar»).
2. **Saytın menyusunda** kartında **Menyudakı yeri** → **Menyularda yox**.
3. **Yadda saxla**.

Kök bölmə üçün bu seçim yalnız **geniş ekranın hamburger panelinə** təsir edir. Nav zolağı, planşet paneli, mobil çekmecə və footer
bölməni əvvəlki kimi göstərir. Kartın «Üst menyu» sətri bunu qeyd kimi yazır. «Yalnız açılan menyularda» kök bölmə üçün yoxdur.

Geri qaytarmaq üçün **Bütün menyularda** seçilir.

Kökdən aşağıdakı səhifədə eyni seçim səhifəni bütün menyulardan çıxarır (spec 048, 054). Bu qayda dəyişməyib.

Seed `0042` bu dörd bölməni «Menyularda yox» qeyd edib: Maliyyə sektorunun inkişaf Strategiyası, Məlumatların yayımlanması qrafiki,
Sual-cavab, İstinadlar.

## Maliyyə sabitliyi

Yeni kök bölmədir (seed `0042`), zolaqda 3-cüdür. Altında:

- Maliyyə sabitliyi hesabatı (əvvəl «Nəşrlər və tədqiqatlar»da idi);
- Bank sektoru üzrə makroprudensial siyasət çərçivəsi (əvvəl «Nəşrlər və tədqiqatlar»da idi);
- Dayanıqlı Maliyyə, bütün alt səhifələri ilə (əvvəl ayrıca kök bölmə idi).

Ünvanlar dəyişməyib. Kök səhifənin mətni boşdur. Mətn yazılana qədər səhifə alt səhifələrin kartlarını göstərir. Bölmənin ayrıca Figma
şablonu hələ yoxdur, səhifələr ümumi şablonla açılır.

## Rəqəmsal maliyyə ekosistemi

Yeni kök bölmədir (seed `0042`), hamburger panelində İstehlakçı hüquqlarından sonra gəlir. Səkkiz alt səhifəsi Figma sırası ilə
yaradılıb, mətnləri boşdur:

Maliyyə texnologiyaları · Açıq bankçılıq · Xüsusi tənzimləmə rejimi · Rəqəmsal KYC · Kriptoaktivlərin tənzimlənməsi · Mərkəzi Bankın
rəqəmsal valyutası · Maliyyə texnologiyaları ekosisteminin xəritəsi · Maliyyə texnologiyaları və innovasiyalar üzrə yenilik və tədbirlər

«Ödəniş sistemləri»ndəki köhnə «Açıq bankçılıq» səhifəsi yerində qalıb. Yeni səhifənin ünvanı `aciq-bankciliq-2`-dir. en başlıqları
qaralamadır.
