---
name: sync-business-logic
description: >-
  business_logic/ qovluğundakı üç sənədi (old_businesslogic.md, new_business_logic.md,
  diff_report_logic.md) product-host (köhnə Yii2 cbar.az) və product-rest (yeni .NET +
  Next.js + React stack) kodu ilə sinxronlaşdırır. Default inkremental — son sync
  commit-indən bəri dəyişən fayllara görə yalnız təsirlənən bölmələri yeniləyir;
  `--full` hamısını koddan yenidən qurur; modul adı verilərsə yalnız o modul.
  Use when the user asks to sync/update/refresh business logic docs, or after changes
  in product-host / product-rest that should be reflected in business_logic/.
---

# /sync-business-logic [--full] [modul ...]

Məqsəd: `business_logic/` sənədləri həmişə kodun **indiki** vəziyyətini təsvir etsin.

| Sənəd | Mənbə | Nəyə cavab verir |
|---|---|---|
| `old_businesslogic.md` | `product-host/` (Yii2: `visitor/`, `admin/`, `common/`) | köhnə sistem nə edir və niyə |
| `new_business_logic.md` | `product-rest/` (`api-cbar`, `api-cbar-admin`, `web-cbar-new`, `web-cbar-admin-new`) | yeni sistem nə edir, buglar, risklər |
| `diff_report_logic.md` | yuxarıdakı ikisi + kod (❓ maddələr üçün) | köhnədə olub yenidə olmayanlar, prioritetlə |

## Qəti qaydalar

- **Kod dəyişdirilmir.** `product-host/`, `product-rest/` yalnız oxunur.
- Yalnız `business_logic/` içindəki üç fayl yazılır. `notdoneyet.md` və digər root faylları **toxunulmur** (sənəddəki "→ notdoneyet §X" istinadları olduğu kimi qalır).
- **Commit edilmir.** Sonda nəyin dəyişdiyini bildir, commit istifadəçinin işidir.
- Fayllar **UTF-8 (BOM-suz)**, Azərbaycan dilində. PowerShell `Get-Content`-in default çıxışı mojibake göstərir — oxumaq üçün Read alətindən və ya `-Encoding utf8`-dən istifadə et; yazmaq üçün Edit/Write.
- Mövcud formatı saxla: bölmə nömrələri və başlıqlar sabit qalır (yeni mövzu → mövcud bölməyə alt-bölmə və ya sona yeni nömrə; köhnə nömrələri yenidən nömrələmə — başqa sənədlər onlara istinad edir), cədvəl sütunları, `fayl:sətir` / `(L137)` istinadları, ✅ ❌ ⚠️ ❓ işarələri, K/Y/O/A prioritetləri.
- Yol konvensiyası: `old` — `product-host/`-a nisbətən; `new` — hər layihənin öz qovluğuna nisbətən (layihə adı kontekstdən aydın deyilsə əvvəlinə yaz). Sətir nömrələri təxminidir — yenilədiyin bölmədə onları kodla yenidən tutuşdur.
- Hər iddia kodda yoxlanmış olmalıdır. Kodu oxumadan "yoxdur" yazma — əvvəl axtar (Grep), tapmadınsa "yoxdur (axtarılıb: …)" kimi yaz və ya ❓ saxla.
- Biznes məntiqi yaz, kod təkrarı yox: **nə edir, hansı qaydayla, niyə vacibdir**, kənar hallar, buglar.

## Addım 0 — arqumentlər

- Boş → inkremental, bütün modullar.
- `--full` → tam yenidənqurma (Addım 2-ni keç, bütün modullar "təsirlənib" sayılır).
- Modul açar(lar)ı (aşağıdakı cədvəldən, məs. `currencies laws`) → yalnız həmin modulların bölmələri. `--full` ilə birləşə bilər.
- Naməlum modul adı → cədvəldəki açarları göstər və dayan.

## Addım 1 — son sync nöqtəsi

Hər sənədin başlığında, `Mənbə:` sətrindən dərhal sonra bu sətir saxlanılır:

```
Sync: `<qısa-hash>` · YYYY-MM-DD · inkremental|tam
```

- Sətir varsa → `BASE` = o hash.
- Yoxdursa (ilk işə salma) → `git log -1 --format=%H -- business_logic/<sənəd>`; o da yoxdursa (sənəd commit olunmayıb) → istifadəçidən baza commit-i soruş və ya `--full` təklif et.
- Üç sənədin `BASE`-i fərqli ola bilər; hər sənəd öz mənbəyinə görə öz `BASE`-i ilə hesablanır (`diff_report` üçün `old` və `new`-in ən köhnəsi).

## Addım 2 — nə dəyişib

Root reposunda (hər üç qovluq eyni git reposundadır):

```bash
git diff --name-status <BASE> -- product-host        # commit olunmuş + işçi ağacdakı dəyişikliklər
git diff --name-status <BASE> -- product-rest
git ls-files --others --exclude-standard -- product-host product-rest   # yeni, izlənməyən fayllar
```

