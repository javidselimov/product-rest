-- Currency master: every code of the official rate bulletin (spec 025-currency-rates-xlsx-import,
-- data-model.md). The .xlsx import skips codes the master does not know, and the master had
-- only 12, so today's bulletin would load 12 of its 42 rates. These 30 complete it.
--
-- Sources: nominal and az name from the bulletin itself (columns A and C of
-- "Resmi Mezenne 13 10 2026.xlsx"), en name from the legacy site
-- (product-host/common/messages/en/other.php). SDR is stored as `SDR`, not ISO `XDR`, because
-- the legacy XML feed publishes it as `Code="SDR"`; the importer maps the bulletin's `XDR`.
-- sort_order continues after the existing 12 in the legacy list's order, metals last.
--
-- The existing 12 are not touched (an editor's sort order and homepage flags stay), and a code
-- already added by hand is left as it is.
--
-- On a fresh database this runs before db/seed.sql, while `locales` is still empty: the names
-- are joined to `locales` so that no row breaks its foreign key, and seed.sql inserts them for
-- that case.
INSERT INTO currencies (code, nominal, sort_order, is_active, show_on_homepage) VALUES
    ('AUD',   1, 13, true, false), ('BYN',   1, 14, true, false), ('KRW', 100, 15, true, false),
    ('CZK',   1, 16, true, false), ('DKK',   1, 17, true, false), ('HKD',   1, 18, true, false),
    ('INR',   1, 19, true, false), ('SEK',   1, 20, true, false), ('ILS',   1, 21, true, false),
    ('CAD',   1, 22, true, false), ('KWD',   1, 23, true, false), ('QAR',   1, 24, true, false),
    ('KGS',   1, 25, true, false), ('HUF', 100, 26, true, false), ('MDL',   1, 27, true, false),
    ('NOK',   1, 28, true, false), ('UZS', 100, 29, true, false), ('PKR', 100, 30, true, false),
    ('PLN',   1, 31, true, false), ('RON',   1, 32, true, false), ('RSD',   1, 33, true, false),
    ('SGD',   1, 34, true, false), ('SDR',   1, 35, true, false), ('TMT',   1, 36, true, false),
    ('UAH',   1, 37, true, false), ('NZD',   1, 38, true, false), ('XAU',   1, 39, true, false),
    ('XAG',   1, 40, true, false), ('XPT',   1, 41, true, false), ('XPD',   1, 42, true, false)
ON CONFLICT (code) DO NOTHING;

INSERT INTO currency_translations (currency_code, locale, name)
SELECT v.code, v.locale, v.name
FROM (VALUES
    ('AUD', 'az', 'Avstraliya dolları'),       ('AUD', 'en', 'Australian Dollar'),
    ('BYN', 'az', 'Belarus rublu'),            ('BYN', 'en', 'Belarus Ruble'),
    ('KRW', 'az', 'Cənubi Korea vonu'),        ('KRW', 'en', 'South Korean Won'),
    ('CZK', 'az', 'Çexiya kronu'),             ('CZK', 'en', 'Czech Koruna'),
    ('DKK', 'az', 'Danimarka kronu'),          ('DKK', 'en', 'Danish Krone'),
    ('HKD', 'az', 'Honq Konq dolları'),        ('HKD', 'en', 'Hong Kong Dollar'),
    ('INR', 'az', 'Hindistan rupisi'),         ('INR', 'en', 'Indian Rupee'),
    ('SEK', 'az', 'İsveç kronu'),              ('SEK', 'en', 'Swedish Krona'),
    ('ILS', 'az', 'İsrail şekeli'),            ('ILS', 'en', 'Israeli Shekel'),
    ('CAD', 'az', 'Kanada dolları'),           ('CAD', 'en', 'Canadian Dollar'),
    ('KWD', 'az', 'Küveyt dinarı'),            ('KWD', 'en', 'Kuwaiti Dinar'),
    ('QAR', 'az', 'Qətər rialı'),              ('QAR', 'en', 'Qatari Rial'),
    ('KGS', 'az', 'Qırğız somu'),              ('KGS', 'en', 'Kyrgyz Som'),
    ('HUF', 'az', 'Macarıstan forinti'),       ('HUF', 'en', 'Hungarian Forint'),
    ('MDL', 'az', 'Moldova leyi'),             ('MDL', 'en', 'Moldovan Leu'),
    ('NOK', 'az', 'Norveç kronu'),             ('NOK', 'en', 'Norwegian Krone'),
    ('UZS', 'az', 'Özbək somu'),               ('UZS', 'en', 'Uzbek Sum'),
    ('PKR', 'az', 'Pakistan rupisi'),          ('PKR', 'en', 'Pakistani Rupee'),
    ('PLN', 'az', 'Polşa zlotası'),            ('PLN', 'en', 'Polish Zloty'),
    ('RON', 'az', 'Rumıniya leyi'),            ('RON', 'en', 'Romanian Lei'),
    ('RSD', 'az', 'Serbiya dinarı'),           ('RSD', 'en', 'Serbian Dinar'),
    ('SGD', 'az', 'Sinqapur dolları'),         ('SGD', 'en', 'Singapore Dollar'),
    ('SDR', 'az', 'SDR (BVF-nin xüsusi borcalma hüquqları)'), ('SDR', 'en', 'SDR (Special Drawing Rights)'),
    ('TMT', 'az', 'Türkmənistan manatı'),      ('TMT', 'en', 'New Turkmenistan Manat'),
    ('UAH', 'az', 'Ukrayna qrivnası'),         ('UAH', 'en', 'Ukrainian Hryvnia'),
    ('NZD', 'az', 'Yeni Zelandiya dolları'),   ('NZD', 'en', 'New Zealand Dollar'),
    ('XAU', 'az', 'Qızıl'),                    ('XAU', 'en', 'Gold'),
    ('XAG', 'az', 'Gümüş'),                    ('XAG', 'en', 'Silver'),
    ('XPT', 'az', 'Platin'),                   ('XPT', 'en', 'Platinum'),
    ('XPD', 'az', 'Palladium'),                ('XPD', 'en', 'Palladium')
) AS v(code, locale, name)
JOIN locales l ON l.code = v.locale
JOIN currencies c ON c.code = v.code
ON CONFLICT (currency_code, locale) DO NOTHING;
