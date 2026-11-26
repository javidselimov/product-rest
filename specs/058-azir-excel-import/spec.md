# Feature Specification: AZIR indekslərinin Excel faylından yüklənməsi

**Feature Branch**: `058-azir-excel-import`

**Created**: 2026-11-24

**Status**: Draft

**Input**: "admin paneldə azir bölməsi var (`/azir`), orda dəyərlər əl ilə daxil edilir. Onlara dedim ki excel file versinlər, əl ilə köçürməkdənsə
`tools/AZIR Website 2026-10-27.xlsx` formatda olan faylı bura upload etsinlər, dəyərlər avtomatik düşsün"; sonra: "`/yield-curves`-da excel upload
necə yerinə yetirilir, o məntiqlə etmək olar?" — bəli; "həmişə bir gün"; "nə görübsə onu da köçürüb" (köhnə redaktor Excel-də gördüyünü yazırdı).

Qərarlar (2026-11-24, istifadəçi ilə razılaşdırılıb):

1. **Gəlirlik əyrisi importunun məntiqi**: fayl panelə yüklənir, server onu oxuyur. Bütün yoxlamalar yazmadan əvvəl keçir, yazma bütövdür (ya hamısı,
   ya heç nə). Tarixdə dəyər artıq varsa panel təsdiq istəyir. Ön baxış addımı yoxdur, amma uğurdan sonra yazılanların xülasəsi göstərilir.
2. **Bir fayl = bir gün.** Tarix faylın özündən götürülür, redaktor tarix seçmir.
3. **Sətirlər adına görə tanınır**, sırasına görə yox.
4. **Faiz** faylda kəsrdir (`0.063047774`, xana formatı `0.0000%`): 100-ə vurulur, 4 onluğa yuvarlaqlaşdırılır (`6.3048`).
5. **Həcmin vahidi təxmin edilmir**: kiçik dəyər artıq mln manatdır, böyük dəyər manatdır, aradakı qeyri-müəyyən dəyər rədd edilir (FR-010).
6. **Həcm/say 0** olduqda 0 saxlanır; **son gün min/max 0** olduqda boş saxlanır (əqd olmayıb).
7. **Əl ilə giriş kartının müddət siyahısı** saytın göstərdiyi müddətlərə uyğunlaşdırılır.

Agentin qəbul etdiyi defoltlar (istifadəçi düzəldə bilər; 8 istifadəçi tərəfindən təsdiqlənib, 2026-11-24):

8. **TFAI yazılmır.** Fayldakı `AZIR TFAI` sətri tanınır, amma bazaya düşmür və xülasədə "yazılmadı" kimi göstərilir. Səbəb: saytın statistika
   səhifəsi (`/statistics`) bazadakı **bütün** müddətləri bir "%" qrafikində çəkir (ana səhifə qrafiki yalnız 1D-dir) (`web-cbar-new` `features/stats/model/series.ts` `azirSeries`);
   114.59-luq indeks orada "114%" xətti kimi görünüb 6%-lik xətləri düzləşdirərdi. TFAI-ni saxlamaq saytı da dəyişməyi tələb edir — ayrıca iş
   (spec 021-də də "TFAI-nin göstərilməsi" kənarda qalıb).
9. Faylda **1D sətri məcburidir**; digər müddətlərin faizi boşdursa (`-`, boş xana və ya 0) o müddət yazılmır və xülasədə göstərilir.
10. Gələcək tarixli fayl (Bakı vaxtı ilə bu gündən sonra) rədd edilir.

**Köhnə vəziyyət** (`product-host`, `product-rest`, köhnə canlı sayt `cbar.az/indeks/rates`, test API, 2026-11-24):

- Yeni panelin AZIR bölməsi (`web-cbar-admin-new/src/features/azir`) siyahı + "əlavə et / yenilə" kartıdır. Kart bir dəfəyə bir tarix + müddət
  yazır; müddət siyahısı `1D/1W/1M`-dir. Saytın ana səhifəsi isə `30D/90D/180D` göstərir (`HOME_AZIR_TERMS`), yəni bu üç müddəti bu gün paneldən
  daxil etmək **mümkün deyil**. Admin API (`POST /api/v1/azir`) istənilən müddəti (≤ 10 simvol) qəbul edir.
