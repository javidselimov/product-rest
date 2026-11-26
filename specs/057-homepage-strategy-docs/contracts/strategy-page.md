# Strategiya səhifəsi və köhnə ünvanlar — kontrakt (spec 057 US4)

## 1. Səhifə 104-ün mətni (`page_translations.content`, az və en)

Mənbə: `product-host/visitor/views/pages/strategy.php`. HTML entity-ləri UTF-8-ə çevrilir, mətn dəyişdirilmir. Forma redaktorun saxladığı formadır
(R17). Fikstür `web-cbar-admin-new/src/features/rich-text/fixtures/strategy-letter.html` (az) roundtrip testindədir.

```html
<p style="text-align: right;"><img src="/media/{PORTRAIT_ID}" alt="{PORTRAIT_ALT}" width="300"></p>
<h3>Hörmətli maliyyə sektoru iştirakçıları,</h3>
<p>Azərbaycan Respublikası Mərkəzi Bankının İdarə Heyəti tərəfindən “2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası” təsdiq olunmuşdur.</p>
<p>Strategiya ölkəmizdə …</p>
<!-- every legacy paragraph as its own <p>; the legacy <strong> words stay <strong> (sığorta sektoru, kapital bazarları, …) -->
<p>Strategiyanın icrası barədə məlumat illik əsasda ictimaiyyətə təqdim olunacaqdır.</p>
<p style="text-align: right;"><strong>Hörmətlə,</strong></p>
<p style="text-align: right;"><strong>Taleh Kazımov<br>Azərbaycan Respublikası Mərkəzi Bankının sədri</strong></p>
<p style="text-align: right;"><strong>26 yanvar 2024-cü il</strong></p>
<p>Strategiya sənədinin əhatəli icmalı ilə bu keçiddən istifadə etməklə tanış ola bilərsiniz:</p>
<p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/{PDF_AZ_ID}" data-media-link="">2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası</a></p>
```

en: başlıq "Dear financial sector participants,", imza "Best regards," / "Taleh Kazimov<br>Governor of the Central Bank of the Republic of Azerbaijan" /
"January 26, 2024", link cümləsi "Please follow the link to the comprehensive summary of the Strategy document:", link mətni "Financial Sector
Development Strategy 2024-2026", `href="/media/{PDF_EN_ID}"`.

- `{PORTRAIT_ALT}`: az "Taleh Kazımov, Azərbaycan Respublikası Mərkəzi Bankının sədri", en "Taleh Kazimov, Governor of the Central Bank of the Republic of
  Azerbaijan". Köhnə `alt=""` əvəzlənir, çünki portret məzmun şəklidir.
- Köhnə `<br/><br/>` ilə ayrılmış abzaslar ayrı `<p>`-dir. Sətir sonundakı boş `<br>`-lər atılır.
- Redaktorun saxladığı atribut sırası və boşluqlar fikstürdə necədirsə, alətin şablonu da eləcədir (roundtrip testi bunu kilidləyir): `text-align: right;` nöqtəli vergüllə, link `target="_blank" rel="noopener noreferrer nofollow"` ilə.
- Köhnə mətndə `<strong>` içində qalmış boşluq teqdən kənara çıxır ("<strong>ESİ</strong> (ekoloji"), sözlər yapışmasın.

Saytda: 104 adi CMS səhifəsidir (heç bir `SectionKey` deyil). `cms-content` mətni `prepareCmsHtml` ilə hazırlayır, `/media/{id}` api-cbar-ın media
proxy-sinə gedir, sol menyu `SectionSidebar`-dır (104, 105). Komponent kodu dəyişmir. **2026-11-24 (T061):** T053 göstərdi ki, portret sağda
deyil — Tailwind preflight `img`-i blok edir, `text-align` onu hərəkət etdirmir. `app/cms-content.css` indi sağa / mərkəzə düzlənmiş abzasın şəklinə
`margin-inline-start: auto` / `margin-inline: auto` verir, 744-dən dar ekranda sağa düzlənmiş şəkil sütunun tam enindədir. Qayda bütün CMS səhifələrinə
aiddir (test dump-ında sağa düzlənmiş şəkil 0, mərkəzə düzlənmiş 32).

## 2. İdxal aləti — `tools/media-backfill/import-strategy-page.mjs`

