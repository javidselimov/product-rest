# FinCERT — redaktor qeydi (spec 053)

FinCERT **ayrıca məzmun növüdür**. Missiya, fəaliyyət istiqamətləri, əlaqə, hesabat portalı, RFC-2350 və beynəlxalq üzvlüklər admin paneldə
**FinCERT** bölməsindədir: tablar Ümumi, Fəaliyyət istiqamətləri, Beynəlxalq üzvlüklər. Səhifənin mətnində HTML kimi yazılmır. CMS səhifəsi
`fincert` (səhifə 133, az və en slug eynidir) yalnız başlığı, ünvanı və ehtiyat mətni verir.

Ətraflı oxu üçün:
- redaktorlar üçün addım-addım təlimat: `../../dokumentasiyalar/fincert-guide.md`;
- spec: `../../specs/053-fincert-page/`.

| Saytda | Haradan gəlir |
|---|---|
| Başlıq (H1), ünvan, breadcrumb | CMS səhifəsi `fincert` (`FINCERT_SLUG`, `entities/page-node`) |
| Missiya, əlaqə kartları, portal kartı, RFC-2350 kartı | `GET /api/v1/fincert?locale=` → panelin **FinCERT → Ümumi** forması |
| Nömrəli akkordionlar | Eyni cavabın `directions` hissəsi → **FinCERT → Fəaliyyət istiqamətləri** |
| Üzvlük kartları (FIRST) | Eyni cavabın `memberships` hissəsi → **FinCERT → Beynəlxalq üzvlüklər** |
| Bölmə başlıqları, "Portala keçid", "Elektron poçt" kimi etiketlər | Saytın sabit mətnləri, `locales/{az,en}/fincert.json` |

## Bölmələr və görünmə qaydası

Bölmələr Figma sırası ilə gəlir. Hər biri yalnız ziyarətçinin dilində məzmunu olanda görünür:

| Bölmə | Anker | Görünür, əgər |
|---|---|---|
| Missiya (başlıqsız) | `#missiya` | missiya mətni doludur; hər sətir ayrıca paraqrafdır |
| Fəaliyyətin əsas istiqamətləri | `#istiqametler` | ən azı bir istiqamət dərc olunub və həmin dildə başlığı **və** mətni var |
| Əlaqə məlumatları | `#elaqe` | e-poçt və ya telefon doludur; boş kart çıxmır |
| Yüksək kateqoriyalı insident üzrə hesabatın göndərilməsi | `#hesabat-portali` | portalın ünvanı **və** həmin dildə adı doludur |
| RFC-2350 | `#rfc-2350` | həmin dildə fayl və ya link var |
| Beynəlxalq əməkdaşlıq | `#beynelxalq-emekdasliq` | ən azı bir üzvlük dərc olunub və həmin dildə adı var |

Ankerlər dillərdə eynidir, məsələn `/az/fincert#rfc-2350`. Figma-dakı gizli "Bu səhifədə" bloku və üçüncü əlaqə kartı ("İnsident hesabatı")
qurulmayıb.

Qeydlər:
- İstiqamətin nömrəsi görünən siyahıdakı yeridir. Nömrəni mətnə yazmayın.
- Telefon yazıldığı kimi göstərilir. `tel:` linki onun rəqəmlərindən və `+`-dan qurulur.

## İstiqamətin mətni

Mətn adi rich-text redaktorundandır: paraqraf, siyahı, qalın mətn, link. Sayt onu `prepareCmsHtml` ilə süzür və `widgets/cms-content`
(variant `fincert`) ilə göstərir. Siyahı nöqtələri və ara məsafələr Figma-dakı kimidir. Boş paraqraf (`<p></p>`) boş mətn sayılır.

## RFC-2350: fayl üstündür

Hər dil üçün iki sahə var: **fayl** (media kitabxanasından, yalnız sənəd) və **link**.
- **Fayl seçilibsə**, kart onu yükləyir (`download`) və link göstərilmir.
- **Yalnız link varsa**, kart onu yeni vərəqdə açır.

Fayl növü nişanı ("PDF") faylın növündən və ya linkin `.pdf` sonluğundan gəlir.

Seed (`0037`) köhnə saytın `uploads.cbar.az/...pdf` linklərini yazır, çünki test mühitində bu fayllar media kitabxanasında yoxdur. Sənəd yüklənəndə
fayl linki əvəz edir.

## FIRST loqosu

Seed FIRST üzvlüyünü **loqosuz** yazır. Loqo yoxdursa, kart onun üçün yer saxlamır. Loqonu **FinCERT → Beynəlxalq üzvlüklər → FIRST →
Loqo** sahəsindən yükləyin (yalnız şəkil seçilir). Saytda 120 × 48 qutuya sığdırılır. en FIRST mətni qaralamadır, yoxlayın.

## Ehtiyat (fallback)

FinCERT boşdursa, yəni altı bölmənin heç birində məzmun yoxdursa, və ya API cavab vermirsə, səhifə 133-ün öz CMS mətnini göstərir. Səhifə heç
vaxt boş qalmır. Köhnə mətni **Səhifələr** bölməsində saxlayın.

Köhnə ünvanlar (`/page-893/fincert`, `/en/page-893/...`, `?language=en`) `src/proxy.ts`-də yeni səhifəyə 308 ilə yönlənir.

"FinCERT (Kopya)" (`fincert-copy`) qaralaması menyulardan çıxarılıb (`page_details`, spec 041/048).
