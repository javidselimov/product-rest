# CMS markup contract — layout `memberships` (spec 046)

Spec 024 `contracts/cms-markup.md` §7 qoruyucusunun yeni bəndi. Slug-lar: `beynelxalq-teskilatlarda-uzvluk`,
`membership-in-international-organizations` və hər ikisinin `-copy` nüsxəsi (`cooperationLayoutFor`).

## Redaktorun yazdığı

```html
<p>(istəyə görə giriş mətni)</p>
<table style="min-width: 50px;"><colgroup><col style="min-width: 25px;"><col style="min-width: 25px;"></colgroup><tbody>
<tr><th colspan="1" rowspan="1"><p>Təşkilat</p></th><th colspan="1" rowspan="1"><p>Üzvlük tarixi</p></th></tr>
<tr><td colspan="1" rowspan="1"><p>Beynəlxalq Maliyyə İstehlakçılarının Müdafiəsi Təşkilatı</p></td><td colspan="1" rowspan="1"><p>2025</p></td></tr>
…
</tbody></table>
<p>(istəyə görə cədvəldən sonrakı mətn)</p>
```

## Qaydalar

1. Səhifədəki **birinci** `<table>` üzvlük cədvəlidir; qalan cədvəllər `restHtml`-də adi məzmundur.
2. Yalnız `th`-dan ibarət sətir başlıqdır, göstərilmir. Birinci sətir `td`-dirsə və 2-ci xanada 4 rəqəmli il yoxdursa, o da başlıqdır.
3. Xana 1: təşkilat (düz mətn); içində `http(s)` link varsa ad link olur. Xana 2: il; göstərilən mətn olduğu kimi, sıralama üçün ilk 4 rəqəmli il (1800–2099).
4. 3-cü və sonrakı xanalar göstərilmir. İki xanası da boş sətir atılır. Birləşdirilmiş xanalar (`colspan`/`rowspan` > 1) — xana sırası ilə oxunur.
5. Cədvəl yoxdur, quruluşu pozuqdur və ya sətir qalmır → bütün məzmun adi mətn, çeşidləmə yoxdur.
6. Saytda sütun adları kodun az/en mətnindəndir; redaktorun başlıq sətri yalnız redaktor üçündür.

## Fikstür

`web-cbar-new/src/features/about-content/fixtures/memberships.html` və `web-cbar-admin-new/src/features/rich-text/fixtures/layouts/memberships.html`
bayt-bayt eyni; giriş paraqrafı + yuxarıdakı cədvəl (başlıq + 3 sətir, biri linkli) + cədvəldən sonra paraqraf.
`EXPECTED_BLOCKS.memberships = ['memberships:3']`; admin `roundtrip.test.ts` siyahısına `'memberships'`.
