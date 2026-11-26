# Contract: AZIR Excel faylı (`.xlsx`)

Köhnə `IndeksExportHelper::exportRates` ilə **birinci vərəq strukturu eynidir** (Clarifications Q4). Bankların faylı oxuyan skriptləri bu kontrakta söykənir.

## Vərəq 1 — `1D AZIR` (həmişə var, birinci vərəqdir)

| | A | B | C | D |
|---|---|---|---|---|
| **1** (qalın) | Tarix / Date | Faiz / Interest rate | Əqdlərin həcmi (mln. AZN) / Value of transactions (mln. AZN) | Əqdlərin sayı / Number of transactions |
| 2… | tarix (rəqəm, format `DD.MM.YYYY`) | rəqəm | rəqəm və ya boş | tam ədəd və ya boş |

- Sətirlər ekrandakı cədvəllə eynidir: 1D, `rate > 0`, `valueDate` azalan, cari aralıq (SC-003).
- Başlıqdan sonra **yalnız** məlumat sətirləri olur. Cəm, footnote, boş ayırıcı sətir yoxdur, 5-ci sütun yoxdur.
- `%` və `*` yazılmır. `null` həcm/say → boş xana.
- Məlumat yoxdursa, yalnız başlıq sətri olur (US5-in 4-cü ssenarisi).

## Vərəq 2 — `Qeydlər` / `Notes` (yalnız işarəli sətir olanda)

| | A |
|---|---|
| **1** (qalın) | Ehtiyat plan əsasında hesablanmış günlər / Days calculated on the basis of the contingency plan |
| 2… | işarəli tarixlər (rəqəm, `DD.MM.YYYY`), azalan |
| son + 2 | footnote mətni (`*Ehtiyat plan əsasında hesablanmışdır`) |

İşarəli sətir yoxdursa, vərəq yaradılmır (US5-in 5-ci ssenarisi).

## Paket tələbləri (minimal OOXML)

- Hissələr: `[Content_Types].xml`, `_rels/.rels`, `xl/workbook.xml`, `xl/_rels/workbook.xml.rels`, `xl/styles.xml`, `xl/worksheets/sheet1.xml` (+ `sheet2.xml`).
- Mətn xanaları `t="inlineStr"`-dir, paylaşılan string cədvəli yoxdur. Rəqəm xanaları `<v>`-də nöqtəli onluqla (`7.25`) yazılır.
- Tarix xanaları Excel seriya nömrəsidir (1900 sistemi), `numFmt` `dd.mm.yyyy`-dir.
- XML mətni escape olunur (`& < > " '`). Fayl UTF-8-dir.
- ZIP: hər hissə `deflate` ilə yazılır, CRC32 düzgündür, local header + central directory + EOCD var. ZIP64 yoxdur (ölçü < 1 MB).
- Qəbul: fayl Excel (Windows), LibreOffice Calc və Google Sheets-də xəbərdarlıqsız açılır (quickstart §6).