```text
node import-strategy-page.mjs --plan                 # downloads and checks the files (size, sha256, signature); no PG, no MinIO
node import-strategy-page.mjs --dry-run              # + PG (read): media found or new, each locale's decision, the HTML it would write
node import-strategy-page.mjs --apply                # writes MinIO objects, media_assets (+ media_asset_details), page_translations.content
options: --source=https://test.cbar.az (default) | https://www.cbar.az
         --report=strategy-report.json
```

| Addım | Qayda |
|---|---|
| Endirmə | `{source}/9183.png`, `{source}/2024_2026_Azerbaijani.pdf`, `{source}/2024_2026_English.pdf`. HTTP 200 və gözlənilən MIME (`image/png`, `application/pdf`) tələb olunur. Biri alınmasa çıxış kodu 1-dir, heç nə yazılmır |
| Media | `checksum_sha256` ilə mövcud silinməmiş sətir varsa o işlədilir. Yoxdursa obyekt `YYYY/MM/<sha256[0..16]>.<ext>` açarı ilə MinIO-ya, sətir `media_assets`-ə (`original_name` köhnə fayl adıdır) və `media_asset_details`-ə yazılır |
| Səhifələr | 104 = `page_translations (locale 'az', slug 'maliyye-sektorunun-inkisaf-strategiyasi')`. 105 = 104-ün `parent_id`-si 104 olan və az slug-ı `2024-2026-ci-illerde-maliyye-sektorunun-inkisaf-strategiyasi-icra-statusu` olan səhifə. Hər hansı tapılmasa çıxış kodu 1-dir |
| Mətn | Hər dil üçün ayrıca: `content(104, dil)` boşluqları normallaşdırılmış halda `content(105, dil)`-ə bərabərdirsə şablon yazılır. Artıq şablonun özüdürsə "eynidir". Fərqlidirsə "redaktor dəyişib, toxunulmadı" |
| Tranzaksiya | PG yazıları bir tranzaksiyadadır, MinIO yazıları ondan əvvəldir. MinIO obyekti artıq varsa yenidən yazılmır |
| Hesabat | `{ source, files: [{name, sha256, size, mediaId, created}], pages: {az: 'written'|'same'|'edited', en: …} }` |

README: `.env` açarları, test → prod ardıcıllığı, geri qaytarma (104-ün mətni 105-dən yenidən köçürülür, media sətirləri qalır, çünki yaddaşda başqa
səhifə istinad edə bilər).

## 3. Köhnə ünvanlar (web-cbar-new)

| Köhnə ünvan | Hədəf | Harada |
|---|---|---|
| `/pages/strategy`, `/az/pages/strategy`, `/en/pages/strategy`, `?language=az|en` | `/{locale}/{STRATEGY_SLUG[locale]}` | `src/proxy.ts` `LEGACY_PAGES` |
| `/page-872`, `/page-872/<hər şey>` (+ dil prefiksi, `?language=`) | `/{locale}/{RISK_SUPERVISION_SLUG[locale]}` | `src/proxy.ts` `LEGACY_PAGES` |
| `/page-878`, `/page-878/<hər şey>` | `/{locale}/{MICROFINANCE_SLUG[locale]}` | `src/proxy.ts` `LEGACY_PAGES` |
| `/2024_2026_Azerbaijani.pdf` | `/az/maliyye-sektorunun-inkisaf-strategiyasi` | `next.config.ts` `redirects()` (matcher nöqtəli yolu buraxır) |
| `/2024_2026_English.pdf` | `/en/financial-sector-development-strategy` | `next.config.ts` `redirects()` |

Slug sabitləri (`entities/page-node`):

| Sabit | az | en |
|---|---|---|
| `STRATEGY_SLUG` | `maliyye-sektorunun-inkisaf-strategiyasi` | `financial-sector-development-strategy` |
| `RISK_SUPERVISION_SLUG` | `risk-esasli-nezaret-uzre-siyaset-konsepsiyasi` | `risk-based-supervision-policy-concept` |
| `MICROFINANCE_SLUG` | `mikromaliyye-modeli-uzre-strateji-cercive` | `strategic-framework-for-a-microfinance-model` |

Status hər yerdə 308-dir, `LEGACY_PAGES` kimi. `next.config` `permanent: true` də 308 verir. Testlər `proxy.test.ts`-də: hər sətir, dil prefiksi,
`?language=en`, slug-suz forma.
