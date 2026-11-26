# Kontrakt: "Mərkəzi Bankın loqosu" səhifəsinin CMS markup-ı

Layout `brand-logos` yalnız Media bölməsində, slug-lar `merkezi-bankin-logosu`, `merkezi-bankin-logosu-copy`,
`central-bank-logo`, `central-bank-logo-copy` üçün işləyir.

## Qaydalar

1. Yalnız yuxarı səviyyə bloklara baxılır. Birinci `<table>` versiya cədvəlidir, qalan cədvəllər adi məzmundur.
2. Sətir sayı 1–8 (`MAX_LOGO_VERSIONS`). Yalnız `th`-dan ibarət sətir başlıq sayılır və atlanır.
3. Hər sətirdə 3 və ya 4 xana: `Şəkil | Ad | İzah | Fon`. Ad boş ola bilməz. Şəkil, izah və fon boş ola bilər.
4. Bir sətir qaydaya uymursa **bütün cədvəl** adi məzmun qalır, mətn atılmır.
5. Şəkil: 1-ci xanadakı ilk `<img>`, `src` yalnız `/media/…` və ya `https://…`. Qalan şəkillər nəzərə alınmır.
6. Fon: 4-cü xananın mətni (kiçik hərflə, kənar boşluqsuz) `tünd`, `tund` və ya `dark` → tünd fon. Qalan hallar açıq fon.
7. Cədvəldən əvvəlki məzmun Hero ilə versiya kartları arasında, sonrakı məzmun kartlarla yükləmə sətri arasında göstərilir.
8. Hero birinci sətrin şəklidir. Birinci sətrin şəkli yoxdursa Hero yoxdur.
9. Yükləmə kartları markup-dan yox, səhifənin fayllarından gəlir (admin: səhifə → "Sənədlər"), redaktorun sırası ilə.
   Çip faylın adıdır. Ad yazılmayıbsa API orijinal fayl adını verir (`cbar-logo.zip`): fayl adına bənzəyən başlıq
   (boşluqsuz, sonu `.xx`–`.xxxxx`) formatla əvəz olunur (`ZIP`). Bu səhifədə fayllar adi fayl siyahısında təkrar
   göstərilmir.

## Nümunə

```html
<h2>Loqo versiyaları</h2>
<table><tbody>
<tr><td><p><img src="/media/101" alt="Rəngli horizontal loqo"></p></td><td><p>Rəngli horizontal versiya</p></td><td><p>Əsas versiya. Açıq fonlarda istifadə olunur</p></td><td><p>açıq</p></td></tr>
<tr><td><p><img src="/media/102" alt="Ağ horizontal loqo"></p></td><td><p>Ağ horizontal versiya</p></td><td><p>Tünd və rəngli fonlar üçün</p></td><td><p>tünd</p></td></tr>
</tbody></table>
```

Tam nümunə: `merkezi-bankin-logosu-html/az.html`, `en.html`. Guard fikstürü `fixtures/brand-logos.html` hər iki
komponentdə eynidir (`check:layout-fixtures`).

Kontrakt dəyişəndə `brand-logos.test.ts`, redaktor təlimatı, admin roundtrip testi və `fixtures/brand-logos.html`
(hər iki nüsxə) eyni dəyişiklikdə yenilənir.
