# Quickstart: "İstehlakçıların və investorların hüquqları" yoxlaması

## §0. Ön şərtlər

- `product-rest/web-cbar-new` və `product-rest/web-cbar-admin-new` yan-yana checkout olunub (`check:layout-fixtures` üçün).
- Testlər həm Node 24 (lokal), həm Node 22 (CI ilə eyni) ilə işlədilir. Vitest PowerShell-dən işlədilir (memory: run-tests-on-node22, windows-shell-crlf).
- Seed üçün Docker lazım deyil, PGlite istifadə olunur (memory: pglite-api-testing).

## §1. Avtomatik qapılar

```bash
cd product-rest/web-cbar-new && npm run verify          # 4 layout guard-ı, parser/view testləri, proxy yönləndirmələri
cd product-rest/web-cbar-admin-new && npm run verify    # roundtrip.test.ts: 4 yeni fixture bayt-bayt
cd product-rest/api-cbar-admin && dotnet build          # MR qapısı (migration build-ə toxunmur)
```

Gözlənən nəticə: hər üç əmr yaşıldır. Bu testlər mövcuddur:

- `layout-fixtures.test.ts`-də `consumer-text`, `complaint-index`, `appeal-statistics`, `consumer-documents` sətirləri;
- köhnə import formasının parser testləri ([cms-markup §0](./contracts/cms-markup.md));
- `proxy.test.ts`-də bu hallar:
  - `/az/fealiyyet-istiqametleri` → `/az/istehlakcilarin-ve-investorlarin-huquqlari`;
  - `/az/infoqrafika` → `/az/vetendas-muracietlerine-dair-statistika#infoqrafika`;
  - `/en/…/complaint-index-on-compulsory-mtpl-insurance` → `/en/complaint-index-on-bank-customers-use-of-bank-services?tab=insurance`;
  - `-copy` slug-ı yönlənmir.

## §2. Seed (PGlite)

Dump-dan və ya test API-dən `pages`, `page_translations`, `page_details` cədvəllərini PGlite-ə yükləyin. `0031-consumer-rights-seed.sql`-i bu
vəziyyətlərdə işlədin:

| Ssenari | Gözlənən |
|---|---|
| köhnə vəziyyət | 86 kökün (87) altındadır, `path` kökün path-i ilə başlayır, `show_in_side_nav = true`, ağac sırası 94, 95, 86, 101 (görünənlər); 95/101 başlıqları yenidir; kök az/en lead iki paraqrafdır; 95 və 96 sonunda metodologiya var; 101 sonunda "İnformasiya sorğusu"; `page_details`-də 88–93, 96–100, 102, 103, 433 `false`-dur |
| 95 başlığı əl ilə dəyişdirilib | 95 başlığı dəyişmir, qalanları yazılır |
| 86 artıq bölmədədir (və ya redaktor onu başqa yerə qoyub) | 86-ya toxunulmur |
| `pages` üzərində UPDATE icazəsi yoxdur | `WARNING`, heç nə dəyişmir, migration uğurla bitir |
| ikinci icra | heç bir sətir dəyişmir |
| `page_details`-də 97 üçün `true` sətri var | 97 `true` qalır |

Bundan sonra `api-cbar`-ın ağac sorğusunu PGlite üzərində işlədib (memory: pglite-api-testing) sol menyunun sırasını yoxlayın.

## §3. Brauzer (test API + fikstür proxy)

Test API hələ seed-siz vəziyyətdədir. Proxy `/api/v1/pages/{87, 94, 95, 96, 101, 86 slug-ları}` və `/api/v1/pages/tree` sorğularına seed-dən sonrakı
vəziyyəti qaytarır, qalan sorğuları test API-yə ötürür (memory: hybrid-fixture-proxy-for-ui-measuring).

```bash
cd product-rest/web-cbar-new && npm run local:testcbar -- --api=http://localhost:<proxy>
```

Bu səhifələri 1728, 744 (scrollbar 15 px) və 390 enində açın:

- `/az/istehlakcilarin-ve-investorlarin-huquqlari`
- `/az/vetendas-muracietlerine-dair-statistika`
- `/az/bank-xidmetlerinden-istifade-uzre-sikayet-indeksi` və `?tab=insurance`
- `/az/inzibati-islere-baxan-vezifeli-sexsler`
- `/az/kapital-bazari-3`
- en ekvivalentləri

Yoxlanılır:

1. Ölçülər [contracts/ui-contract.md](./contracts/ui-contract.md) ilə ±2 px tutuşur (Edge CDP `getBoundingClientRect`). Tablet/mobil dəyərləri kontrakta yazılır.
2. Sol menyuda 4 bənd var, Figma sırası ilə. `/az/tedbirler-2` açıq olanda o da görünür (spec 041). 86 Media menyularında yoxdur.
3. Şikayət indeksləri:
   - son məlumat kartı ən yeni faylı açır;
   - arxivdə 32 (Bank) və 45 (Sığorta) fayl var, illər bağlıdır;
   - tab linki `?tab=insurance`-dir;
   - metodologiya taba görə dəyişir.
4. Statistika:
   - icmal başlığı "May 2026 — qısa icmal"dır (test datası), rəqəmlər cədvəlin May sətri ilə eynidir;
   - kanal tabı və il seçimi ünvana yazılır;
   - Səyyar qəbul cədvəli öz formasındadır;
   - mobildə cədvəl öz qabında sürüşür;
   - İnfoqrafikada 65 fayl var;
   - en-də İnfoqrafika bloku yoxdur.
5. Sənədlər: üç bölmə bağlıdır, sənəd kartları açılır, İnformasiya sorğusu mətni görünür.
6. Yönləndirmələr (§1-dəki hallar) brauzerdə də 308 ilə işləyir. `/az/media/inzibati-islere-baxan-vezifeli-sexsler` 86-nı bu bölmənin şablonunda açır.
7. JavaScript söndürülür: tablar, kanal və il linkləri işləyir, akkordeonlar açılır.
8. Proxy-siz test API (seed-siz) ilə səhifələr tanınan bloklarla və ya adi mətn kimi açılır, heç nə itmir.

## §4. Redaktor round-trip (canlı)

```bash
cd product-rest/web-cbar-admin-new && npm run roundtrip -- "Bank xidmətlərindən istifadə üzrə şikayət indeksi" "Vətəndaş müraciətlərinə dair statistika" "İnfoqrafika" "Kapital bazarı" "İnzibati işlərə baxan vəzifəli şəxslər"
```

Gözlənən nəticə: `td > details` sarğısı saxlanmadan sonra qalır. Qalmırsa, research R15-ə və redaktor təlimatına bu qeyd yazılır, parser hər iki formanı
oxumağa davam edir ([cms-markup §0](./contracts/cms-markup.md)).

## §5. Sənədlər

- `dokumentasiyalar/istehlakci-huquqlari-guide.md` mövcuddur, `dokumentasiyalar/README.md`-də sətri var. Təlimatdakı panel yolları ("**Səhifələr**" →
  İstehlakçıların və investorların hüquqları → …) paneldə tapılır.
- `web-cbar-new/docs/consumer-rights-cms-guide.md` mövcuddur.
- Kök və `web-cbar-new` `CLAUDE.md`-də spec 050 qeydi, admin `CLAUDE.md`-də fixture siyahısı var.
- `business_logic/` `/sync-business-logic` ilə yenilənib.