- Köhnə panelin formu (Yii2 `admin/controllers/AzirController.php`) hər sətri ayrıca yazı kimi saxlayırdı: başlıq (`1D AZIR*`, `TF AZIR 30D`,
  `LAST MIN RATE` …), faiz, həcm, say — hamısı az/en ayrı mətn sahələri, üstəlik USD həcmi və ana səhifə işarələri. Mətn heç bir çevirmə olmadan
  yazılırdı; redaktor Excel-də gördüyünü köçürürdü — gündə ~7 yazı. INSERT-də sütun sırası da səhv idi (`old_businesslogic.md` §10 #3).
- Köhnə yükləmə səhifəsi (`actionUpload`) Excel deyil, `compounded_term.pdf` faylını əvəz edirdi.
- Bankın gündəlik faylı (`tools/AZIR Website 2026-10-27.xlsx`, bir vərəq "Website"):

  | Xana | Məzmun | Format |
  |---|---|---|
  | B2 | tarix (Excel seriya nömrəsi 46322 = 27.10.2026) | tarix |
  | B4:E4 | başlıq: `Ad`, `Faiz`, `Əqdlərin həcmi (AZN)`, `Əqdlərin sayı` | |
  | B5 | `AZIR*` — 1D, `*` = ehtiyat plan | |
  | C5 / D5 / E5 | `0.063047774…` / `0` / `0` | `0.0000%` / `#,##0` (0 → `-`) / `#,##0` |
  | B7–B9 | `TF AZIR 30D`, `TF AZIR 90D`, `TF AZIR 180D`; D/E = mətn `-` | `0.0000%` |
  | B10 | `AZIR TFAI` = `114.591043` | `0.000000` |
  | B12–B13 | `LAST MIN RATE`, `LAST MAX RATE` = `0` | `0.00%` |
  | B14–B15 | `* Ehtiyat plan əsasında hesablanmışdır.` (qeyd) | |

- Köhnə canlı sayt həmin günü `27.10.2026 | 6.3048% * | 0.00 | 0` göstərir. Əqd olan günlər `132.00 | 2`, `27.50 | 2` kimidir (mln manat, 2 onluq);
  son bir ildə ən böyük həcm 1295.56 mln. Son gün min/max `6.00% / 6.02%` kimidir.
- Test bazasında (`api-cbar-test.cbar.az`) 53 AZIR dəyəri var, müddətlər yalnız `1D/30D/90D/180D`; `1W/1M` heç vaxt olmayıb.
- Gəlirlik əyrisi importu (`YieldCurvesController`, panel `yield-curve-import-dialog.tsx`) və valyuta bülleteni (spec 025) eyni Excel oxuyucusunu
  işlədir (`XlsxSheetReader`). Baza dəyişmir: `azir_index_values` + `azir_index_value_details` (spec 021) bütün sahələri saxlayır.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Günün faylını yükləmək (Priority: P1)

Redaktor bankdan gələn günlük AZIR faylını panelin AZIR bölməsində "Excel-dən yüklə" ilə seçir və təsdiqləyir. O günün bütün dəyərləri (1D faizi,
ehtiyat plan işarəsi, həcm, say, son gün min/max, 30D/90D/180D faizləri) bir hərəkətlə yazılır, siyahıda görünür və saytda dərhal əks olunur.
Redaktor yazılanların xülasəsini görür.

**Why this priority**: Feature-un özüdür: gündə ~7 əl ilə köçürmə əvəzinə bir yükləmə, köçürmə səhvləri (vahid, onluq, sütun yerdəyişməsi) yox olur.

**Independent Test**: Boş tarixə `tools/AZIR Website 2026-10-27.xlsx` yüklənir; siyahıda 27.10.2026 üçün 1D `6.3048`, ehtiyat plan, həcm 0, say 0,
min/max boş və 30D `5.9748`, 90D `6.1316`, 180D `6.3484` görünür; ictimai AZIR səhifəsi həmin günü köhnə saytdakı kimi göstərir.

**Acceptance Scenarios**:

1. **Given** 27.10.2026 üçün dəyər yoxdur, **When** redaktor nümunə faylı yükləyir, **Then** dörd müddət yazılır, 1D sətri ehtiyat plan işarəli,
   həcm 0.00, say 0, min/max boşdur, TFAI yazılmır, və xülasə tarixi, hər müddətin dəyərini və "TFAI yazılmadı" qeydini göstərir.
2. **Given** faylda 1D həcmi `132000000`, say `2`, min `0.06`, max `0.0602`, **When** yüklənir, **Then** həcm `132.00` mln, say 2, min `6.00`,
   max `6.02` yazılır və xülasə həcmin manatdan mln-a çevrildiyini göstərir.
3. **Given** faylda 1D həcmi `27.5`, **When** yüklənir, **Then** həcm `27.50` mln yazılır (çevirmə yoxdur).
4. **Given** 1D adı `AZIR` (ulduzsuz) və ya `1D AZIR*`, **When** yüklənir, **Then** hər ikisi 1D kimi tanınır; işarə yalnız ulduz olduqda qoyulur.
5. **Given** yükləmə uğurludur, **When** dialoq bağlanır, **Then** siyahı yenilənib yeni dəyərləri göstərir.

---

### User Story 2 - Mövcud günü əvəz etmək (Priority: P1)

Bank düzəldilmiş fayl göndərir və ya redaktor eyni faylı ikinci dəfə yükləyir. Panel həmin tarixdə dəyərlərin artıq olduğunu deyir və təsdiq
istəyir; təsdiqdən sonra fayldakı müddətlər əvəzlənir.

**Why this priority**: Təsdiqsiz əvəzləmə real məlumatı səssizcə silə bilər; təsdiq olmadan import bloklanarsa düzəliş mümkün olmaz.

**Independent Test**: Eyni fayl ikinci dəfə yüklənir → təsdiq soruşulur; "Əvəz et" → dəyərlər yenilənir, "Ləğv et" → heç nə dəyişmir.

**Acceptance Scenarios**:

1. **Given** 27.10.2026-da 1D artıq var, **When** fayl yüklənir, **Then** heç nə yazılmır və panel "27.10.2026 üçün dəyərlər artıq var" deyib
   təsdiq istəyir.
2. **Given** təsdiq ekranı, **When** redaktor "Əvəz et" seçir, **Then** fayldakı müddətlər bütövlükdə yenidən yazılır (faylda boş olan sahə boş
   olur) və xülasə köhnə → yeni fərqi olan dəyərləri göstərir.
3. **Given** tarixdə faylda olmayan müddət var (məs. əl ilə yazılmış 30D, faylda 30D boşdur), **When** əvəzlənir, **Then** həmin müddət toxunulmur.
4. **Given** təsdiq ekranı, **When** redaktor "Ləğv et" seçir, **Then** heç nə dəyişmir.

---

### User Story 3 - Səhv faylın aydın rədd edilməsi (Priority: P2)

Redaktor səhv faylı (başqa şablon, pozulmuş rəqəm, qeyri-müəyyən həcm, `.xlsx` olmayan fayl) yükləyəndə heç nə yazılmır və panel problemin harada
olduğunu (sətir və sütun) redaktorun dilində deyir.

**Why this priority**: Yanlış dəyər sayta və statistika blokuna düşür; səhvi faylda tapmaq redaktorun özünə qalmalıdır.

**Independent Test**: Hər səhv növü üçün bir fayl yüklənir; hər dəfə bazada dəyişiklik yoxdur və mesaj sətir/sütunu göstərir.

**Acceptance Scenarios**:

1. **Given** cədvəldə tanınmayan ad (`TF AZIR 60D`), **When** yüklənir, **Then** rədd edilir: "Sətir 8, sütun B: tanınmayan indeks".
2. **Given** 1D həcmi `250000` (nə mln, nə manat kimi inandırıcı), **When** yüklənir, **Then** rədd edilir və mesaj vahidin qeyri-müəyyən
   olduğunu deyir.
3. **Given** B2-də tarix yoxdur və ya gələcək tarixdir, **When** yüklənir, **Then** rədd edilir.
4. **Given** faylda 1D sətri yoxdur və ya faizi boşdur, **When** yüklənir, **Then** rədd edilir.
5. **Given** fayl `.xlsx` deyil və ya 5 MB-dan böyükdür, **When** yüklənir, **Then** rədd edilir.
6. **Given** min > max, mənfi dəyər, tam olmayan say, **When** yüklənir, **Then** rədd edilir və mesaj sətir/sütunu göstərir.
7. **Given** eyni müddət faylda iki dəfə, **When** yüklənir, **Then** rədd edilir.

---

### User Story 4 - Əl ilə girişdə 30D/90D/180D (Priority: P3)

Redaktor tək bir dəyəri düzəltmək üçün mövcud "əlavə et / yenilə" kartında 30D, 90D və 180D müddətlərini seçə bilir.

**Why this priority**: Import gündəlik işi həll edir; tək düzəliş üçün kart kifayətdir, amma bu gün saytın göstərdiyi müddətləri kartda seçmək
mümkün deyil.

**Independent Test**: Kartda müddət siyahısı `1D, 30D, 90D, 180D`-dir; 30D dəyəri yazılır və siyahıda, saytın ana səhifəsində görünür. Siyahının
müddət filtri də eyni dəyərləri təklif edir.

**Acceptance Scenarios**:

1. **Given** kart, **When** müddət siyahısı açılır, **Then** `1D, 30D, 90D, 180D` görünür, `1W/1M` yoxdur.
2. **Given** 30D seçilib, **When** saxlanılır, **Then** dəyər yazılır.

---

### Edge Cases

- Ad sətirlərindəki boşluq, böyük/kiçik hərf fərqi və sətir sonu tanınmaya təsir etmir (`TF AZIR 30D `, `tf azir 30d`).
- Cədvəl başlıq sətri ("Ad", "Faiz") ilə tapılır; sətirlər bir-iki sətir aşağı-yuxarı sürüşsə də fayl oxunur. Başlıq tapılmırsa fayl rədd edilir.
- Boş ayırıcı sətirlər və `*` ilə başlayan qeyd sətirləri nəzərə alınmır.
- `LAST MIN RATE` / `LAST MAX RATE` yoxdursa min/max boş yazılır.
- Faiz xanası düstur olduqda onun hesablanmış dəyəri oxunur.
- Faiz xanası mətn kimi saxlanılıbsa (`"6.3048%"` və ya `"0.063"`) — rədd edilir; şablon rəqəm xanası göndərir.
- 30D/90D/180D sətirlərinin həcm/say xanaları (`-`) nəzərə alınmır; bu müddətlər üçün həcm/say/min/max yazılmır.
- Ehtiyat plan ulduzu 30D/90D/180D adında olarsa həmin müddət də işarəli yazılır (spec 021: işarə bütün müddətlər üçün qəbul olunur).
- Faiz 4 onluqdan çox olduqda köhnə sistem kimi yuvarlaqlaşdırılır (`0.063047774…` → `6.3048`, köhnə sayt da `6.3048%` göstərir).
- Həcm sərhədləri: `10 000` mln — qəbul olunur; `10 000`-dən böyük və `1 000 000`-dan kiçik — rədd; `1 000 000` manat və yuxarı — `÷ 1 000 000`.
- İki redaktor eyni günü eyni anda yükləyir: biri yazır, digəri təsdiq ekranına düşür və ya ardıcıl əvəzləyir — yarım yazılmış gün olmur.
- Səlahiyyəti olmayan istifadəçinin sorğusu API-də rədd edilir (403) və dialoq xətanı göstərir. Düymə hamıya görünür, kart kimi: panelin bölmə üzrə icazə modeli yoxdur (`<Can>` yalnız kobud rolları tanıyır).

## Requirements *(mandatory)*

### Functional Requirements

**Yükləmə**

- **FR-001**: Panelin AZIR bölməsində AZIR dəyəri yaratmaq səlahiyyəti olan istifadəçi üçün "Excel-dən yüklə" əməli olmalıdır; o, `.xlsx` faylı
  seçmək üçün dialoq açır. Dialoqda tarix sahəsi yoxdur.
- **FR-002**: Sistem yalnız `.xlsx` iş kitabını, ən çox 5 MB, qəbul etməlidir; faylın açılan (aktiv) vərəqini oxuyur. Fayl saxlanılmır.
- **FR-003**: Hər yoxlama yazmadan əvvəl keçməlidir; bir səhv bütün faylı rədd edir və bazada heç nə dəyişmir. Yazma bütövdür.

**Faylın oxunması**

- **FR-004**: Tarix B2 xanasından götürülür (Excel tarixi və ya `dd.MM.yyyy` mətni). Tarix yoxdursa, tanınmırsa və ya Bakı vaxtı ilə bu gündən
  sonradırsa fayl rədd edilir.
- **FR-005**: Cədvəl B sütununda "Ad", C sütununda "Faiz" olan başlıq sətri ilə tapılır; ondan sonrakı sətirlər oxunur (B — ad, C — faiz,
  D — həcm, E — say). Başlıq yoxdursa fayl rədd edilir.
- **FR-006**: Adlar boşluq və hərf ölçüsündən asılı olmayaraq tanınır:

  | Fayldakı ad | Nəticə |
  |---|---|
  | `AZIR`, `1D AZIR` (ulduzlu və ya ulduzsuz) | 1D |
  | `TF AZIR 30D` / `90D` / `180D` | 30D / 90D / 180D |
  | `AZIR TFAI` | tanınır, yazılmır (Qərar 8) |
  | `LAST MIN RATE` / `LAST MAX RATE` | 1D-nin son gün minimum / maksimum faizi |
  | `*` ilə başlayan mətn, boş sətir | nəzərə alınmır |
  | başqa hər şey | rədd: sətir və sütun ilə |

  Adda ulduz (`*`) varsa həmin müddət ehtiyat plan işarəli yazılır. Eyni ad iki dəfə gəlirsə fayl rədd edilir.
- **FR-007**: Faiz, son gün minimum və maksimum faizi faylda kəsr kimi saxlanılır; 100-ə vurulur və köhnə sistemin yuvarlaqlaşdırması ilə 4
  onluğa salınır. Nəticə 0-dan kiçik olmamalı, 10 000-dən kiçik olmalıdır.
- **FR-008**: 1D sətri məcburidir və faizi 0-dan böyük olmalıdır. 30D/90D/180D-nin faizi boşdursa, `-`-dirsə və ya 0-dırsa həmin müddət
  yazılmır və xülasədə "faylda dəyər yoxdur" kimi göstərilir.
- **FR-009**: Son gün minimum və ya maksimum faizi 0 və ya boşdursa boş yazılır. Hər ikisi doludursa minimum maksimumdan böyük olmamalıdır.
- **FR-010**: 1D həcmi (D sütunu) mln manatla yazılır:
  - boş və ya `-` → boş;
  - 0-dan 10 000-ə qədər (daxil) → olduğu kimi, mln manat, 2 onluq;
  - 1 000 000 və yuxarı → manat sayılır, 1 000 000-a bölünür, 2 onluq;
  - aradakı dəyər və ya mənfi dəyər → fayl rədd edilir, mesaj vahidin qeyri-müəyyən olduğunu deyir.
- **FR-011**: 1D əqd sayı (E sütunu) boş/`-` → boş, əks halda 0 və ya müsbət tam ədəd olmalıdır.
- **FR-012**: 30D/90D/180D üçün həcm, say, minimum və maksimum yazılmır (boş qalır).

**Mövcud tarix**

- **FR-013**: Fayldakı müddətlərdən hər hansı biri həmin tarixdə artıq varsa və redaktor əvəzləməni təsdiqləməyibsə, heç nə yazılmır və panel tarixi
  göstərib təsdiq istəyir ("Əvəz et" / "Ləğv et").
- **FR-014**: Təsdiqdən sonra fayldakı hər müddət bütövlükdə əvəzlənir (faylda boş olan sahə boş olur); faylda olmayan və ya yazılmayan müddətlər
  toxunulmur.

**Nəticə və iz**

- **FR-015**: Uğurdan sonra panel xülasə göstərməlidir: tarix; hər yazılan müddət üçün faiz, ehtiyat plan işarəsi, 1D üçün həcm (mln), say,
  minimum, maksimum; əvəzləmədə əvvəlki dəyər; yazılmayan sətirlər (TFAI, boş müddətlər) səbəbi ilə; həcm manatdan çevrilibsə bunun qeydi.
- **FR-016**: Hər uğurlu yükləmə audit jurnalına yazılmalıdır: kim, nə vaxt, faylın adı, tarix, hər müddətin əvvəlki və yeni dəyəri.
- **FR-017**: Rədd mesajları redaktorun dilində (az/en) olmalı və mümkün olduqda sətir və sütunu göstərməlidir. Hər rədd səbəbinin öz kodu olur ki,
  panel onu tərcümə edə bilsin.
- **FR-018**: Yazılan dəyərlər əl ilə yazılmış dəyərlərdən fərqlənmir: siyahı, "Formaya yüklə", silmə, ictimai sayt (AZIR səhifəsi, statistika
  bloku, ana səhifə kartı, Excel export) onları eyni cür göstərir.

**Əl ilə giriş**

- **FR-019**: "Əlavə et / yenilə" kartının və siyahı filtrinin müddət siyahısı `1D, 30D, 90D, 180D` olmalıdır.

### Key Entities

- **AZIR dəyəri** (mövcud, spec 021): tarix + müddət (unikal), faiz (%), ehtiyat plan işarəsi; 1D üçün əlavə olaraq əqd həcmi (mln manat), əqd
  sayı, son gün minimum və maksimum faizi. Yeni sahə yoxdur.
- **Günlük AZIR faylı** (saxlanılmır): bankın göndərdiyi bir günlük iş kitabı — tarix, adlı sətirlər cədvəli, qeyd sətirləri.
- **Import nəticəsi** (saxlanılmır, audit-ə düşür): tarix, yazılan müddətlər (əvvəlki/yeni), yazılmayan sətirlər, həcm çevirmə qeydi.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Redaktor bir günün AZIR dəyərlərini 1 dəqiqədən az vaxtda, bir fayl yükləməklə daxil edir (bu gün ~7 ayrı yazı).
- **SC-002**: Nümunə fayl (27.10.2026) yüklənəndən sonra ictimai saytın AZIR cədvəlində həmin gün köhnə saytla eyni görünür: `6.3048% * | 0.00 | 0`.
- **SC-003**: Səhv faylların 100%-i heç bir dəyər yazmadan rədd edilir; yarım yazılmış gün heç vaxt olmur.
- **SC-004**: Hər rədd mesajı redaktorun problemi faylda tapması üçün kifayətdir: sətir/sütun tələb edən səhvlərin hamısında sətir və sütun var.
- **SC-005**: Mövcud tarixin heç bir dəyəri redaktorun açıq təsdiqi olmadan dəyişmir.
- **SC-006**: Saytın göstərdiyi bütün müddətlər (1D, 30D, 90D, 180D) paneldən həm faylla, həm əl ilə daxil edilə bilir.

## Assumptions

- Bank faylı bu şablonda göndərməyə davam edir: bir vərəq, tarix B2-də, cədvəl başlığı "Ad / Faiz / …", adlar B sütununda. Şablon dəyişərsə
  tanınmayan ad və ya başlıq aydın xəta ilə rədd edilir, səssiz itki olmur.
- **Həcmin vahidi hələ real faylla təsdiqlənməyib**: nümunədə həcm 0-dır. Bankdan əqd olan bir günün faylı istənilir (məs. 23.11.2026: köhnə sayt
  `132.00 | 2` göstərir). FR-010-un iki diapazonu hər iki vahidi düzgün qəbul edir; fayl gələndə qayda tək vahidə endirilə bilər.
- TFAI-nin saxlanması və göstərilməsi bu spec-ə daxil deyil (Qərar 8); sayt qrafiklərinin müddət seçimi dəyişdikdən sonra ayrıca iş kimi əlavə edilə
  bilər.
- Keçmiş tarixlərin toplu yüklənməsi (bir faylda çox gün) və köhnə `azir_indexses` tarixçəsinin importu bu spec-ə daxil deyil.
- Köhnə formdakı USD həcmi, ana səhifə işarələri ("Ana səhifədə göstər", "Ana səhifədəki tarixi bundan götür"), sıra və az/en ayrı dəyərlər yeni
  sistemdə lazım deyil: USD həcmi məzənnədən hesablanır, ana səhifə həmişə son tarixi götürür.
- `compounded_term.pdf` yükləməsi (köhnə "Pdf Azir uploader") bu spec-ə daxil deyil.
- `1W/1M` müddətli dəyər heç bir mühitdə yoxdur (test bazasında təsdiqlənib; prod plan mərhələsində yoxlanılır). Olsa da siyahıda qalır, sadəcə
  filtr və kartda seçilmir.
- Səlahiyyət mövcud AZIR icazələridir (yazma = "AZIR yaratmaq"); yeni rol və ya icazə yoxdur.
- Baza sxemi, ictimai API və ictimai sayt dəyişmir. Dəyişən komponentlər: admin API (yeni yükləmə əməli, əvvəl OpenAPI spec-i) və admin panel. Deploy
  sırası: əvvəl admin API, sonra panel.
- Panelin mətnləri az/en tərcümə olunur; menyu dəyişmədiyi üçün CMS təlimatlarında yalnız AZIR bölməsinin təsviri yenilənir.
