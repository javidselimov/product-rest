# Nəşrlər və tədqiqatlar — redaktor qeydi (spec 054)

"Nəşrlər və tədqiqatlar" bölmə şablonundadır (`SectionKey` `publications`): breadcrumb, paylaşma düymələri və sol menyu CMS səhifə ağacından
qurulur. Bölmənin səhifələri adi CMS səhifələridir, yalnız "İşçi məqalələri"nin siyahısı ayrıca məzmun növündən gəlir.

Ətraflı oxu üçün:
- redaktorlar üçün addım-addım təlimat: `../../dokumentasiyalar/nesrler-ve-tedqiqatlar-guide.md`;
- spec: `../../specs/054-publications-research/`, HTML formaları `contracts/publication-markup.md`-dədir.

## Ağac

```
Nəşrlər və tədqiqatlar (kök)
├── Tədqiqatlar (qrup)
│   ├── Ekonometrik modellər
│   └── İşçi məqalələri
└── Nəşrlər, hesabatlar və sənədlər (qrup)
    ├── İllik hesabat
    ├── Sahələrarası … (il arxivi)
    ├── Strategiyalar və konsepsiyalar: dörd tək sənəd səhifəsi
    ├── Rəqəmsal fırıldaqçılıq statistikası (istehlakçı bölməsindən köçüb)
    └── Ödəniş xidmətləri (istehlakçı bölməsindən köçüb, yalnız açılan menyularda)
```

Ağacı seed `0041` qurub. Figma-da olmayan köhnə səhifələr silinməyib: ağacda qalır, ünvanları açılır, menyulardan çıxarılıb. Onlardan ikisi,
"Maliyyə sabitliyi hesabatı" və "Bank sektoru üzrə makroprudensial siyasət çərçivəsi", seed `0042` ilə "Maliyyə sabitliyi" bölməsinə köçüb və
orada menyulardadır (spec 056, `navigation-cms-guide.md`).

Sol menyu iki qrupdur. Kökdə ikisi də bağlıdır. Qrup səhifəsində həmin qrup açılır və başlığı aktiv rəngdə olur. Səhifədə onun qrupu açılır
və cari bənd seçilmiş olur.

## Səhifənin görünüşü mətnin formasından seçilir

Bölmədə layout slug-a görə yox, mətnin formasına görə seçilir (`publicationsLayoutFor`). Yeni səhifə üçün kod dəyişikliyi lazım deyil.

| Mətndə nə var | Saytda | Nümunə |
|---|---|---|
| Ən azı bir akkordion (`<details>`) | **İl arxivi**: "İl" menyusu, seçilmiş ilin sənəd kartları | İllik hesabat, Sahələrarası…, Rəqəmsal fırıldaqçılıq |
| Akkordion yoxdur, amma fayl linki (`/media/<id>`) və ya səhifəyə bağlı fayl var | **Tək sənəd**: giriş mətni, altında sənəd kartları | Strategiyalar, Ödəniş xidmətləri, Ekonometrik modellər |
| Heç biri | Adi mətn | Kök, iki qrup səhifəsi |

### İl arxivi

- Hər akkordion bir qrupdur. Başlığı il (`2025`) olan qrup "İl" menyusunda il kimi görünür. Başqa başlıq ("Arxiv") öz adı ilə görünür, boş
  başlıq "Digər" yazılır.
- Menyu ilk açılışda ən yeni ili göstərir. "Hamısı" bütün qrupları ardıcıl göstərir. İl qrupu yoxdursa default "Hamısı"dır.
- Seçim ünvandadır (`?year=2024`, `?year=all`). JS olmadan da işləyir.
- Akkordiondan əvvəlki və sonrakı mətn yerində qalır. Yalnız fayl linkindən ibarət paraqraf orada da kart olur (məsələn illik hesabatın
  şrift linki).
- Akkordionun içində fayl linki kart olur, başqa səhifəyə link adi link qalır.

### Sənəd kartı və ölçü

- Kartın adı linkin mətnidir. Fayl növü ("PDF") və ölçü səhifəyə bağlı fayllardan media id ilə tapılır. Fayl səhifəyə bağlı deyilsə kart
  "Fayl" yazır və ölçü göstərilmir. Ona görə fayl linki qoyanda faylı **Sənədlər** hissəsində səhifəyə də bağlayın.
