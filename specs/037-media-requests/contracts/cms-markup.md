# Kontrakt: "Media sorğuları" səhifəsinin CMS markup-ı

Layout `media-requests` yalnız Media bölməsində, slug `media-sorgulari` üçün işləyir (az və en).

## Qaydalar

1. Yalnız yuxarı səviyyə bloklara baxılır. Birinci `<table>` kart cədvəlidir, ikincisi adi məzmundur.
2. Sətir sayı 1–4 (`MAX_CONTACT_CARDS`). Yalnız `th`-dan ibarət sətir atlanır.
3. Hər sətirdə 2 və ya 3 xana: `Ad | Dəyər | Əlavə mətn`. Ad və dəyər boş ola bilməz.
4. Bir sətir qaydaya uymursa **bütün cədvəl** adi məzmun qalır, mətn atılmır.
5. Dəyər xanasındakı ilk keçid kartda keçid olur, yalnız `mailto:`, `tel:`, `https:`.
6. İkon: `mailto:` və ya `@` → poçt. `tel:` və ya yalnız rəqəm, boşluq, `+()-` → telefon. Qalanı ikonsuz.
7. Cədvəldən əvvəlki məzmun kartlardan yuxarıda, sonrakı məzmun aşağıda göstərilir.
8. Başlıq `h2`–`h4` ola bilər.

## Nümunə

Tam nümunə: `media-sorgulari-html/az.html`, `en.html`. Bu fayllar `parse.test.ts` və admin `roundtrip.test.ts`
fikstürləri ilə eyni formadadır.

Kontrakt dəyişəndə `parse.test.ts`, redaktor təlimatı, admin roundtrip testi və `fixtures/media-requests.html` (hər iki nüsxə) eyni dəyişiklikdə yenilənir.
