# Data Model: 004-fix-page-add-child

Sxem dəyişikliyi **yoxdur**. Yalnız panel daxilində iki törəmə model.

## MenuVisibility (törəmə, saxlanmır)

Formun cari dəyərlərindən (`useWatch`) və ağacdakı mövqedən hər dil üçün hesablanır.

| Sahə | Tip | Mənbə |
| --- | --- | --- |
| `locale` | `'az' \| 'en'` | `LOCALES` |
| `visible` | `boolean` | bütün səbəblər boşdursa `true` |
| `reasons` | `MenuHiddenReason[]` | aşağıdakı qaydalar, sıra ilə |
| `promotedToRoot` | `boolean` | valideyn həmin dildə görünmür → `api-cbar` səhifəni kökə qaldırır |

**Giriş**: `status`, `flags.{active,visible,showAz,showEn}`,
`translations[locale].title` və **hər dil üçün ayrıca** `MenuPlacement { depth, parentVisible }`
(implementasiyada dəqiqləşdi — `placementUnder(tree, parentId, locale)`):

- `depth` = valideyndən yuxarı **ardıcıl görünən** əcdadların sayı + 1. Görünməyən
  əcdad zənciri kəsir, çünki `api-cbar` onun uşağını kökə qaldırır. Buna görə
  dərinlik dildən asılıdır (məs. valideynin EN başlığı yoxdursa, EN-də səhifə kökdədir).
- `parentVisible` = valideyn həmin dildə öz qaydalarından keçir; kök üçün `null`.
- Valideyn ağacda tapılmırsa və ya ağac yüklənməyibsə, yer `null` olur: `tooDeep`/`promotedToRoot` hesablanmır.

`MenuHiddenReason` = `'status' | 'inactive' | 'hidden' | 'localeOff' | 'noTitle' | 'tooDeep'`

| Səbəb | Şərt | Kontrakt bəndi |
| --- | --- | --- |
| `status` | `status !== 'published'` | menu-visibility §1 |
| `inactive` | `!flags.active` | §2 |
| `hidden` | `!flags.visible` | §2 |
| `localeOff` | `az: !showAz`, `en: !showEn` | §3 |
| `noTitle` | `translations[locale].title.trim() === ''` | §4 |
| `tooDeep` | `depth > 3` | §6 |

`tooDeep` səhifənin mövcudluğuna təsir etmir (səhifə URL ilə açılır); yalnız menyuda görünmür.

## ChunkReloadGuard (sessionStorage)

| Açar | Dəyər | Ömür |
| --- | --- | --- |
| `chunk-reload-at` | son reload-un `Date.now()` dəyəri | tab sessiyası |

Keçid: chunk xətası → açar yoxdur və ya 10 s-dən köhnədir → açarı yaz → `location.reload()`.
Açar son 10 s-dədirsə → reload yoxdur, xəta ötürülür (ekran + log). Şəxsi məlumat saxlanmır.
