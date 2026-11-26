# Kontrakt: Maliyyə savadlılığı səhifələrinin işarələməsi

Spec 024 `contracts/cms-markup.md` qaydalarının davamıdır: yalnız **yuxarı səviyyəli** bloklara baxılır. Hər qayda ya bütöv tanınır, ya da blok adi
məzmun (`html`) kimi yerində qalır, heç bir mətn atılmır. Giriş `prepareCmsHtml` nəticəsidir. Slug → layout xəritəsi [research.md](../research.md) R3-dədir.

Ümumi təriflər:

- **Başlıq sətri**: spec 024 §1.5 (`h2`–`h4` və ya yalnız `<strong>`-dan ibarət `<p>`). Burada səviyyə vacibdir: `h2` bölmə başlığıdır, `h3` alt başlıqdır.
  Yalnız `<strong>`-dan ibarət `<p>` `h3` sayılır.
- **Media paraqrafı**: içində yalnız `<a data-media-link href="/media/{id}">…</a>` linkləri (və boşluq/`<br>`) olan `<p>`. `{id}` səhifənin faylları
  arasında **şəkil olmayan** fayl kimi varsa (`mimeType` `image/` ilə başlamır), paraqraf media paraqrafı sayılmır. Fayllar arasında olmayan id
  şəkil sayılır, çünki fixture testi `parseAbout`-u faylsız çağırır.
- **Poçt linki**: `href="mailto:…"`. Ünvan `mailto:`-dan sonrakı hissədir (kiçik hərflə, `?`-dən əvvəl).

## §1. `financial-literacy` (kök "Maliyyə savadlılığı", Ümumi məlumat)

| Element | Blok | Görünüş |
|---|---|---|
| birinci `h2`-dən əvvəlki məzmun | `intro` (html) | adi mətn |
| `h2` | bölmə başlıqlı `section`; növbəti `h2`-yə və ya CTA-ya qədər olan bloklar onun içindədir | 24/32 başlıq, daxili `gap 24`, bölmələr arası `gap 36` |
| `h3` | `subheading` | 18/26 |
| `blockquote`, içində poçt linki **yoxdur** | `quote`: birinci paraqraflar mətndir. Bir neçə paraqraf varsa, **sonuncu** paraqraf mənbədir | sitat qutusu, sol xətt 4px |
| `ul`: hər `li` başlıq sətri ilə açılır (`<li><p><strong>Ad</strong></p><p>Təsvir</p></li>`) | `principles`: kartlar (başlıq + təsvir, ikon sıra ilə) | 4 / 2 / 1 sütun |
| `ul`: birbaşa `h3`-dən sonra gəlir, `li`-lərdə qalın başlıq yoxdur | `chips`: etiketlər (ikon sıra ilə) | 4 / 2 / 1 sütun |
| media paraqrafı | `gallery` (`PhotoGallery`) | böyük şəkil + miniatürlər |
| `blockquote`, içində poçt linki **var** | `cta`: 1-ci paraqraf yuxarı sətir, 2-ci paraqraf başlıq, qalan paraqraflar ünvan sətri; düymə həmin poçt ünvanına | qradiyent banner |
| qalan hər şey | `html` | adi mətn |

Qeydlər:

- CTA mətnin harasında olursa olsun sonda, bölmələrdən kənarda göstərilir. Bir neçə CTA varsa yalnız birincisi CTA-dır, qalanları sitat qaydası ilə oxunur.
- Qalın başlıqsız `ul` `h3`-dən sonra gəlmirsə adi siyahıdır.
- `li`-nin bir hissəsi başlıqsızdırsa, bütöv `ul` kart sayılmır (bütöv tanınır və ya heç).
- Qalereya şəkillərinin `alt` mətni yoxdur, link mətni ("1", "2" …) mənasızdır. `alt` chrome-dan qurulur: `"{{title}} — şəkil {{n}}"`.

Redaktorun saxladığı nümunə: `features/about-content/fixtures/financial-literacy.html` (seed-in az mətni ilə eynidir).

