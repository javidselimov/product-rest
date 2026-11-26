# Contract — desktop sxeminin düzülüş qaydaları (FR-003)

Mənbə: Figma `2007:86378` (desktop, 971×771) və [research-notes.md](../research-notes.md). Sabitlər `web-cbar-new/src/widgets/org-chart/constants.ts`
`CHART` obyektindədir (spec 032). Qaydaları `entities/org-chart/model/layout.ts` (`buildChartLayout`) tətbiq edir, widget render edir.

Növlər: 1 sədr, 2 müavin, 3 baş direktor, 4 blok, 5 departament, 6 qrup. Qrup hər qaydada bloka bərabərdir.

## Qaydalar

| # | Valideyn → uşaq | Yer | Xətt |
|---|---|---|---|
| L1 | kök sədr | ən yuxarıda | — |
| L2 | sədr → departament | sədrin sağında alt-alta siyahı, sətir eni 213, aralıq 4 | sədrin sağ kənarından şaquli mərkəzdə daraqa. Daraq siyahıdan 29 px solda, birinci sətrin mərkəzindən sonuncunun mərkəzinə qədər. Hər sətrə 29 px tick |
| L3 | sədr → baş direktor | baş direktorlar sırasında, ən solda sütun | sədrin sol kənarından şaquli mərkəzdə sütunun mərkəzinə, oradan aşağı sütunun yuxarısına ("L") |
| L4 | sədr → müavin | sədrin altında müavinlər sırası | sədrin alt-ortasından aşağı ortaq üfüqi bara, bardan hər müavinin üst-ortasına |
| L5 | müavin → müavin | müavinlər sırasında, valideyn müavinin sağında. Valideyn sıradan yuxarıda dayanır | valideynin sağ kənarından üfüqi xətt, ondan hər uşaq müavinin üst-ortasına |
| L6 | müavin → baş direktor, müavin → blok | müavinin altında sütunlar (68 en, aralıq 6). Müavin öz sütunlarının üstündə mərkəzdə. Birbaşa blokun sütununda yuxarıda boşluq qalır (L8) | müavinin altından 35 px aşağı üfüqi bar, birinci sütunun mərkəzindən sonuncunun mərkəzinə. Bardan sütunlara düşən xətt |
| L7 | müavin → departament (yan departamentlər) | sonuncu sütunun sağında alt-alta (68 en). Sonuncu sütun "həmişə açıq" blokla bitirsə, həmin blokun departament sırasına sağdan qoşulur (aralıq 4). Belə deyilsə, sütunların yuxarısından başlayır | müavinin sağ kənarından şaquli mərkəzdə sağa, departamentlərin sağ kənarından 7 px kənara. Oradan aşağı sonuncu departamentin mərkəzinə. Hər departamentə tick |
| L8 | baş direktor → blok | eyni sütunda baş direktorun altında, aralıq 10. Bloklar arası aralıq 8 | yoxdur |
| L9 | blok → departament, "açılan siyahı" | bağlı: caret. Açıq: blokun altında sütun (R6, Figma açıq halından ölçülüb: 8 px aşağı, 68 en, aralıq 4 — "həmişə açıq"dakı 8-dən sıx). Altdakı kartlar sürüşür | yoxdur |
| L10 | blok → departament, "həmişə açıq" | blokun altında 8 px boşluqla sütun (68 en, aralıq 8). Caret yoxdur | yoxdur |
| L11 | qalan hər birləşmə | valideynin altında adi sütun uşağı, sıra ilə | yoxdur |

Sıra: qardaşlar hər yerdə `sortOrder`, sonra `id` ilə düzülür (API-nin göndərdiyi sıra).

## Ölçülər (Figma, px)

| Kart | En | Min. hündürlük | Padding |
|---|---|---|---|
| sədr | 266 | 98 | 16 |
| müavin | 145 | 100 | 8 |
| baş direktor | 68 | 68 | 4 |
| blok | 68 | — (mətn) | 4 |
| blok, "həmişə açıq" | 68 | 37 | 4 |
| departament, sədrin siyahısında | 213 | — | 4 |
| departament, sütunda | 68 | — | 4 |

Hündürlük min. dəyərdir: uzun mətn kartı böyüdür, altındakılar sürüşür (US2-4).

Haşiyəli kartlar (baş direktor, departament): Figma-da stroke INSIDE-dir, ona görə CSS-də padding 1 px azdır (`p-[3px]`), mətn sahəsi
60 / 205 px qalır. Figma 9 px mətnin sətrini 13 px qoyur (12.6 yox): sədrin siyahısının sətirləri 21 / 34, sütundakı departamentlər
34 / 47 / 60 (T017, `2007:86453`, `2007:86478`, `2007:86483`). Açılan blok mətn + 16 px caret + 8 padding-dir ("Hüquq bloku" 37,
"Əməliyyat bloku" 50), bizdə `p-1 pb-5` eyni hündürlüyü verir.

Figma-dan 2026-11-26-da `figma_node` depth 2 ilə oxunub (`2007:86378`, `2007:86453`, `2007:86426`, `2007:86414`, `2007:86461`).
Bu rəqəmlər notes-dakı ilkin rəqəmlərdən üstündür:

| Ölçü | Dəyər | Mənbə |
|---|---|---|
| sxemin başlanğıcı | (14392, 657) | `structure` qrupu, 971×771 |
| baş direktorlar və müavin qrupları sırası | soldan sağa, qruplar arası 5 | Azər 14392–14460, Əliyar 14465, Toğrul 14615, Əli 14765, Vüsal 14918, Gülər 15068 |
| qrupun eni | max(müavin kartı 145, sütunların eni). Kart sütunların üstündə mərkəzdə | Gülər: sütunlar 15068–15284, kart 15103.5 |
| sütunlar arası aralıq | 6 | Gülər (15068, 15142, 15216), Vüsal (14918, 14992). Əlidə 4 (R5) |
| sədrin departament siyahısı | sədrin xəttinə görə şaquli mərkəzdə (657–804, mərkəz 730.5), sətir aralığı 4, sətrin hündürlüyü mətndən (21 / 34) | `2007:86453` |
| daraq | x 15115, birinci sətrin mərkəzi (674) → sonuncunun mərkəzi, tick 29 | `Line 26` |
| sədr → Azər | y 731, x 14429.5–14748.5, aşağı 1119-a | `Line 11`, `Line 12` |
| yan departament xətti | sütunun sağ kənarından 7 (15356 → 15363), tick-lər 5–6 | `Line 39–41` |
| "həmişə açıq" blokun sırası | Anar sütununun içində: blok, altında [blokun departamentləri \| 4 \| yan departamentlər] | `Anar Mansurov` frame 140 en |
| müavinə birbaşa blok | sütunların yuxarısı + 75 (Figma 1194) | `2007:86419` |

Mütləq Figma nöqtələri ölçmə üçündür (SC-002). Frame-in sol-yuxarısı sxemin başlanğıcıdır.

| Nöqtə | Figma |
|---|---|
| sədr kartı | (14747, 678), 266×98 |
| sədrin departament siyahısı | x 15144, daraq x 15115 |
| sədrin baş direktoru (Azər) | sütun x 14392, yuxarı y 1119. "L" sədrdən x 14430-a gedir |
| müavinlər barı | y 829, x 14536.5–15176.5. Sədrdən x 14880-də düşür |
| Əliyar | yuxarı y 886. Qalan müavinlər y 966 |
| Əliyar → Toğrul, Əli | y 920, x 14610–14843, düşmə x 14690 və 14843 |
| baş direktor sırası | yuxarı y 1119 |
| Ödəniş bloku (müavinə birbaşa tabe) | y 1194 |
| Gülər → yan departamentlər | y 1014, şaquli x 15363, aşağı y 1308, tick-lər y 1247 və 1308 |

## Figma-dan qəsdən fərqlər (R5)

Qayda ardıcıldır. Figma-nın əl ilə yerləşdirmə səhvlərini təkrarlamır. Ölçmə hesabatı bu yerləri ayrıca göstərir.

| Yer | Figma | Qayda |
|---|---|---|
| sədrdən sağa və sola xətt | y 731 | kartın mərkəzi (727) |
| Azər sütununa "L" | x 14430 | sütunun mərkəzi (14426) |
| Ödəniş bloku | y 1194 | baş direktor sırası + 68 + 10 = 1197 |
| Əli Əhmədov | sütunlarına görə 5 px sağda | sütunlarının üstündə mərkəzdə |
| müavin → sütunlar | 966 + 100 + 35 + 20 = 1121, sütunlar isə 1119-da | bar müavindən 35 px aşağı, düşmə sütunların yuxarısına qədər |
| Əliyar → uşaq müavinlər | y 920 (kartın yuxarısından 34) | sabit 34 (`CHART.childLineTop`). T017-də ölçüldü: 920, Figma ilə eyni |
| Əliyar → uşaq müavinlərə düşmə | x 14690, 14843 (kartların mərkəzindən 2.5 sağda) | kartın üst-ortası (14687.5, 14837.5) |
| Gülər → yan departamentlər | y 1014 (kartın yuxarısından 48) | kartın mərkəzi (1016) |
| yan departamentlərin tick-ləri | y 1247, 1308 (kartın yuxarısından 5 və 11) | kartın mərkəzi (1265.5, 1327). Riser sonuncunun mərkəzində bitir |
| sədr kartı | y 678 (mərkəzi 727), xətləri isə y 731-də | departament siyahısına görə şaquli mərkəzdə: y 681.5, xətlər 730.5 |
| sədr kartı, x | 14747 (sxemin ortasından 2.5 sağda) | sxemin ortası. Əli qrupunun 3 px-i ilə birlikdə 14743, siyahı və daraq da 4 px soldadır |
| Əli qrupu | kart 14768, sütunlar 14765, aralıq 4 (qrup 148 en) | qrup 145, sütun aralığı 6, kart mərkəzdə. Ondan sağdakı qruplar (Vüsal, Gülər) qaydada Figma-dan 3 px soldadır |
| Vüsal kartı | sütunlarla sol kənardan hizalı | sütunların üstündə mərkəzdə (1.5 px) |

## Açılan siyahı (L9) — davranış

- Blok `<details>`, `<summary>` blok kartıdır. Klik, Enter və Space açıb-bağlayır. Halı brauzer elan edir.
- Açıq siyahı yalnız öz sütununu uzadır. Sütunlar `align-items: start`-dır, qonşu sütunlar tərpənmir.
- Siyahının hündürlüyü qədər eyni sütundakı altdakı kartlar aşağı düşür. Daxili sürüşmə yoxdur.
- Departament kartı keçiddir (səhifəsi o dildə varsa). Blokun öz keçidi yoxdur (FR-006).
- Bütün departamentləri bu dildə filtrdən düşən blokda `<details>` yoxdur. Kart departamentsiz blok kimidir: keçid və ya sadə kart.
