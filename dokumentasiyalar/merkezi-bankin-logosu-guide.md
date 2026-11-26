# Mərkəzi Bankın loqosu — idarəetmə təlimatı

Bu sənəd cbar.az-ın **«Mərkəzi Bankın loqosu»** səhifəsini admin paneldən necə idarə etməyi, dəyişikliyin saytda harada,
necə görünəcəyini izah edir. Səhifədəki bütün mətn, loqo şəkilləri və yükləmə faylları admin paneldən gəlir. Dəyişiklik üçün
proqramçı və deploy lazım deyil.

---

## 1. Qısa xülasə

| | Harada |
|---|---|
| **Admin panel** | Səhifələr → Media → Mərkəzi Bankın Logosu (test mühitində id `553`) |
| **Sayt** | `https://<sayt>/az/media/merkezi-bankin-logosu`, `https://<sayt>/en/media/central-bank-logo` |
| **Saytda yolu** | Media → **Mərkəzi Bankın loqosu** (sol menyu, breadcrumb) |

Səhifə üç hissədən ibarətdir:

1. **Hero**: böyük boz qutuda əsas loqo. Bu, cədvəlin birinci sətrinin şəklidir.
2. **Loqo versiyaları**: hər versiya bir kartdır (önizləmə, ad, izah). Kartlar səhifənin mətnindəki cədvəldən qurulur.
3. **Yükləmə kartları**: format, ölçü və "Yüklə" düyməsi. Bunlar səhifənin **Sənədlər** blokundakı fayllardır.

## 2. Hazırlıq

- Slug-ı dəyişməyin: az `merkezi-bankin-logosu`, en `central-bank-logo`. Səhifənin görünüşü bu ünvanlara bağlıdır. Başlığı
  dəyişmək slug-a təsir etmir.
- Səhifə **Media** kökünün altında qalmalıdır. Sol menyu və breadcrumb ondan qurulur.
- Yönləndirmə lazım deyil. Köhnə saytda belə səhifə olmayıb, yeni ünvan menyudan avtomatik açılır.

## 3. Admin paneldə əməliyyatlar

### Başlıq

Figma yazılışı **«Mərkəzi Bankın loqosu»**-dur (test mühitində indi «Logosu» yazılıb). EN: **«Central Bank logo»**.

### Loqo versiyaları (cədvəl)

Versiyalar səhifə mətnindəki **birinci cədvəldən** qurulur. Hər sətir bir kartdır:

| 1-ci sütun | 2-ci sütun | 3-cü sütun | 4-cü sütun |
|---|---|---|---|
| Loqo şəkli | Versiyanın adı | İzah, boş ola bilər | Fon: `açıq` və ya `tünd` |
| (şəkil) | Rəngli horizontal versiya | Əsas versiya. Açıq fonlarda istifadə olunur | açıq |
| (şəkil) | Ağ horizontal versiya | Tünd və rəngli fonlar üçün | tünd |

- **Şəkil qoymaq**: kursoru 1-ci xanaya qoyun, alətlər panelində **«Şəkil əlavə et»**, faylı seçin. Şəkil SVG və ya şəffaf fonlu
  PNG olsun ki, önizləmədə kənarı görünməsin.
- **Fon**: ağ loqo üçün `tünd` yazın, önizləmə tünd göy fonda göstərilir. Boş və ya başqa söz açıq (boz) fondur. EN-də `dark` / `light`.
- **Hero**: birinci sətrin şəklidir. Əsas loqonu birinci sətirdə saxlayın.
- **Yeni versiya**: cədvələ sətir əlavə edin. Ən çoxu 8 versiya olur.
- **Versiyanı silmək**: sətri silin.
- **Sıranı dəyişmək**: sətirləri yerdəyişin. Kartlar cədvəlin sırası ilə düzülür.
- **«Loqo versiyaları» başlığı** cədvəldən əvvəlki `Başlıq 2`-dir. Mətni dəyişə bilərsiniz.

### Yükləmə faylları (Sənədlər)

1. Səhifənin altındakı **Sənədlər** blokunda **«Sənəd əlavə et»** düyməsini basın, faylı yükləyin.
2. **«Başlıqları redaktə et»** ilə hər dil üçün ad yazın: məs. `SVG`, `PNG`, `PDF / EPS`. Bu ad saytda kartın çipidir.
   Ad yazılmasa, çipdə faylın növü (`ZIP`, `PNG`…) görünür.
3. Sıranı oxlarla dəyişin. Kartlar bu sıra ilə düzülür.
4. Ölçünü yazmaq lazım deyil, sayt faylın ölçüsünü özü göstərir.

**İcazə verilən fayl növləri**: SVG, PNG, JPG, PDF, ZIP. **EPS və AI birbaşa yüklənmir**, onları da arxivə qoyun (aşağıda).

**Qrup etiketi** bu səhifədə işlənmir, boş saxlayın.

### Format arxivləri: bir kliklə bütün loqolar

İstifadəçi «SVG» kartında «Yüklə»-yə basanda **bütün loqoların SVG-lərini**, «PNG»-də **bütün loqoları bütün ölçülərdə**,
«PDF»-də **bütün loqoların PDF-lərini** bir dəfəyə almalıdır. Bunun üçün hər format bir ZIP arxividir və bir kartdır:

