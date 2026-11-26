# Kontrakt: KSM səhifəsinin CMS markup-ı

Layout `csr-projects` yalnız Media bölməsində işləyir. Slug-lar: `korporativ-sosial-mesuliyyet`, `corporate-social-responsibility` və onların `-copy` nüsxələri.

Layihələr bu səhifədə yazılmır, admin paneldə "KSM layihələri" bölməsindədir (`data-model.md`). Səhifədə yalnız aşağıdakılar qalır.

## Qaydalar

1. Yalnız yuxarı səviyyə bloklara baxılır.
2. `<p>` içində tək `/media/{id}` keçidi, səhifənin fayllarından tapılan və şəkil olmayan sənəddirsə fayl sətri olur, mətndəki yerindən asılı olmayaraq giriş mətnindən sonra göstərilir.
3. Tapılmayan keçid, şəkil keçidi və cümlə içindəki keçid adi mətn kimi qalır.
4. Qalan hər şey giriş mətnidir.
5. Layihə varsa, köhnə siyahı başlığından sonrakı hər şey göstərilmir. Başlıqlar: "Korporativ sosial məsuliyyət layihələrimiz", "Our Corporate Social Responsibility projects", "Layihələrimiz", "Our projects" (`h2`–`h4` və ya tək `<strong>` abzası). Layihə yoxdursa və ya API cavab vermirsə, mətn olduğu kimi qalır.
6. Səhifənin alt hissəsindəki "Sənədlər/Şəkillər" bloku bu layout-da göstərilmir: səhifənin fayllarında layihə fotoları və hər iki dilin PDF-i var. Mətndə keçidi olmayan fayl saytda görünmür.

## Nümunə

```html
<p>Giriş mətni</p>
<p><a target="_blank" rel="noopener noreferrer nofollow" href="/media/1566" data-media-link="">KSM Konsepsiyası</a></p>
```

Guard: `web-cbar-new/src/features/about-content/fixtures/csr-projects.html` və admin-dəki eyni fayl. Kontrakt dəyişəndə `csr-projects.test.ts`, redaktor təlimatı və hər iki fikstür eyni dəyişiklikdə yenilənir.
