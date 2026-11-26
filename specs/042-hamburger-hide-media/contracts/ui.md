# UI contract: hamburger paneli (spec 042)

## Uyğunluq qaydası

Bölmə **üst zolaq bölməsidir** ⇔ xarici keçid deyil və `href === /{locale}/{topLink.slug[locale]}` hər hansı `topLinks` bəndi üçün
(`shared/config/contacts.ts`: `insan-resurslari`/`human-resources`, `media`/`media`, `elaqe`/`contacts`). Yalnız panelin kök
bəndlərinə tətbiq olunur; alt bəndlər valideynlə birlikdə gizlənir.

## En üzrə tərkib

| En | Üst zolaq keçidləri | Hamburger paneli | Mobil çekmecə |
|---|---|---|---|
| <744 | yox | yox (nav çubuğu gizli) | bütün bölmələr — **dəyişmir** |
| 744–1023 | gizli | bütün bölmələr — **dəyişmir** | yox |
| 1024–1359 | gizli | 9-cu və sonrakı bölmələr — **dəyişmir** | yox |
| ≥1360 | görünür | 9-cu və sonrakılar, **üst zolaq bölmələri istisna** | yox |

Test API ağacı ilə ≥1360 paneli: İstehlakçıların və investorların hüquqları, Maliyyə sektorunun inkişaf Strategiyası, Maliyyə
savadlılığı, Dayanıqlı Maliyyə, Beynəlxalq əməkdaşlıq, Məlumatların yayımlanması qrafiki, Sual − cavab, İstinadlar, FinCERT,
Naxçıvan MR İdarəsi. "Media" və "İnsan resursları" yoxdur.

## Sinif qaydası (`OverflowPanel` `li`)

- `index < visibleCount` → `lg:hidden` (mövcud).
- üst zolaq bölməsi → `desk:hidden` (yeni). Hər iki şərt birlikdə ola bilər.

## Dəyişməyənlər

Nav çubuğu (ilk 8), mega-menyu panelləri, hamburger düyməsinin görünmə şərti, mobil çekmecə, footer, breadcrumb, sol menyu.
