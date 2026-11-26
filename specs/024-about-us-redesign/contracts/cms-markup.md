# Kontrakt: "Haqqımızda" səhifələri üçün CMS markup-ı

Bu sənəd redaktorun admin paneldə yazdığı HTML ilə saytın Figma blokları arasındakı
müqaviləni təyin edir (spec FR-006…FR-008, research R1–R4). Redaktor üçün sadə dildə
versiyası: `product-rest/web-cbar-new/docs/about-cms-guide.md`.

## 1. Ümumi qaydalar

1. Yalnız CMS redaktorunun qoruduğu elementlər istifadə olunur (research R1). `class` və
   `data-*` (redaktorun öz `data-accordion` / `data-type` / `data-media-link`-i istisna)
   **heç vaxt** qaydaya daxil deyil.
2. Qaydalar **yalnız yuxarı səviyyə bloklara** baxır (`content`-in birbaşa uşaqları). İç-içə
   strukturda (məs. cədvəl içində cədvəl) yalnız yuxarı səviyyə tanınır.
3. Layout səhifə slug-ı ilə seçilir (research R2). Layout-a aid olmayan forma (məs. `plain`
   səhifədə cədvəl) adi CMS məzmunu kimi qalır.
4. Hər qayda **ya tam tanınır, ya da heç tanınmır**: tanınmayan blok dəyişmədən adi məzmun kimi
   eyni yerdə göstərilir. Heç bir mətn atılmır (FR-008).
5. "**Başlıq-sətir**" = `<h2>`, `<h3>`, `<h4>` **və ya** yalnız bir `<strong>`-dan ibarət
   `<p>` (`<p><strong>Dürüstlük</strong></p>`, boşluqlar nəzərə alınmır). Sonuncu legacy
   məzmunun (bu günkü Missiya, bio) dəyişmədən işləməsi üçündür.
6. "**Şəkil-paraqraf**" = içində yalnız `<img>` (və ya `<a><img></a>`) və boşluq olan `<p>`.
7. Mətn sahələri (tarix, il, başlıq) teqlərdən təmizlənmiş, boşluqları normallaşdırılmış
   düz mətndir. HTML fraqmentləri (`*Html`) `prepareCmsHtml`-dən keçmiş sətirdir.

## 2. `about-main` — Haqqımızda əsas səhifəsi

| Blok | Tanınma qaydası | Figma |
|---|---|---|
| **Tarix kartları** | Səhifədəki **ilk** yuxarı səviyyə `<table>`. Hər `<tr>` tam 2 hücrəlidir (`th` sətri başlıq sayılır və atlanır). Hücrə 1 = tarix (düz mətn, boş olmamalı). Hücrə 2 = kart mətni (HTML). 1–6 sətir | `1186:14884`: 312×160, r4, p20, haşiyə neutral-300. Tarix 18/600 brand-500, mətn 16/400 |
| **Vurğulanmış qutu** | Hər yuxarı səviyyə `<blockquote>`. İlk uşaq başlıq-sətirdirsə qutu başlığıdır, qalanı gövdə | `1186:14894` qutusu: `bg` brand-100, r4, p20, gap24. Başlıq 20/600 brand-500, ilk paraqraf 16/400 brand-500 |
| **Funksiyalar accordion-u** | Ardıcıl yuxarı səviyyə `<details data-accordion>` qrupu. Qrupda birincisi `open` render olunur | `1186:14901`: ağ, haşiyə neutral-200, r4, p16, gap16. Başlıq 16/600, caret 20 |
| Qalan | Figma tipoqrafiyası: `h2`/`h3` 20/600, `p` 16/400 lh28 (mobil 14/400), bölmələr arası 32 | |

Cədvəl qaydaya uymursa (məs. 3 hücrəli sətir) **bütün cədvəl** adi cədvəl kimi qalır.

## 3. `history` — Tarix

