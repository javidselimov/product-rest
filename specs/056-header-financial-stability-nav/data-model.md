# Data model: spec 056

Yeni cədvəl, sütun və API sahəsi yoxdur. Dəyişən yalnız **məlumatdır** (seed `0042`) və mövcud bayrağın kök bölmədəki
**mənasıdır**.

## Mövcud cədvəllər (yalnız DML)

| Cədvəl | Nə dəyişir |
|---|---|
| `pages` | 10 yeni sətir (2 kök + 8 uşaq). 64, 65, 113 və 113-ün alt ağacı üçün `parent_id`, `path`, `sort_order` dəyişir. Köklərin `sort_order`-i yenidən nömrələnir |
| `page_translations` | 10 × 2 dil yeni sətir: başlıq, slug, `content` boş |
| `page_details` | 4 kök üçün `show_in_side_nav = false`, 64/65 üçün `true`, 459 üçün `false` |
| `page_nav_details` | dəyişmir |

## Kök bölmələrin hədəf sırası (az slug)

`haqqimizda`, `pul-siyaseti`, **`maliyye-sabitliyi`**, `bazar-istirakcilari`, `huquqi-aktlar`, `odenis-sistemleri`,
`milli-pul-nisanlari`, `statistika`, `nesrler-ve-tedqiqatlar` (bunlar nav zolağının 9 bölməsidir), `media`,
`istehlakcilarin-ve-investorlarin-huquqlari`, **`reqemsal-maliyye-ekosistemi`**, `maliyye-sektorunun-inkisaf-strategiyasi`,
`beynelxalq-emekdasliq`, `maliyye-savadliligi`, `insan-resurslari`, `melumatlarin-yayimlanmasi-qrafiki`, `sual-cavab`,
`istinadlar`, `fincert`, `naxcivan-muxtar-respublikasi-idaresi`. Siyahıda olmayan kök axırda öz nisbi sırası ilə qalır. Sıra
`(n) * 10` yazılır.

## Yeni səhifələr

| Valideyn | az başlıq / slug | en başlıq (qaralama) / slug |
|---|---|---|
| — (kök) | Maliyyə sabitliyi / `maliyye-sabitliyi` | Financial stability / `financial-stability` |
| — (kök) | Rəqəmsal maliyyə ekosistemi / `reqemsal-maliyye-ekosistemi` | Digital financial ecosystem / `digital-financial-ecosystem` |
| Rəqəmsal | Maliyyə texnologiyaları / `maliyye-texnologiyalari` | Financial technologies / `financial-technologies` |
| Rəqəmsal | Açıq bankçılıq / `aciq-bankciliq` → `-2` | Open banking / `open-banking` (tutulubsa `-2`) |
| Rəqəmsal | Xüsusi tənzimləmə rejimi / `xususi-tenzimleme-rejimi` | Regulatory sandbox / `regulatory-sandbox` |
| Rəqəmsal | Rəqəmsal KYC / `reqemsal-kyc` | Digital KYC / `digital-kyc` |
| Rəqəmsal | Kriptoaktivlərin tənzimlənməsi / `kriptoaktivlerin-tenzimlenmesi` | Regulation of crypto-assets / `regulation-of-crypto-assets` |
| Rəqəmsal | Mərkəzi Bankın rəqəmsal valyutası / `merkezi-bankin-reqemsal-valyutasi` | Central bank digital currency / `central-bank-digital-currency` |
| Rəqəmsal | Maliyyə texnologiyaları ekosisteminin xəritəsi / `maliyye-texnologiyalari-ekosisteminin-xeritesi` | Fintech ecosystem map / `fintech-ecosystem-map` |
| Rəqəmsal | Maliyyə texnologiyaları və innovasiyalar üzrə yenilik və tədbirlər / `maliyye-texnologiyalari-ve-innovasiyalar-uzre-yenilik-ve-tedbirler` | Fintech and innovation news and events / `fintech-and-innovation-news-and-events` |

Hər slug dildə tutulubsa `-2` alır. Status `published`, digər bayraqlar cədvəlin default dəyərləridir (0041-də olduğu kimi).

## Köçən səhifələr

| Səhifə (az slug) | Köhnə valideyn | Yeni valideyn | Sıra | Bayraq |
|---|---|---|---|---|
| `maliyye-sabitliyi-hesabati` (64) | `nesrler-ve-tedqiqatlar` | `maliyye-sabitliyi` | 10 | `show_in_side_nav = true` |
| `bank-sektoru-uzre-makroprudensial-siyaset-cercivesi` (65) | `nesrler-ve-tedqiqatlar` | `maliyye-sabitliyi` | 20 | `show_in_side_nav = true` |
| `dayaniqli-maliyye` (113) + alt ağac | kök | `maliyye-sabitliyi` | 30 | dəyişmir |
| `dayaniqli-maliyye-copy` (459) | 113 (onunla gedir) | 113 | — | `show_in_side_nav = false` |

## Menyu yeri bayrağının kök bölmədə mənası (yeni)

| Kök bölmənin effektiv dəyəri `isInDropdownNav` | Nav zolağı | Panel `lg`–`desk` | Panel ≥`desk` | Mobil çekmecə | Footer |
|---|---|---|---|---|---|
| `true` ("Hər yerdə") | sırası ilə | var | var (zolaqda deyilsə) | var | sabit siyahı ilə |
| `false` ("Menyularda yox") | sırası ilə | var | **yox** | var | sabit siyahı ilə |

Seed `false` yazır: `maliyye-sektorunun-inkisaf-strategiyasi`, `melumatlarin-yayimlanmasi-qrafiki`, `sual-cavab`, `istinadlar`.

## Sayt modeli (`web-cbar-new/src/shell/nav.ts`)

`NavSection` yeni sahə alır: `inDropdownNav: boolean`. Kök üçün `isInDropdownNav(node)`, alt bəndlər üçün həmişə `true`, çünki
onlar artıq süzülüb. `buildNavSections` qaytardığı formanı saxlayır (`visible` = ilk `VISIBLE_SECTIONS`).