- Ölçü media kitabxanasındakı real ölçüdür. Köhnə importda ölçülər səhv idi (1064/2008 bayt). Admin API onları bir dəfə düzəldir
  (`MediaSizeBackfillService`). Ölçü `0`-dırsa göstərilmir.
- Bu səhifələrdə səhifənin ümumi fayl siyahısı göstərilmir: hər dil yalnız öz mətnindəki kartları göstərir.

## İşçi məqalələri

Siyahı səhifəsi CMS səhifəsi `isci-meqaleler-silsilesi` / `working-paper-series`-dir (`WORKING_PAPERS_SLUG`). O, yalnız başlığı, ünvanı və
giriş mətnini verir. Giriş mətni səhifə mətninin ilk akkordiona qədər olan hissəsidir. Ondan sonrakı köhnə il akkordionları köhnə link
siyahısıdır, göstərilmir.

Məqalələr admin paneldə **Nəşrlər və tədqiqatlar → İşçi məqalələri** bölməsindədir (`GET /api/v1/working-papers`).

| Sahə | Qeyd |
|---|---|
| Nömrə və il | Nömrə il daxilində 1–99. Kod `02/2025`, ünvan açarı `02-2025`: `/az/isci-meqaleler-silsilesi/02-2025`. Açar dillərdə eynidir |
| Məqalənin dili, JEL kodları | JEL kodları vergüllə yazılır, böyük hərflə saxlanılır (`C22, E53`) |
| Başlıq, müəlliflər, xülasə, açar sözlər, PDF | Hər dil üçün ayrıca. Müəlliflər və açar sözlər vergüllə yazılır |
| Status | Saytda yalnız "Dərc olunub" görünür |

- Məqalə yalnız həmin dildə başlığı varsa o dilin siyahısında görünür.
- Siyahı il azalan, il daxilində nömrə azalan sıradadır, səhifədə 10 sətir. Axtarış (`?q=`) başlıq, müəllif və açar sözlərdə gedir, İ/ı
  fərqi nəzərə alınmır. "İl" menyusu (`?year=`) yalnız məqaləsi olan illəri göstərir.
- Detal səhifəsində xülasə, JEL kodları, açar sözlər və PDF kartı var. Başqa dildə olmayan məqaləyə dil dəyişdiricisi siyahıya aparır.

**Ehtiyat:** dildə heç bir məqalə yoxdursa və ya API cavab vermirsə, siyahı səhifəsi öz CMS mətnini bütöv göstərir, köhnə akkordionlar da
daxil. Ona görə köhnə mətni silməyin. Köhnə məqalələrin köçürülməsi (US6) ayrıca fazadır.

## Menyu yeri və menyu qrupu

Səhifə formundakı **Saytın menyusunda** kartında səhifənin menyulardakı yeri seçilir:

| Seçim | Sol menyu | Açılan menyular (üst menyu, hamburger paneli, mobil menyu) |
|---|---|---|
| Bütün menyularda | var | var |
| Yalnız açılan menyularda | yox (səhifə özü açıq olanda var) | var |
| Menyularda yox | yox (səhifə özü açıq olanda var) | yox |

- "Ödəniş xidmətləri" "Yalnız açılan menyularda"dır.
- Bölmə kökü üçün ikinci seçim yoxdur.
- Köhnə "yalnız sol menyuda" ayarı olan səhifədə heç bir seçim işarəli olmur, kart bunu yazır və redaktor seçim edənə qədər dəyər dəyişmir.
- API-də bu iki bayraqdır: `showInSideNav` və `showInDropdownNav`. İkincisi boşdursa birincini izləyir (`isInDropdownNav`).

**Menyu qrupu** səhifə formunun dil tablarındadır, 120 simvola qədər. Eyni qrupu olan bacı səhifələr açılan menyuda bir yerdə göstəriləcək
("Strategiyalar və konsepsiyalar", "Ödəniş sistemləri"). Bu spec-də sayt etiketi hələ göstərmir: menyunun yeni dizaynı spec 055-dir.
