# Contract: menyular və "Sol menyuda göstər" (spec 048, spec 041-i əvəz edən hissə)

Səhifə P, `showInSideNav = false` (öz bayrağı) və ya kökdən aşağıdakı əcdadı söndürülüb.

| Səth | P kök bölmədirsə | P kök deyilsə |
|---|---|---|
| Nav çubuğu (kök bölmələr) | görünür | — |
| Nav çubuğunun mega-menyusu | — | **görünmür** (alt ağacı ilə) |
| Hamburger paneli (tablet/masaüstü) | görünür | **görünmür** (alt ağacı ilə) |
| Mobil çekmecə | görünür | **görünmür** (alt ağacı ilə) |
| Footer (yalnız köklər) | dəyişmir | — |
| Bölmənin sol menyusu | — (menyunun başlığıdır) | görünmür; P və ya altındakı səhifə açıq olanda görünür (spec 041) |
| Breadcrumb | dəyişmir | dəyişmir |
| Ünvanla açılış | dəyişmir | dəyişmir |

- Açılan menyularda açıq-səhifə istisnası yoxdur.
- `showInSideNav` gəlməyəndə görünən sayılır.
- Az və en ağacları ayrıca süzülür; bayraq iki dil üçün birdir.

## Admin kartı ("Saytın menyusunda", `menuVisibility`)

"Üst menyu" sətri səbəbləri, öz qaydalarından (status, aktiv, görünür, dil, başlıq) sonra:

| Hal | Səbəb |
|---|---|
| depth = 1 (kök) | bayraq səbəb deyil |
| depth > 1, öz bayrağı söndürülüb | `sideNavOff` |
| depth > 1, kökdən aşağıdakı əcdadı söndürülüb | `parentSideNavOff` |
| depth > 3 | `tooDeep` (əvvəlki kimi, yuxarıdakılarla birlikdə ola bilər) |
| yer bilinmir (ağac yüklənməyib) | öz qaydaları, öz bayrağı daxil (`sideNavOff`); `parentSideNavOff` yoxdur |

Sol menyu sətri dəyişmir.
