# Quickstart: Tədbirlərin yoxlanması (spec 034)

Bu maşında Docker işləmir. Q1–Q3 lokal, Q4–Q7 test mühitində deploy-dan sonra aparılır. Deploy GitLab-dadır.

## Q1. API build və kontrakt

```bash
cd product-rest/api-cbar-admin && dotnet build
cd ../api-cbar && dotnet build
diff -r ../api-cbar/src/Cbar.Domain ../api-cbar-admin/src/Cbar.Domain -x bin -x obj   # boş olmalıdır
node ../../.claude/skills/sync-openapi/scripts/route-diff.mjs                          # fərq yoxdur
```

## Q2. Frontend gate

```bash
cd product-rest/web-cbar-admin-new && npm run verify
cd ../web-cbar-new && npm run verify
```

Testləri Node 22 ilə də işlət (CI versiyası). Verify nəticəsini tam oxu, `tail`-dən yox.

## Q3. Mock ilə UI

`web-cbar-admin-new`: `VITE_ENABLE_MSW=true npm run dev`. Tədbir yarat, redaktə et, sil; bölmə sil → `409` mesajı.

## Q4. Miqrasiya

Test deploy-undan sonra `api-cbar-admin` loqunda `0018`, `0019` tətbiq olunub, xəta yoxdur.

```bash
curl -s "https://api-cbar-test.cbar.az/api/v1/events?when=past&locale=az"        # 6 tədbir
curl -s "https://api-cbar-test.cbar.az/api/v1/event-categories?locale=az"        # 200
```

`api-cbar` bu cavabları `cbar_web_ro` ilə verirsə grant işləyir.

## Q5. Ssenarilər

1. Paneldə gələcək tədbir yarat → `/az/media/events`-də görünür, ana səhifə Təqvimində görünür.
2. Tarix redaktə et → saytda dəyişir.
3. Bugünkü tədbir "Gələcək"dədir. Sabahkı gündə "Keçmiş"ə keçir.
4. TDT: qalereya `#3`, reliz `#75` bağla → detalda qalereya və link. Qalereyanı deaktiv et → blok düşür, səhifə açılır.
5. Filtrləri JavaScript söndürülmüş işlət.

## Q6. Köhnə data

18 səhifənin ünvanını, mətn uzunluğunu və şəkil sayını deploy-dan əvvəl və sonra tutuşdur (`research.md`-dəki sorğu üsulu).
Nəticə tam eyni olmalıdır. Arxivdə 6 kart öz səhifəsini açır, COP29-da sol menyu və breadcrumb işləyir.
Üst menyuda və `/az/media/events` sol menyusunda köhnə alt ağac yoxdur. Prod-da da 6 tədbirin yarandığını yoxla: slug-lar orada ölçülməyib.

## Q7. Figma

1728, 744, 390 enlərində sətir, tarix qutusu, tab, detal qutularını `getBoundingClientRect` ilə `ui-contract.md`-yə tutuşdur.