| Blok | Tanınma qaydası | Figma |
|---|---|---|
| **Hero kart** | İlk timeline cədvəlindən **əvvəlki** ilk başlıq-sətir. Yoxdursa hero göstərilmir. Başlıqdakı `<em>` hissəsi kursiv vurğu rəngi ilə göstərilir (Figma-da "mərkəzi bankçılıq") | `1845:118925`: 984×206, r8, gradient brand-500→brand-800, mətn Lora 36/600 lh53 ağ, `em` site-accent-strong kursiv (mobil 24/600, 342×120). Lora yalnız bu başlıqdadır (`font-serif`, research R11) |
| **Timeline** | Səhifədəki **ilk** yuxarı səviyyə `<table>`, hər sətir 2 hücrə. Hücrə 1 = tarix mətni, içində 1000–2999 aralığında **4 rəqəmli il** olmalıdır | ~~`898:3060`~~ → spec 026: bir ilin kartı + üfüqi il oxu, `1845:119481` |
| Hadisə ili | Hücrə 1-dəki ilk 4 rəqəmli ədəd | `date`: il 44/600, 112 en |
| Hadisə gün-ayı | Hücrə 1-dən il çıxarılandan sonra qalan mətn (`7 mart`, `fevral`, boş ola bilər) | 14/500 |
| Vurğu (əsas mərhələ) | Hücrə 1-də il `<strong>` içindədir | `circle history` `#4BC7B5` halqalı marker |
| Hadisə başlığı | Hücrə 2-nin ilk başlıq-sətri | 20/600 brand-500 |
| Hadisə mətni | Hücrə 2-də başlıqdan və şəkil-paraqraflardan qalan HTML | 16/400 lh28 |
| Hadisə şəkilləri | Hücrə 2-nin şəkil-paraqraflarındakı `<img>`-lər, sıra ilə | spec 026: **foto düzülüşü** (aşağıda) |
| Qutu görünüşü | Vurğulu **və ya** (şəkil var **və** düzülüş `note` deyil) | spec 026: ağ 5% fon, teal 60% haşiyə, r4, p16 |
| **İl oxu** | Hadisələrin unikal illəri, cədvəldə ilk rast gəlinmə sırası ilə. Hər ilin paneli `id="year-{yyyy}"` | spec 026: `1845:119481` → `Axis` (ox nöqtəsi + il etiketi) |
| **Foto düzülüşü** (spec 026) | İşarə yoxdursa avtomatik: 1 şəkil `single`; 2 → `note`; 3 → birinci `<img>`-in `height > width` atributları varsa `tall`, əks halda `hero2`; 4+ → `hero2` | `single` 450:361 · `note` 75+429 yan-yana · `hero2` üstdə enli + altda iki · `tall` solda hündür + sağda iki |
| **Düzülüş işarəsi** (spec 026) | Hücrə 2-də bütün mətni `[foto: single\|note\|hero2\|tall]` olan paraqraf (hərf ölçüsü və boşluq fərq etmir). Tanınan işarə göstərilmir və avtomatik seçimi əvəz edir. Tanınmayan (`[foto: xyz]`) adi mətn kimi qalır. Bir neçəsi varsa birincisi işləyir | — |

- İli tapılmayan sətir timeline-dan çıxmır: əvvəlki hadisənin ilinin kartına, markersiz
  düşür. Cədvəl ilsiz sətirlə başlayırsa, o birinci ilin əvvəlinə düşür (spec 026 research R3).
- Eyni il cədvəldə ardıcıl olmayan sətirlərdədirsə, il oxda bir dəfə görünür, hadisələri
  ilk rast gəlindiyi kartda toplanır.
- Ünvan: `#1992` (sayt il dəyişəndə belə yazır) və köhnə `#year-1992` eyni ili açır.
- Timeline cədvəli yoxdursa səhifə `plain` kimi göstərilir (hero yenə göstərilə bilər).
- Cədvəldən sonrakı məzmun timeline-dan sonra adi məzmun kimi gəlir.

## 4. `mission` — Missiya və dəyərlər

| Blok | Tanınma qaydası | Figma |
|---|---|---|
| **Missiya banneri** | İlk yuxarı səviyyə `<blockquote>`. Bütün mətni banner mətnidir | `968:1094`: gradient brand-500→brand-800 (Tarix hero ilə eyni), r8, p40. Mətn `968:1095`: 22/500 lh168% ağ (mobil 18); `<em>` Lora italik secondary-500 |
| **Dəyər sətri** | Bannerdən sonrakı hər başlıq-sətir yeni dəyər başlayır. Növbəti başlıq-sətrə qədər olan bloklar onun mətnidir. Mətndə ilk şəkil-paraqrafın `<img>`-i ikon olur və mətndən çıxır | `968:1100`: sol sütun 200 (ikon 48×48 r6 `bg` secondary-50 + ad 18/700 brand-500, gap24), sağ mətn 16/400, gap24. Sətirlər arasında neutral-200 xətt, xətt ilə sətir arası 36 |
| Banner yoxdursa | Dəyər sətirləri yenə qurulur, banner göstərilmir | |
| İlk başlıq-sətirdən əvvəlki məzmun (banner xaric) | Adi məzmun, bannerdən sonra | |

