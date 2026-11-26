# Data Model: Rəsmi məzənnə bülleteninin Excel importu

**Feature**: [spec.md](spec.md) | **Research**: [research.md](research.md)

Sxem dəyişikliyi yoxdur. Yeni cədvəl, sütun yoxdur, `Cbar.Domain` dəyişmir. Dəyişən yalnız
`currencies` / `currency_translations` **məlumatıdır**: migration
`0010-currency-bulletin-master.sql` (`api-cbar-admin/db/migrations/`).

## Mövcud cədvəllər (dəyişmir)

| Cədvəl | Açar | Qeyd |
|---|---|---|
| `currencies` | `code char(3)` | `nominal`, `sort_order`, `is_active`, `show_on_homepage` |
| `currency_translations` | `(currency_code, locale)` unikal | `name varchar(150)` |
| `currency_rates` | `(rate_date, currency_code)` unikal | `rate numeric(12,4) CHECK (rate > 0)`, FK → `currencies` `ON DELETE RESTRICT` |

`numeric(12,4)`: maksimum `99 999 999.9999`. Bülletendəki ən böyük dəyər XAU ≈ 7 133.
CHECK `rate > 0` FR-011-i bazada da qoruyur.

## Master-ə əlavə olunan 30 kod (FR-010a, research R6)

`sort_order` 13-dən başlayır, legacy siyahının sırası ilə. Hamısı `is_active = true`,
`show_on_homepage = false`. `ON CONFLICT (code) DO NOTHING`.

| # | code | nominal | az (bülleten `C`) | en (legacy) |
|---|---|---|---|---|
| 13 | AUD | 1 | Avstraliya dolları | Australian Dollar |
| 14 | BYN | 1 | Belarus rublu | Belarus Ruble |
| 15 | KRW | 100 | Cənubi Korea vonu | South Korean Won |
| 16 | CZK | 1 | Çexiya kronu | Czech Koruna |
| 17 | DKK | 1 | Danimarka kronu | Danish Krone |
| 18 | HKD | 1 | Honq Konq dolları | Hong Kong Dollar |
| 19 | INR | 1 | Hindistan rupisi | Indian Rupee |
| 20 | SEK | 1 | İsveç kronu | Swedish Krona |
| 21 | ILS | 1 | İsrail şekeli | Israeli Shekel |
| 22 | CAD | 1 | Kanada dolları | Canadian Dollar |
| 23 | KWD | 1 | Küveyt dinarı | Kuwaiti Dinar |
| 24 | QAR | 1 | Qətər rialı | Qatari Rial |
| 25 | KGS | 1 | Qırğız somu | Kyrgyz Som |
| 26 | HUF | 100 | Macarıstan forinti | Hungarian Forint |
| 27 | MDL | 1 | Moldova leyi | Moldovan Leu |
| 28 | NOK | 1 | Norveç kronu | Norwegian Krone |
| 29 | UZS | 100 | Özbək somu | Uzbek Sum |
| 30 | PKR | 100 | Pakistan rupisi | Pakistani Rupee |
| 31 | PLN | 1 | Polşa zlotası | Polish Zloty |
| 32 | RON | 1 | Rumıniya leyi | Romanian Lei |
| 33 | RSD | 1 | Serbiya dinarı | Serbian Dinar |
| 34 | SGD | 1 | Sinqapur dolları | Singapore Dollar |
| 35 | SDR | 1 | SDR (BVF-nin xüsusi borcalma hüquqları) | SDR (Special Drawing Rights) |
| 36 | TMT | 1 | Türkmənistan manatı | New Turkmenistan Manat |
| 37 | UAH | 1 | Ukrayna qrivnası | Ukrainian Hryvnia |
| 38 | NZD | 1 | Yeni Zelandiya dolları | New Zealand Dollar |
| 39 | XAU | 1 | Qızıl | Gold |
| 40 | XAG | 1 | Gümüş | Silver |
| 41 | XPT | 1 | Platin | Platinum |
| 42 | XPD | 1 | Palladium | Palladium |

Mövcud 12 (`USD, EUR, RUB, GBP, TRY, CHF, JPY, CNY, GEL, AED, SAR, KZT`) toxunulmaz qalır;
nominalları bülletenlə üst-üstə düşür (`RUB, JPY, KZT` = 100).

## Bülleten sətri → məzənnə (yaddaşda, saxlanılmır)

```
BulletinRow { row: int (7..100), code: string (A–Z{3}), rawValue: string? }
```

| Qayda | Mənbə | Nəticə |
|---|---|---|
| `B` trim + upper, `[A-Z]{3}` deyil | FR-006 | sətir səssiz ötürülür |
| `code == "XDR"` | FR-008, R4 | `code = "SDR"` |
| kod master-də yoxdur | FR-010 | `skipped[]`-ə düşür |
| kod faylda ikinci dəfə | FR-012 | import rədd, `duplicate_code` |
| `G` boş / rəqəm deyil / `≤ 0` | FR-011 | import rədd, `invalid_rate` + `row`, `currency` |
| `G` rəqəm | FR-007, R3 | 15 əhəmiyyətli rəqəm → 4 onluq, `AwayFromZero` |
| heç bir tanınan kod | FR-013 | import rədd, `no_rates` |

Duplikat və master yoxlaması `XDR → SDR` çevrilməsindən **sonra** edilir (faylda həm `XDR`, həm
`SDR` olarsa — duplikat).

## Import nəticəsi

```
CurrencyRateImportResult {
  date: DateOnly
  imported: int                 // yazılan (yeni + yenilənən) kod sayı
  skipped: string[]             // master-də olmayan kodlar, fayldakı sırası ilə
  rates: { currencyCode, rate }[]
}
```

## Vəziyyət keçidləri (bir tarix üçün)

```
[vərəq yoxdur] --import--> [vərəq: fayldakı kodlar]
[vərəq var] --import (overwrite=false)--> 409 sheet_exists, dəyişiklik yoxdur
[vərəq var] --import (overwrite=true)--> [fayldakı kodlar yenilənir, qalanları toxunulmaz]
[istənilən] --import xətası--> dəyişiklik yoxdur (tək tranzaksiya, FR-014)
```
