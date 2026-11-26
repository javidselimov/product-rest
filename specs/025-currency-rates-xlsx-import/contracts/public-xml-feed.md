# Contract: `GET /currencies/{DD.MM.YYYY}.xml` (api-cbar) — bank metalları bloku

Endpoint, URL, status kodları və mövcud elementlər **dəyişmir** (Maddə VII.1). Yeganə dəyişiklik:
metallar master-ə əlavə olunanda onların "Xarici valyutalar" blokuna düşməməsi və legacy-dəki
kimi ayrıca blokda çıxması (research R5). Mənbə: `product-host/visitor/views/currency/xml.php`.

OpenAPI-də path dəyişmir (`api-cbar/openapi/`), yalnız cavab nümunəsi/təsviri yenilənir.

## Struktur

```xml
<?xml version="1.0" encoding="UTF-8"?>
<ValCurs Date="13.10.2026" Name="AZN məzənnələri">
  <ValType Type="Bank metalları">
    <Valute Code="XPD"><Nominal>1 t.u.</Nominal><Name>Palladium</Name><Value>1950.8605</Value></Valute>
    <Valute Code="XPT"><Nominal>1 t.u.</Nominal><Name>Platin</Name><Value>2887.9685</Value></Valute>
    <Valute Code="XAG"><Nominal>1 t.u.</Nominal><Name>Gümüş</Name><Value>102.9575</Value></Valute>
    <Valute Code="XAU"><Nominal>1 t.u.</Nominal><Name>Qızıl</Name><Value>7133.2510</Value></Valute>
  </ValType>
  <ValType Type="Xarici valyutalar">
    <Valute Code="USD"><Nominal>1</Nominal><Name>1 ABŞ dolları</Name><Value>1.7000</Value></Valute>
    …
    <Valute Code="SDR"><Nominal>1</Nominal><Name>1 SDR (BVF-nin xüsusi borcalma hüquqları)</Name><Value>2.3005</Value></Valute>
    …
  </ValType>
</ValCurs>
```

## Qaydalar

- Metal kodları sabit set: `XPD, XPT, XAG, XAU` — **bu sıra ilə** (legacy), `sort_order`-dən asılı
  deyil. `api-cbar`-da konstant.
- Metal bloku "Xarici valyutalar"-dan **əvvəl** gəlir. Həmin tarix üçün heç bir metal yoxdursa
  blok tamamilə buraxılır (bu günkü 12 valyutalıq vərəqlər üçün çıxış bayt-bayt dəyişmir).
- Metal `<Nominal>` = `1 t.u.` (mətn), `<Name>` = az adı, nominal prefiksi olmadan.
- "Xarici valyutalar": indiki kimi, `sort_order` ilə, metallar çıxılmaqla.
- `<Value>` formatı indiki kimi `0.0000`.
- `TODO(compat)` marker-i qalır (`Description` atributu, valyuta sırası, həftəsonu fallback hələ
  ayrıca məsələlərdir — `diff_report_logic.md` §4.1).

## Public JSON (`GET /api/v1/currencies`) — dəyişmir

Yeni kodlar (metallar daxil) cavabda `sort_order` ilə görünür. `web-cbar-new` cədvəli onları
ümumi cədvəldə göstərir; metalların ayrıca bölmədə göstərilməsi bu spec-ə daxil deyil (plan →
"Açıq məsələlər").