## 5. Bioqrafiya (əməkdaşın `bio` sahəsi)

Layout-dan asılı deyil, həmişə tətbiq olunur. Hər yuxarı səviyyə `h2`/`h3` (və ya başlıq-sətir)
bölmə başlığıdır: 20/600, gövdə 16/400, bölmələr arası 32, başlıq–gövdə 24 (Figma
`1199:17024`). Başlıq yoxdursa bio adi mətn kimi göstərilir. Bu günkü bio-larda başlıq yoxdur:
redaktor "Doğum tarixi", "Təhsil", "Peşəkar fəaliyyəti", "Ailə vəziyyəti" başlıqlarını əlavə edir.

## 6. Nümunə HTML (roundtrip və test fikstürü)

Bu nümunələr admin redaktorunun yaratdığı formadadır. `features/about-content/model/parse.test.ts` fikstürləri
və roundtrip sübutu (research R15) bunlardan istifadə edir.

```html
<!-- about-main -->
<p>Azərbaycan Respublikasının Milli Bankı … yaradılmışdır.</p>
<table style="min-width: 50px"><colgroup><col><col></colgroup><tbody>
<tr><td colspan="1" rowspan="1"><p>11.02.1992</p></td><td colspan="1" rowspan="1"><p>“Azərbaycan Respublikası Milli Bankının yaradılması haqqında” Fərman</p></td></tr>
<tr><td colspan="1" rowspan="1"><p>10.12.2004</p></td><td colspan="1" rowspan="1"><p>“Azərbaycan Respublikasının Mərkəzi Bankı haqqında” Qanun</p></td></tr>
</tbody></table>
<blockquote><h3>Mərkəzi Bankın məqsədləri</h3><p>Mərkəzi Bankın fəaliyyətinin əsas məqsədi …</p></blockquote>
<h2>Mərkəzi Bankın funksiyaları</h2>
<details data-accordion=""><summary>Pul və məzənnə siyasətinin müəyyən edilməsi və həyata keçirilməsi</summary><div data-type="details-content"><p>…</p></div></details>
<details data-accordion=""><summary>Manatın rəsmi məzənnəsinin müəyyən edilməsi</summary><div data-type="details-content"><p>…</p></div></details>

<!-- history -->
<h2>Bir əsrdən artıq <em>mərkəzi bankçılıq</em> tarixi</h2>
<table style="min-width: 50px"><colgroup><col><col></colgroup><tbody>
<tr><td colspan="1" rowspan="1"><p>7 mart 1919</p></td><td colspan="1" rowspan="1"><h3>Dövlət Bankının təsis edilməsi haqqında qərar qəbul edilib</h3><p>…</p></td></tr>
<tr><td colspan="1" rowspan="1"><p>11 fevral <strong>1992</strong></p></td><td colspan="1" rowspan="1"><h3>Azərbaycan Respublikası Milli Bankı yaradılıb</h3><p>…</p><p><img src="/media/120" alt="Fərman"></p></td></tr>
</tbody></table>

<!-- mission -->
<blockquote><p>Missiyamız - cavabdehliyi təşviq etmək, dürüstlüyü qorumaq və inkişafı dəstəkləməklə maliyyə sabitliyini təmin etmək</p></blockquote>
<h3>Dürüstlük</h3><p><img src="/media/121" alt=""></p><p>Təşkilati kimliyimizin mərkəzində dürüstlük dayanır …</p>
<h3>Cavabdehlik</h3><p>Biz, mandatımızdan irəli gələn …</p>
```

## 7. Dəyişiklik qaydası

Bu kontrakt dəyişəndə: (1) `parse.test.ts` fikstürləri, (2) redaktor təlimatı,
(3) roundtrip sübutu eyni dəyişiklikdə yenilənir. Roundtrip sübutu `features/about-content/fixtures/*.html`
faylları və onların admin nüsxəsidir (`src/features/rich-text/fixtures/layouts/`); yeni layout onsuz `verify`-dan keçmir
(kök `CLAUDE.md`, `web-cbar-new` bölməsi). Mövcud qaydanın mənasını dəyişmək artıq
formaya salınmış CMS məzmununu pozur. Yeni qayda yalnız əlavə olunur.