Nəzərə alma: `node_modules/`, `vendor/`, `bin/`, `obj/`, `dist/`, `build/`, `.next/`, `logs/`, lock faylları (`package-lock.json`, `composer.lock`), `*.min.*`, şəkil/font, `gulpfile.js`, `product-host/tasks/`, `.idea/`. Testlər (`*.test.ts`, `__tests__/`, MSW mock-ları) yalnız davranışı aydınlaşdırmaq üçün oxunur, özləri təsvir olunmur.

Heç nə dəyişməyibsə və modul/`--full` verilməyibsə → "sync lazım deyil, BASE = …" de və dayan (Sync sətrini dəyişmə).

## Addım 3 — faylları bölmələrə xəritələ

Hər dəyişən fayl üçün, bu ardıcıllıqla:

1. **Sənəddə yolu axtar.** Sənədlər fayl yollarına istinad edir — Grep ilə faylın nisbi yolunu, sonra adını (`CurrencyRates.php`, `CurrenciesController`) axtar; tapılan başlıq təsirlənən bölmədir.
2. Tapılmadısa — **modul cədvəli** ilə açar sözə görə (controller/model/route adı) bağla.
3. Heç birinə uyğun gəlmirsə — faylı oxu: biznes məntiqinə təsiri yoxdursa (stil, refaktor, build) **keç** və hesabatda "təsirsiz" kimi qeyd et; varsa uyğun bölməyə və ya yeni alt-bölməyə yaz.

Silinmiş fayl (`D`) — sənəddə ona istinad edən hər yeri yenilə (funksiya başqa yerə köçüb, yoxsa həqiqətən silinib?). Adı dəyişmiş (`R`) — yolları yenilə.

### Modul cədvəli

Bölmə nömrələri bələdçidir — həmişə **başlıq adına** görə tap, nömrə sürüşmüş ola bilər.

| Açar | Mövzu | old § | new § | diff § |
|---|---|---|---|---|
| `general` | dil, görünürlük, embargo, sıralama, keş, tarix, xəta | 2 | 2 | 3 |
| `currencies` | rəsmi məzənnələr, XML feed | 3.1 | 4.1 | 4.1 |
| `azir` | AZIR | 3.2 | 4.2 | 4.2 |
| `infolines` | informativ bloklar | 3.3 | 4.5 | 4.3 |
| `inflation` | aylıq inflyasiya | 3.4 | 4.3 | 4.4 |
| `yield-curve` | gəlirlilik əyrisi | 3.5 | 4.4 | 4.5 |
| `payments-stats` | rəqəmsal ödənişlər (`statsDB`) | 3.6 | — | 4.6 |
| `registry` | maliyyə bazarı iştirakçıları reyestri | 3.7 | — | 4.7 |
| `bankinfo` | BankInfo XML push API | 3.8 | — | 4.8, 10 |
| `pages` | səhifə ağacı (CMS) | 4.1 | 5.1 | 5.1 |
| `press-releases` | press-relizlər, elanlar | 4.2 | 5.2 | 5.2 |
| `laws` | qanunvericilik bazası | 4.3 | 5.3 | 5.3 |
| `meas` | MEAS / ESİD | 4.4 | 5.4 | 5.4 |
| `money-marks` | pul nişanları | 4.5 | 5.5 | 5.5 |
| `organization` | rəhbərlik, bölmələr, ərazi idarələri | 4.6 | 5.6 | 5.6 |
| `multimedia` | qalereya, video | 4.7 | 5.7 | 5.7 |
| `homepage` | ana səhifə elementləri | 4.8 | 6 | 5.8 |
| `feedback` | əks əlaqə formu | 4.9 | — | 5.9 |
| `navigation` | menyu, axtarış, RSS, paylaşma, SEO, köhnə URL-lər | 5 | 7 | 6 |
| `media` | fayllar, yükləmə, MinIO | 2.8 | 8 | 3 |
| `admin` | admin panel, rollar, iş axınları | 6 | 9 | 7 |
| `security` | auth, login qoruması, sessiyalar | 7 | 10 | 8 |
| `data-model` | cədvəllər, constraint-lər, miqrasiyalar | 8 | 3 | 9 |
| `integrations` | xarici sistemlər, infra, deploy | 9 | 11 | 10 |

Hər modul dəyişikliyindən sonra bunları da yoxla və lazım olsa yenilə:
- `old` §10 / `new` §12 — **buglar və risklər** (bug düzəlibsə sil və ya "düzəlib" qeyd et; yenisi tapılıbsa əlavə et);
- `old` §11 / `new` §13 — **mütləq qorunmalı qaydalar**;
- `diff` §1 (xülasə cədvəli) və §11 (köhnə §11-in statusu).

