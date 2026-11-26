# Kontrakt əlavəsi: "Tarix" CMS markup-ı (spec 026)

Bu sənəd spec 024-ün [`contracts/cms-markup.md`](../../024-about-us-redesign/contracts/cms-markup.md)
§3-ünə **əlavədir**, onu əvəz etmir. 024 §1 (ümumi qaydalar) və §3-dəki tanınma qaydaları
(hero, timeline cədvəli, il, gün-ay, vurğu, başlıq, mətn, şəkillər) olduğu kimi qalır.
İmplementasiya zamanı bu əlavə 024 sənədinə köçürülür (o, redaktor bələdçisinin mənbəyidir),
`docs/about-cms-guide.md` da yenilənir.

## §3 dəyişiklikləri

### Əvəz olunan sətirlər

| Blok | 024 | 026 |
|---|---|---|
| Timeline görünüşü | Şaquli siyahı, Figma `898:3060` | Bir dəfədə bir ilin kartı + üfüqi il oxu, Figma `1845:119481` (`tarix/Timeline`). Ölçülər: [ui-contract.md](./ui-contract.md) |
| İl naviqasiyası | Sağda 88 sütunlu çiplər, Figma `1272:15574` | İl oxu: nöqtə + il etiketi, Figma `1845:119481` → `Axis` |
| Hadisə şəkilləri | 1 şəkil: tam en × 360. 2: yan-yana. 3+: 2 sütun | **Foto düzülüşü** (aşağıda) |
| Kart görünüşü | Şəkil var **və ya** vurğulu → haşiyəli kart | Vurğulu **və ya** (şəkil var **və** düzülüş `note` deyil) → hadisə çərçivəli qutuda (teal haşiyə) |

### Yeni: foto düzülüşü

Hadisənin şəkilləri (hücrə 2-nin şəkil-paraqrafları) dörd düzülüşdən biri ilə göstərilir:

| Ad | Görünüş (prototip nisbətləri) | Avtomatik seçilir |
|---|---|---|
| `single` | bir şəkil, 450:361 | 1 şəkil |
| `note` | yan-yana: dar şaquli (75) + enli (429), hündürlük 184. Əskinasın ön/arxa üzü üçün | 2 şəkil |
| `hero2` | üstdə tam enli (478:313), altda iki yarım (235:160) | 3 şəkil (birinci şəkil portret deyilsə və ya ölçüsü bilinmirsə), 4+ şəkil |
| `tall` | solda iki sıra hündürlüyündə (191), sağda iki üst-üstə (279), ümumi 478:376 | 3 şəkil, birinci `<img>`-də `height > width` atributları varsa |

### Yeni: redaktorun düzülüş işarəsi

Avtomatik seçimi dəyişmək üçün redaktor hadisənin mətn hücrəsinə (hücrə 2) **ayrıca
paraqraf** əlavə edir:

```html
<p>[foto: tall]</p>
```

| Qayda | |
|---|---|
| Forma | Paraqrafın bütün mətni `[foto: <ad>]`. `<ad>` = `single` \| `note` \| `hero2` \| `tall`. Hərf ölçüsü və boşluqlar fərq etmir (`[ Foto:TALL ]` də keçir) |
| Yer | Hücrə 2-nin istənilən yuxarı səviyyə paraqrafı (adətən sonuncu) |
| Tanınanda | Paraqraf saytda **göstərilmir**, düzülüş işarədəki addır |
| Tanınmayanda | (`[foto: böyük]`) paraqraf adi mətn kimi görünür, düzülüş avtomatik seçilir. Redaktor səhvi saytda görür |
| Bir neçə işarə | Birincisi işləyir, tanınanların hamısı gizlənir |
| Şəkilsiz hadisə | İşarə gizlənir, təsiri olmur |
| Admin redaktoru | Adi mətndir: vizual rejimdə yazılır, roundtrip-də dəyişmir (research R4). Admin panelində dəyişiklik yoxdur |

### Nümunə

```html
<tr>
  <td><p>6 oktyabr 1998</p></td>
  <td>
    <h3>Rəşid Behbudov 90 ünvanında inzibati bina istifadəyə verilib</h3>
    <p>Mərkəzi Bankın əvvəl fəaliyyət göstərdiyi …</p>
    <p><img src="/media/657" alt="Binanın fasadı"></p>
    <p><img src="/media/658" alt="Açılış mərasimi"></p>
    <p><img src="/media/659" alt="Lent kəsilməsi"></p>
    <p>[foto: tall]</p>
  </td>
</tr>
```

İşarə olmasa, bu hadisə `hero2` ilə göstərilir: 3 şəkil var və ölçü atributu yoxdur.

## İl ünvanları (lövbərlər)

| Forma | İşləyir | Qeyd |
|---|---|---|
| `/az/tarix#1998` | ✅ | Yeni forma. Sayt il dəyişəndə ünvanı belə yazır |
| `/az/tarix#year-1998` | ✅ | 024 forması. Həm JS ilə, həm JS-siz işləyir |
