-- Seed data for local development

-- The SELECT-only role cbar-web-api connects as. Deliberately created here and
-- not in a migration: a migration would ship the same password to every
-- environment. Real environments create this role out-of-band with a vault
-- secret; migration 0001 then grants it read access.
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'cbar_web_ro') THEN
        CREATE ROLE cbar_web_ro LOGIN PASSWORD 'cbar_web_ro_local_dev';
    END IF;
    EXECUTE format('GRANT CONNECT ON DATABASE %I TO cbar_web_ro', current_database());
    GRANT USAGE ON SCHEMA public TO cbar_web_ro;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO cbar_web_ro;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO cbar_web_ro;
END $$;

INSERT INTO locales (code, name, is_default, is_active) VALUES
    ('az', 'Azərbaycan dili', true,  true),
    ('en', 'English',         false, true);

INSERT INTO roles (code, name) VALUES
    ('admin',        'Administrator'),
    ('moderator',    'Moderator'),
    ('meas_manager', 'MEAS Manager');

-- Local dev admin: admin / ChangeMe123! (BCrypt hash, regenerate for real envs)
INSERT INTO users (username, email, password_hash, role_id) VALUES
    ('admin', 'admin@cbar.local',
     '$2y$12$FgZ3jRvxU8entcCqQXcZUOqAfOpYXAcy7CDkhRTa/fcQhGE3LapHK',
     (SELECT id FROM roles WHERE code = 'admin'));

-- Currencies published in the daily CBAR rate sheet
INSERT INTO currencies (code, nominal, sort_order) VALUES
    ('USD', 1, 1), ('EUR', 1, 2), ('RUB', 100, 3), ('GBP', 1, 4),
    ('TRY', 1, 5), ('CHF', 1, 6), ('JPY', 100, 7), ('CNY', 1, 8),
    ('GEL', 1, 9), ('AED', 1, 10), ('SAR', 1, 11), ('KZT', 100, 12);

-- Migration 0002 flags these on live DBs; on a fresh DB it runs before this
-- seed inserts the currencies, so set the homepage flags here as well.
UPDATE currencies SET show_on_homepage = true WHERE code IN ('USD','EUR','RUB','TRY');

INSERT INTO currency_translations (currency_code, locale, name) VALUES
    ('USD', 'az', 'ABŞ dolları'),       ('USD', 'en', 'US Dollar'),
    ('EUR', 'az', 'Avro'),              ('EUR', 'en', 'Euro'),
    ('RUB', 'az', 'Rusiya rublu'),      ('RUB', 'en', 'Russian Ruble'),
    ('GBP', 'az', 'İngilis funt sterlinqi'), ('GBP', 'en', 'Pound Sterling'),
    ('TRY', 'az', 'Türkiyə lirəsi'),    ('TRY', 'en', 'Turkish Lira'),
    ('CHF', 'az', 'İsveçrə frankı'),    ('CHF', 'en', 'Swiss Franc'),
    ('JPY', 'az', 'Yapon yeni'),        ('JPY', 'en', 'Japanese Yen'),
    ('CNY', 'az', 'Çin yuanı'),         ('CNY', 'en', 'Chinese Yuan'),
    ('GEL', 'az', 'Gürcü larisi'),      ('GEL', 'en', 'Georgian Lari'),
    ('AED', 'az', 'BƏƏ dirhəmi'),       ('AED', 'en', 'UAE Dirham'),
    ('SAR', 'az', 'Səudiyyə riyalı'),   ('SAR', 'en', 'Saudi Riyal'),
    ('KZT', 'az', 'Qazaxıstan tengəsi'),('KZT', 'en', 'Kazakhstani Tenge');

-- Migration 0010 adds the rest of the bulletin's currencies; on a fresh DB it runs before the
-- locales above exist, so their names are seeded here.
INSERT INTO currency_translations (currency_code, locale, name) VALUES
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
ON CONFLICT (currency_code, locale) DO NOTHING;
