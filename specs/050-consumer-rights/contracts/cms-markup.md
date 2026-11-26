# Contract: CMS işarələməsi → bloklar (spec 050)

Qayda spec 024/047 kontraktının davamıdır: bloklar redaktorun adi elementlərindən tanınır, tanınmayan hər şey adi məzmun kimi qalır, mətn atılmır.
Parser `shared/lib/html-blocks.ts` (`parseBlocks`, DOM-suz) üzərindədir.

## 0. İki forma: köhnə import və redaktorun saxladığı

Test mühitindəki 93, 94, 95, 96 mətni **köhnə saytdan import olunub, redaktorda hələ saxlanmayıb**:

- `<details>`-lər arasında boşluq var;
- ay akkordeonları `<div><table><tbody><tr><td><div>…</div></td></tr></tbody></table></div>` sarğısındadır;
- hüceyrələr `<td>` içində `<p>`-siz, `<strong>`/`<em>` ilə gəlir;
- linklərdə `target`/`rel` yoxdur.

Redaktor saxlayanda TipTap bunu normallaşdırır: `colgroup` əlavə edir, hüceyrəyə `<p>` qoyur, linkə `target`/`rel` yazır.

- Parser **hər iki formanı** qəbul edir: sarğı elementlərini (`div`, `table`, `tbody`, `tr`, `td`, `th`, `p`) rekursiv açır, mətni `textOf` ilə oxuyur.
- **Layout fixture-i** (`fixtures/<layout>.html`) redaktorun saxladığı formadadır (guard tələbi, admin roundtrip bayt-bayt).
- Köhnə forma üçün ayrıca **parser testi** var: test API-dən götürülmüş qısa çıxarış `model/<layout>.test.ts`-də sətir kimi saxlanılır.
- `npm run roundtrip -- "Bank xidmətlərindən istifadə üzrə şikayət indeksi" "Vətəndaş müraciətlərinə dair statistika" "İnfoqrafika" "Kapital bazarı"`
  (canlı API) ay akkordeonunun cədvəl hüceyrəsində (`td > details`) saxlanmadan sonra itmədiyini yoxlayır. **İtirsə**, redaktor təlimatı ay
  akkordeonlarını cədvəlsiz yazmağı tələb edir (parser hər iki formanı oxuyur), saytda heç nə dəyişmir.

## 1. `consumer-text` — kök (87, 88), 86

| İşarələmə | Blok |
|---|---|
| birinci `<p>` (yalnız `<strong>`-dan ibarət olsa da) | `leadHtml` (strong açılır) |
| yalnız `<strong>`-dan ibarət sonrakı `<p>` (`promoteHeadingLines`) və ya `<h2>`/`<h3>` | `heading` |
| `<ul>` / `<ol>` | `numbered` — hər `<li>` bir nömrəli kart (Figma "Number" + "Text") |
| qalan | `html` |

Fixture `consumer-text.html`:

```html
<p>Azərbaycan Respublikasının Mərkəzi Bankının mühüm vəzifələrindən biri maliyyə xidmətləri istehlakçılarının və investorların hüquqlarını müdafiə etməkdir.</p>
<p>Bununla əlaqədar, Mərkəzi Bank istehlakçıların və investorların hüquqlarının müdafiəsi sahəsində aşağıdakı işləri görür:</p>
<ul><li><p>maliyyə xidmətləri istehlakçılarından … müvafiq tədbirlər görür;</p></li><li><p>…</p></li></ul>
<p><strong>İnzibati xətalar haqqında işlərə baxmağa səlahiyyəti olan vəzifəli şəxslər:</strong></p>
<ol><li><p>Mərkəzi Bankın sədr müavinləri;</p></li></ol>
<p>Son paraqraf.</p>
```

## 2. Arxiv (il → ay → fayl) — 93, 95, 96

```html
<details data-accordion=""><summary>2026</summary><div data-type="details-content">
  <details data-accordion=""><summary>May</summary><div data-type="details-content">
    <p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/1179" data-media-link="">Bank müştərilərinin … (2026-cı ilin may ayı üzrə)</a></p>
  </div></details>
</div></details>
```

- İl: `<summary>`-nin mətni 4 rəqəmdir. Ay: `<summary>`-nin mətni ay adıdır. Fayl: həmin ayın ilk `data-media-link` linki.
- Ay `<details>`-i ilin içində istənilən sarğı dərinliyindədir (§0).
- Arxivdən **sonra** gələn məzmun `restHtml`-dir: `complaint-index`-də metodologiya oradan oxunur (§3).

## 3. `complaint-index` — 95 (Bank) + 96 (Sığorta, yoldaş)

