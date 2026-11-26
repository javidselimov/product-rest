# UI kontraktı: Korporativ sosial məsuliyyət

Figma section `1675:56713`. Səhifə: desktop `1801:60649`, tablet `1801:61310`, mobil `1801:61706`. Kart: `1801:4920`
(`Default`, `Hover`). Modal: `1801:5457`–`1801:5673`, 4 layihə × 3 ölçü.

## Səhifə

| Element | Desktop (1360+) | Tablet (744+) | Mobil |
|---|---|---|---|
| Məzmun eni | 984 | 664 | 342 |
| Bloklar arası | 32 | 32 | 32 |
| Giriş mətni | 16 lh28 | 16 lh28 | 14 lh22 |
| Fayl sətri | h72, p20, ikon 32, ikon-mətn 50 | eyni | eyni |
| Bölmə başlığı | 20/600 lh28 | 20/600 lh28 | 20/600 lh26 |
| Kart şəbəkəsi | 2 sütun, aralıq 24 | 2 sütun, aralıq 16 | 1 sütun, aralıq 16 |

## Kart

| Element | Dəyər |
|---|---|
| Ölçü | 480×370 (desktop), hündürlük mətnə görə |
| Kənar | 1px #E2E1E1, radius 4; hover #BDBDBD |
| Şəkil | h200, `object-cover` |
| Gövdə | p 20/24/24, aralıq 10 |
| Etiket | px10 py4, radius 4, 12 lh16, tracking .25 |
| Başlıq | 18/600 lh24 #333 |
| Təsvir | 14 lh28 #6B6B6B |

## Modal

| Element | Desktop | Tablet | Mobil |
|---|---|---|---|
| Ölçü | 880, max 900 | 664, max 900 | tam en, yuxarıdan 56 |
| Kənar | radius 4, mərkəzdə | eyni | yuxarı radius 16, aşağıya yapışıq |
| Padding | 32/40/40 | eyni | 20/20/32 |
| Başlıq | 20/600 lh28 #333 | eyni | 20/600 lh26 |
| Böyük foto | h420, radius 4 | eyni | h220 |
| Sayğac | sağ-yuxarı 12, 12 lh16, radius 12, qara 55% | eyni | eyni |
| Thumb | h72, 6 ədəd sığır, aralıq 8 | eyni | h56, 4 ədəd sığır |
| Seçilmiş thumb | 2px teal, INSIDE | eyni | eyni |
| Mətn | 16 lh28, abzas arası 20 | eyni | 14 lh22 |
| Keçid sətri | 16 lh28 brand, altxətt, aralıq 8 | eyni | eyni |
| Bağlama | 40, dairə #F3F3F3, ikon 24, küncdən 32/40 | eyni | küncdən 20/20 |

## Figma-dan qəbul edilmiş fərqlər

1. **Modalın hündürlüyü.** Figma-da hamısı sabit 900-dür, qısa layihədə 185px boş qalır. Saytda hündürlük məzmuna görədir, 900 maksimumdur.
2. **Sürüşmə.** Etiket və bağlama düyməsi yerində qalır, başlıqdan aşağısı sürüşür, uzun layihədə düymə əlçatan qalsın deyə.
3. **Thumb zolağı.** Figma-da 6 thumb var, real layihədə 9 foto ola bilər. Scrollbar göstərilmir, seçilən thumb mərkəzə gəlir.
4. **Rənglər.** Tokenlə verilib: kənar `site-divider` (#D4D4D4), hover `neutral-400`, etiket fonu `site-accent` 15%, etiket mətni `secondary-800`. Figma-nın #007369 rənginə yaxın `secondary-700` 12px mətndə AA kontrastını vermir.
5. **Hover kənarı.** Figma-da 1.5px, saytda 1px: qalınlıq dəyişəndə kart içəriyi tərpənir.
6. **Scrollbar.** Windows-da klassik scrollbar sütunu və modalın mətn enini 15px azaldır (desktop modal 800 → 785).