```html
<p>İnsanın fərd kimi inkişafı … olduqca vacibdir.</p>
<h2>İnsan maliyyə cəhətdən necə sağlam ola bilər?</h2>
<p>Bunun üçün …</p><p>Məktəblərdə isə …</p>
<h2>Maliyyə savadlılığı nədir?</h2>
<blockquote><p>Maliyyə savadlılığı fərdlərin … davranışlar toplusudur.</p><p>İƏİT (İqtisadi Əməkdaşlıq və İnkişaf Təşkilatı), 2012</p></blockquote>
<p>Maliyyə savadlılığını insanlar …</p>
<h2>Maliyyə sağlamlığının dörd prinsipi</h2>
<p>Yüksək rifah üçün aşağıdakı …:</p>
<ul><li><p><strong>Dayanıqlı gəlir</strong></p><p>Sabit və davamlı gəlir mənbəyinə malik olmaq</p></li>…</ul>
<p>Təcrübə göstərir ki, …</p>
<h2>Mərkəzi Bankın fəaliyyəti</h2>
<p>Azərbaycan Respublikasının Mərkəzi Bankı …</p>
<h3>Əsas hədəf qrupları</h3>
<ul><li><p>Məktəblilər</p></li>…</ul>
<h3>Maarifləndirmə formatları</h3>
<p>Maarifləndirmə məqsədilə …</p>
<p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/1380" data-media-link="">1</a>…</p>
<blockquote><p>Sizi də bu təşəbbüslərə qoşulmağa dəvət edirik!</p><p>Maliyyə sağlamlığınızın qayğısına birlikdə qalaq!</p><p>Müraciət, təklif və rəylər üçün ünvan: <a target="_blank" rel="noopener noreferrer nofollow" href="mailto:mmpi@cbar.az">mmpi@cbar.az</a></p></blockquote>
```

## §2. `literacy-platform` (Portal, Virtual Təhsil Platforması, Məlumat-axtarış sistemi)

| Element | Blok | Görünüş |
|---|---|---|
| birinci `h2`-dən əvvəlki məzmun (qeyd və media paraqrafı istisna) | `intro` (html) | adi mətn |
| `blockquote` | `note`: qeyd qutusu (bütün `blockquote` qaydası, poçt linki ola bilər) | `#e9faf7` fon, sol xətt 3px, 16/26 500 |
| media paraqrafı (harada olursa) | `photos`: foto sırası, hər şəkil faylı yeni tabda açan link | 3 sütun; mobil üfüqi sürüşmə |
| `h2` | `section`: üst xətli bölmə, növbəti `h2`-yə qədər | 20/28 başlıq (mobil 18/28), `pt 24`, `gap 12` |
| **sonuncu** blok: içində yalnız bir xarici `http(s)` link olan `<p>` | `link-button`: düymə, mətni linkin mətnidir | `#004976` düymə, 48px; mobil tam en |
| qalan hər şey | `html` | adi mətn |

Göstərilmə sırası Figma kimidir: `intro` → `note` → `photos` → bölmələr → düymə. Qeyd və foto sırası mətnin harasında olursa olsun girişdən sonra
gəlir. Hər birindən yalnız birincisi tanınır, qalanları adi məzmun kimi yerində qalır.

Redaktorun saxladığı nümunə: `features/about-content/fixtures/literacy-platform.html` (Virtual Təhsil Platformasının seed mətni; bütün qaydaları əhatə edir).

## §3. Admin round-trip

`financial-literacy.html` və `literacy-platform.html` `web-cbar-admin-new/src/features/rich-text/fixtures/layouts/`-a eyni baytlarla kopyalanır və
`roundtrip.test.ts` siyahısına əlavə olunur. Redaktor onları dəyişmədən saxlamalıdır. Xüsusilə yoxlanmalı olanlar: `li` içində `p`, `blockquote` içində
`mailto:` linki, `data-media-link`.