| Kartın adı (az / en) | Fayl | Arxivin içi |
|---|---|---|
| `SVG` | `cbar-logo-svg.zip` | hər versiyanın bir SVG faylı |
| `PNG` | `cbar-logo-png.zip` | hər versiya, hər ölçü (məs. 512, 1024, 2048 px) |
| `PDF` | `cbar-logo-pdf.zip` | hər versiyanın PDF faylı; EPS lazımdırsa buraya qoyun və kartın adını `PDF / EPS` yazın |

**Arxivi hazırlamaq.** Faylları kompüterdə qovluğa yığın, adlarını versiya + ölçü ilə yazın ki, açanda qarışmasın:

```
cbar-logo-png/
  cbar-logo-reng-horizontal-512.png
  cbar-logo-reng-horizontal-1024.png
  cbar-logo-reng-horizontal-2048.png
  cbar-logo-ag-horizontal-512.png
  ...
```

Qovluğa sağ klik → **Göndər → Sıxılmış (zip) qovluq** (Windows) və ya **Compress** (macOS). Adlarda boşluq və
Azərbaycan hərfləri işlətməyin (`ağ` → `ag`), bəzi proqramlar onları arxivdə korlayır. PNG-nin hansı ölçülərdə verildiyini
istəsəniz versiyanın izahında və ya cədvəldən sonrakı mətndə yazın.

**Yükləmək.** Hər arxivi yuxarıdakı kimi Sənədlərə əlavə edin, adını yazın (`SVG`, `PNG`, `PDF`), sıranı düzün. Ölçünü sayt
özü göstərir. Bir arxiv ən çoxu 250 MB ola bilər.

**Loqo dəyişəndə.** Sayt arxivin içinə baxmır, ona görə yeni və ya dəyişən versiya avtomatik arxivə düşmür. Həmin formatların
arxivini yenidən yığın, Sənədlərdə köhnə faylı silin, yenisini yükləyib eyni adı və sıranı verin. Cədvəldəki şəkli də
dəyişməyi unutmayın: önizləmə ordan gəlir, arxiv yalnız endirmə üçündür.

### Sıfırdan doldurmaq

Repo kökündəki `merkezi-bankin-logosu-html/` qovluğunda hər dil üçün hazır HTML var. Redaktorda mənbə rejimini (`</>`) açıb
faylın hamısını yapışdırın, sonra hər sətrə şəkil qoyun. Addımlar `merkezi-bankin-logosu-html/README.md`-dədir.

## 4. Saytda nə görünür

Başlıq, Hero, «Loqo versiyaları» başlığı, versiya kartları, sonra yükləmə kartları. Cədvəldən sonra yazılan mətn yükləmə
kartlarından əvvəl düşür. Sənədlər səhifənin altında ayrıca siyahı kimi təkrar göstərilmir.

| | Telefon | Planşet | Desktop |
|---|---|---|---|
| Versiya kartları | 2 sütun | 2 sütun | 4 sütun |
| Yükləmə kartları | 1 sütun | 3 sütun | 3 sütun |

Şəkli olmayan versiya boş önizləmə qutusu ilə görünür. Birinci sətrin şəkli yoxdursa Hero görünmür. Fayl yoxdursa yükləmə
kartları görünmür.

## 5. Yoxlama siyahısı

- [ ] Hər iki dildə başlıq və cədvəl doludur.
- [ ] Hər sətrin şəkli var, ağ loqoların fonu `tünd`-dür.
- [ ] Versiya kartları görünür, cədvəl görünmür.
- [ ] Hər yükləmə kartının adı var, «Yüklə» düyməsi düzgün faylı endirir.
- [ ] SVG, PNG, PDF arxivlərini açıb yoxlayın: hər versiya var, PNG bütün ölçülərdədir, cədvəldəki loqolarla eynidir.
- [ ] EN mətni redaksiyadan keçib.

## 6. Tez-tez rast gələn problemlər

| Problem | Səbəb | Həll |
|---|---|---|
| Kart yerinə cədvəl görünür | Bir sətirdə ad boşdur, sütun sayı 3–4 deyil, ya 8-dən çox sətir var | Cədvəli düzəldin |
| Kart yerinə cədvəl görünür, fayllar adi siyahıdır | Slug dəyişdirilib | Slug-ı `merkezi-bankin-logosu` / `central-bank-logo` edin |
| Ağ loqo görünmür | Fon xanası `tünd` deyil | 4-cü xanaya `tünd` yazın |
| Hero yoxdur | Birinci sətirdə şəkil yoxdur | Birinci sətrə əsas loqonu qoyun |
| EPS yüklənmir | EPS icazəli növ deyil | ZIP arxivinə yığıb yükləyin |
| Çipdə `ZIP` yazılır | Faylın adı yazılmayıb | «Başlıqları redaktə et» ilə ad yazın |
| Endirilən arxivdə yeni loqo yoxdur | Arxiv yenidən yığılmayıb, sayt onu özü yeniləmir | Arxivi yenidən yığıb köhnəsinin yerinə yükləyin |
| Arxivdə fayl adları qəribə simvollardır | Adda Azərbaycan hərfi və ya boşluq var | Adları latın hərfləri və `-` ilə yazıb yenidən sıxın |

## 7. Developerlər üçün

Kontrakt: `specs/040-media-logo/contracts/cms-markup.md`. Parser: `web-cbar-new/src/features/about-content/model/brand-logos.ts`,
widget: `web-cbar-new/src/widgets/about-blocks/brand-logos.tsx`. API və admin kodu dəyişməyib, admin paneldə yalnız layout
fikstürü (`fixtures/layouts/brand-logos.html`) və roundtrip testi əlavə olunub.