Arxivdən sonra:

```html
<h2>Şikayət indeksinin metodologiyası</h2>
<p>Banklar üzrə şikayət indeksinin hesablanması üçün aşağıdakı düsturdan istifadə olunmuşdur:</p>
<blockquote><p>Şikayət indeksi =</p><p>Şikayətlər üzrə bazar payı</p><p>Müştərilər üzrə bazar payı</p></blockquote>
<p>“Şikayətlər üzrə bazar payı” – …</p>
<p>“Müştərilər üzrə bazar payı” – …</p>
<p>Şikayət indeksinin izahı: …</p>
<p>Qeyd: Şikayət indeksi göstəricisi …</p>
```

| İşarələmə | Blok |
|---|---|
| arxivdən sonrakı birinci `<h2>` | `Methodology.title` |
| dəqiq 3 paraqraflı `<blockquote>` | `formula` (sol tərəf, surət, məxrəc) |
| "Qeyd:" / "Note:" ilə başlayan `<p>` | `note` (boz, 14/22) |
| qalan | `html` |

Sığorta (96) mətni Figma `2453:3928`-dən: məxrəc "Bağlanan müqavilələr üzrə bazar payı", izah 1.00 həddi, qeyddən sonra əlavə paraqraf (14/22, boz).
`<h2>` yoxdursa, metodologiya bloku yoxdur və `restHtml` adi məzmun kimi göstərilir.

Fixture `complaint-index.html`: iki il × iki ay + metodologiya.

## 4. `appeal-statistics` — 94 + 93 (İnfoqrafika, yoldaş)

```html
<p>(istəyə bağlı giriş)</p>
<details data-accordion=""><summary>Yazılı müraciətlər üzrə statistika</summary><div data-type="details-content">
  <details data-accordion=""><summary>2026</summary><div data-type="details-content">
    <table …><tbody>
      <tr><td><p>Aylar</p></td><td><p>Kredit təşkilatları</p></td>…<td><p>Cəmi</p></td></tr>
      <tr><td><p>Yanvar</p></td><td><p>1510</p></td>…<td><p>2142</p></td></tr>
      …
      <tr><td><p>Yekun</p></td>…</tr>
    </tbody></table>
  </div></details>
</div></details>
```

- Kanal: üst səviyyə `<details>`. Tab adı `<summary>`-dən " üzrə statistika" / " statistics" sonluğu atılaraq qurulur.
- Cədvəl forması: birinci sətrin birinci hüceyrəsi "Aylar"/"Months" → `months`. Son sətir "Yekun"/"Total" → `totalRow`. Sütun "Cəmi"/"Total" → `total`.
  Başqa forma → `generic` (Səyyar qəbul).
- İcmal: research R9.
- İnfoqrafika: yoldaş səhifənin arxivi (§2).

Fixture `appeal-statistics.html`: iki ay×sektor kanalı (hər birində iki il) + bir `generic` kanal.

## 5. `consumer-documents` — 101

```html
<details data-accordion=""><summary>Səhmdarların hüquq və vəzifələri</summary><div data-type="details-content">
  <p><strong>Səhmdarların hüquqları:</strong></p><ul><li><p>…</p></li></ul>
</div></details>
<details data-accordion=""><summary>Emitentlərin illik və yarımillik hesabatlarının təqdim edilməsi</summary><div data-type="details-content">
  <p>…</p>
  <p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/368" data-media-link="">“Emitentin idarəetmə hesabatlarına …” Qərar</a></p>
</div></details>
<details data-accordion=""><summary>İnformasiya sorğusu</summary><div data-type="details-content">
  <p>Azərbaycan Respublikası Mərkəzi Bankının sədrinin 06.03.2026-cı il tarixli 21s nömrəli Sərəncamı ilə …</p>
</div></details>
```

| İşarələmə | Blok |
|---|---|
| üst səviyyə `<details>` | `DocumentSection` (bağlı gəlir, çapda açılır — `data-accordion`) |
| yalnız `data-media-link` linkindən ibarət `<p>` | `file` (sənəd kartı, fayl tipi "PDF" pill-i) |
| qalan | `html` |

Boş `<a href=""></a>` (101-də var) `prepareCmsHtml`-də olduğu kimi qalır, görünmür.

## 6. Guard

Hər layout üçün: `web-cbar-new/src/features/about-content/fixtures/<layout>.html` = `web-cbar-admin-new/src/features/rich-text/fixtures/layouts/<layout>.html`
(bayt-bayt). `EXPECTED_BLOCKS`-ə sətir. Admin `roundtrip.test.ts` siyahısına layout. `check:layout-fixtures` iki nüsxəni tutuşdurur.