Ümumi faylların təsiri genişdir: `product-host/common/models/*` → həm data modeli, həm aid modul; `Cbar.Domain/*`, `CbarDbContext.cs`, `db/migrations/*` → `new` §3 + aid modul; `Program.cs`, auth/middleware → `new` §10/§11; `web-cbar-new/src/shell/*` → `new` §7.

## Addım 4 — `old` və `new` bölmələrini yenilə

Hər təsirlənən bölmə üçün:

1. Bölmənin indiki mətnini oxu.
2. Bölmənin istinad etdiyi **və** dəyişən faylları oxu (lazım olsa əlaqəli controller/model/komponentləri də). İnkremental rejimdə `git diff <BASE> -- <fayl>` nəyin dəyişdiyini tez göstərir, amma yekun mətn faylın indiki halına əsaslanmalıdır.
3. Yalnız fərqli olan hissəni yenilə (Edit). Doğru qalan mətni yenidən ifadə etmə — diff kiçik və yoxlanıla bilən qalsın.

Paralelləşdirmə: 3-dən çox modul təsirlənibsə (və ya `--full`), hər modul üçün bir `Explore` agenti işə sal (bir mesajda, paralel). Hər agentə ver: modulun hər iki sənəddəki indiki bölmə mətni, dəyişən faylların siyahısı, "yalnız oxu, kod dəyişmə; bölmənin yenilənmiş mətnini mövcud formatda və konkret `fayl:sətir` istinadları ilə qaytar; nəyin dəyişdiyini ayrıca siyahıla". Agentlərin nəticəsini sənədlərə **özün** yaz və şübhəli iddiaları (xüsusən "yoxdur") özün Grep ilə təsdiqlə.

`--full` rejimində də sənədin quruluşu (bölmə ağacı, cədvəl formatları) saxlanılır — məzmun koddan yenidən qurulur, forma yox.

## Addım 5 — `diff_report_logic.md`

Təsirlənən hər modul üçün diff bölməsinin cədvəlini yenilənmiş `old` ↔ `new` bölmələrinə görə yenidən hesabla:

- `old`-da yeni qayda/funksiya çıxıbsa → diff-ə sətir əlavə et (status, prio, yenidəki vəziyyət).
- Yenidə həll olunub → sətri silmə; statusu **✅**, "Yenidə" sütununa `həll olunub YYYY-MM-DD — <necə, harada>` yaz.
- Əvvəl ✅ idi, indi geriləyib → ❌/⚠️ et və hesabatda xüsusi qeyd et.
- **❓ maddələr** (təsirlənən modullarda; `--full`-da hamısı): kodda yoxla və ✅ / ⚠️ / ❌-yə çevir, "Yenidə" sütununa sübut (`fayl:sətir`) yaz. Kodda da müəyyənləşdirmək olmursa ❓ qalır, səbəbi ilə.
- Prioritet meyarı dəyişmir: K — xarici sistemlər, hüquqi/maliyyə dəqiqliyi, təhlükəsizlik; Y — əsas biznes funksiyası; O — orta; A — aşağı.
- Sonda §1 xülasə cədvəlini (yalnız açıq K/Y boşluqlar, prioritetə görə) və §11 status siyahısını uyğunlaşdır.
- Diff başlığındakı **Metod** abzası: "sənədlər tutuşdurulub; ❓ maddələr kodda yoxlanılıb" kimi yenilə.

## Addım 6 — başlıqlar

Yalnız **həqiqətən yenilənən** sənədlərdə (və `diff`-də, əgər `old` və ya `new` dəyişibsə):
- `Sync:` sətrini indiki `git rev-parse --short HEAD` ilə yaz (və ya əlavə et). İşçi ağacda commit olunmamış dəyişikliklər də nəzərə alınıbsa, sonuna `+ işçi ağac` artır — növbəti işə salma eyni faylları yenidən yoxlayacaq, bu normaldır.
- Mövcud `Tarix:` dəyərini bu günə yenilə.

Modul filtri ilə işə salınıbsa, `Sync:` sətrini **dəyişmə** (digər modullar yoxlanmayıb) — əvəzinə başlığa / mövcud sətrə `qismən: <modullar> · YYYY-MM-DD` qeydi əlavə et.

## Addım 7 — hesabat (istifadəçiyə)

Qısa, Azərbaycan dilində:
- `BASE → HEAD`, rejim, nəzərə alınan dəyişmiş fayl sayı (və "təsirsiz" sayılanlar);
- hər sənəddə yenilənən bölmələr (`§` + başlıq, bir cümləlik nə dəyişdi);
- diff-də: **yeni boşluqlar**, **həll olunanlar (✅)**, **gerilər**, ❓ → həll olunanlar, hələ də ❓ qalanlar;
- yoxlaya bilmədiyin şeylər (məs. konfiq repoda yoxdur, runtime davranışı yalnız işə salmaqla görünür);
- xatırlatma: dəyişikliklər commit olunmayıb.
