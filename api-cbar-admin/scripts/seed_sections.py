#!/usr/bin/env python3
"""Seed the remaining cbar.az sections with real content (az/en) — batch round 3.

Covers: About us, Payment systems, National currency, Publications and
research, Consumer and Investor Rights, Financial Literacy, Sustainable
Finance, International Cooperation, Human Resources.

Same pipeline as seed_market_actors.py / seed_legal_framework.py (see
seed_lib.py). Dumps live in /Users/binturong/Documents/projects/cbar/.scratch/<section>/.

    python3 scripts/seed_sections.py [--api http://localhost:5253] [--section NAME]
"""
import argparse
from pathlib import Path

from seed_lib import Api, run_seed

SCRATCH = Path("/Users/binturong/Documents/projects/cbar/.scratch")

# section -> (root az title from seed_pages.py, root dump id or None,
#             [(az, en, dump id or None, [children]), ...])
# Group headers on the live site link to their first child; here they are
# content-less parent pages (the renderer shows child cards for those).
# App-route nodes (organization pages, banknote/coin catalogs, external
# portals) are not CMS pages: they stay title-only or are skipped.
SECTIONS = {
    "about-us": ("Haqqımızda", 3, [
        ("Tarix", "History", 4, []),
        ("Təşkilati struktur və idarəetmə", "Organizational structure and management", 5, [
            ("Pul Siyasəti və Maliyyə Sabitliyi Komitəsi",
             "Monetary Policy and Financial Stability Committee", 799, []),
        ]),
        ("Missiya və dəyərlər", "Mission and values", 849, []),
        ("Əlaqə", "Contacts", 97, []),
    ]),
    "payment-systems": ("Ödəniş sistemləri", 474, [
        ("Ödəniş və hesablaşmalar sistemləri", "Payment and Settlement Systems", None, [
            ("Real Vaxt Rejimində Hesablaşmalar Sistemi (AZIPS)",
             "Real Time Gross Settlement System (AZIPS)", 477, []),
            ("Xırda Ödənişlər üzrə Hesablaşma Klirinq Sistemi (XÖHKS)",
             "Low Value Payments Clearing and Settlement System", 478, []),
            ("Ani Ödənişlər Sistemi (AÖS)", "Instant Payments System (IPS)", 479, []),
            ("Banklararası Kart Mərkəzi (BKM)", "The Interbank Card Center (ICC)", 480, []),
            ("Hökumət Ödəniş Portalı (HÖP)", "The Government Payment Portal (GPP)", 481, []),
        ]),
        ("Reqlament və tariflər", "Reglaments and tariffs", 483, []),
        ("İştirakçılar", "Participants", 681, []),
        ("Ödəniş sistemləri üzrə standartlar", "Payment System Standards", None, [
            ("AZQR", "AZQR", 619, []),
            ("ISO20022", "ISO20022", 617, []),
            ("IBAN", "IBAN", 618, []),
        ]),
        ("Rəqəmsal ödənişlərin inkişafı", "Development of Digital Payments", None, [
            ("Dövlət proqramları", "State programs", 679, []),
            ("Rəqəmsal ödəniş strategiyası", "Digital payment strategy", 680, []),
            ("Açıq bankçılığın tətbiqi üzrə yol xəritəsi", "Open banking road map", 716, []),
        ]),
        ("Ödəniş sistemlərinə nəzarət", "Oversight of Payment Systems", None, [
            ("Ödəniş sistemlərinə nəzarətin hüquqi əsasları",
             "Legal basis for oversight of payment systems", 620, []),
            ("Sistem əhəmiyyətli banklara nəzarət",
             "Oversight of systemically important banks", 621, []),
            ("Ödəniş alətlərinə nəzarət", "Oversight of payment instruments", 622, []),
            ("Pulköçürmə sistemlərinin siyahısı", "List of money transfer systems", 624, []),
            ("Xidmət mərkəzlərinin və prosessinq fəaliyyəti həyata keçirən bankların siyahısı",
             "List of service centers and banks involved in processing activities", 625, []),
        ]),
        ("Rəqəmsal ödənişlərin stimullaşdırılması", "Stimulation of Digital Payments", None, [
            ("Nominasiyalar", "Nominations", 626, []),
            ("Lotereya və kampaniyalar", "Lotteries and Campaigns", None, [
                ("AniPay ilə ödə və qazan 2021", "Pay by AniPay and win 2021", 717, []),
                ("Kartla ödə, kartla qazan 2020", "Pay by Card, win by Card 2020", 629, []),
                ("Kartla ödə, kartla qazan 2019", "Pay by Card, win by Card 2019", 628, []),
                ("Visa kartları ilə ödəniş qazandırır", "Pay with Visa and earn", 630, []),
            ]),
        ]),
        # 875 is an empty az-only landing page; keeping the group content-less
        # with both titles so its children stay reachable in both locales
        # (the live EN site floats 896/897 elsewhere in the nav — a source
        # inconsistency not worth mirroring). 896/897 serve Azerbaijani titles
        # even on the EN site; kept faithful.
        ("Açıq bankçılıq", "Open Banking", None, [
            ("Hesab üzrə məlumat xidməti", "Hesab üzrə məlumat xidməti", 896, []),
            ("Ödəniş əməliyyatlarının başladılması xidməti",
             "Ödəniş əməliyyatlarının başladılması xidməti", 897, []),
        ]),
        ("İcmal və infoqrafika", "Review and infographics", None, [
            ("Rəqəmsal ödənişlər icmalı", "Payment systems review", 678, []),
        ]),
    ]),
    "national-currency": ("Milli pul nişanları", None, [
        ("Milli pul nişanlarının tarixi", "History of national currency", 168, []),
        ("Tədavüldə olan pul nişanları", "Currency in circulation", 28, []),
        ("İnvestisiya, yubiley və xatirə pul nişanları",
         "Bullion coins and commemorative coins", None, []),
        ("Tədavüldən çıxarılmış pul nişanları", "Currency withdrawn from circulation", 30, []),
        ("Pul nişanları üzrə hüquqi baza", "Currency legislation", 32, []),
        ("Nağd pul dövriyyəsi", "Cash circulation", 33, []),
        ("Pul nişanlarının dəyişdirilməsi", "Replacement of currencies", 841, []),
        ("Saxta pul nişanları", "Counterfeit money", 34, []),
        ("Operator banklar", "Operator banks", 833, []),
        ("İnvestisiya pul nişanları üzrə satış agentləri", "Bullion coin sales agents", 838, []),
        ("Yubiley və xatirə pul nişanları üzrə satış agenti",
         "Commemorative coin sales agents", 840, []),
    ]),
    "publications": ("Nəşrlər və tədqiqatlar", 46, [
        ("İllik hesabat", "Annual reports", 6, []),
        ("Maliyyə sabitliyi hesabatı", "Financial Stability Report", 798, []),
        ("Bank sektoru üzrə makroprudensial siyasət çərçivəsi",
         "Banking sector macroprudential policy framework", 871, []),
        ("Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası",
         "Risk-Based Supervision Policy Concept", 872, []),
        ("Nəzarət Texnologiyaları üzrə Yol Xəritəsi",
         "Brief Overview of the Supervision Technologies Road Map", 874, []),
        ("İstehlakçıların hüquqlarının müdafiəsi və Maliyyə savadlılığı",
         "Consumer Protection and Financial Literacy", 844, []),
        ("Maliyyə bazarlarında kibertəhlükəsizlik Strategiyası",
         "Cybersecurity Strategy in Financial Markets", 817, []),
        ("Dayanıqlı Maliyyə üzrə Yol Xəritəsi", "Sustainable Finance Roadmap", 812, []),
        ("Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu",
         "Credit Conditions and Funding Sources Survey Results", 797, []),
        ("Maliyyə xidmətləri sahəsində tənzimləyici çərçivənin hazırlıq səviyyəsinin təhlili",
         "Regulatory Framework Readiness Analysis", 851, []),
        ("İşçi məqalələr silsiləsi", "Working paper series", 48, []),
        ("Ekonometrik modellər", "Econometric models", 49, []),
        ("Sahələrarası maliyyə axınlarının təhlili",
         "Intersectoral Financial Flows Analysis", 795, []),
        ("Mikromaliyyə Modeli üzrə Strateji Çərçivə",
         "Strategic Framework for a Microfinance Model", 878, []),
    ]),
    "consumer-rights": ("İstehlakçıların və investorların hüquqları", None, [
        ("Fəaliyyət istiqamətləri", "Activity directions", 185, []),
        ("Müraciətlərə baxılması", "Review of appeals", 639, []),
        ("Vətəndaşların qəbulu", "Reception of citizens", 637, []),
        ("Bizimlə əlaqə", "Contact us", 638, []),
        ("Əks əlaqə", "Call back", 631, []),
        ("İnfoqrafika", "Infographics", 641, []),
        ("Vətəndaş müraciətlərinə dair statistika", "Statistics of citizens' appeals", 800, []),
        ("Bank xidmətlərindən istifadə üzrə şikayət indeksi",
         "Complaint index on bank customers' use of bank services", 842, []),
        ("Avto-icbari sığorta üzrə şikayət indeksi",
         "Complaint index on compulsory MTPL insurance", 806, []),
        ("Tədbirlər", "Events", 642, []),
        ("Təkliflər", "Proposals", 643, []),
        ("Ərazi idarələrinə müraciət", "Appeal to Regional Offices", 814, []),
        ("Tətbiq edilmiş nəzarət tədbirləri", "Supervisory actions imposed", 843, []),
        ("Kapital bazarı", "Capital market", 828, []),
        ("Ödəniş xidmətləri", "Payment services", 864, []),
        ("Rəqəmsal fırıldaqçılıq statistikası", "Digital Fraud Statistics", 891, []),
    ]),
    "financial-literacy": ("Maliyyə savadlılığı", 67, [
        ("Ümumi məlumat", "General information", 818, []),
        ("Seminarlar/vebinarlar", "Seminars and webinars", 819, []),
        ("Müsabiqələr", "Competitions", 820, []),
        ("Maliyyə Savadlılığı portalı", "Financial Literacy Portal", 821, []),
        ("Virtual Təhsil Platforması", "Virtual Education Platform", 822, []),
        ("Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi",
         "Information and Search System for Financial Products and Services", 823, []),
    ]),
    "sustainable-finance": ("Dayanıqlı Maliyyə", 834, [
        ("Dayanıqlı Maliyyə üzrə Yol Xəritəsi", "Sustainable Finance Roadmap", 835, []),
        ("Dayanıqlı maliyyə taksonomiyalarının qarşılıqlı əlaqəliliyi və müqayisəliliyinin inkişafına dair Yol Xəritəsi",
         "Roadmap for Advancing Interoperability and Comparability of Sustainable Finance Taxonomies", 867, []),
        ("Dayanıqlı maliyyə üzrə hesabatlar", "Reports on sustainable finance", 839, []),
        ("Dayanıqlı maliyyə üzrə sənədlər", "Sustainable Finance Documents", 850, []),
        ("Xəbərlər", "News", 836, []),
        ("Bilmək faydalıdır", "Useful to know", 837, []),
    ]),
    "intl-cooperation": ("Beynəlxalq əməkdaşlıq", 68, [
        ("Beynəlxalq təşkilatlarla əməkdaşlıq",
         "Cooperation with international organizations", 69, []),
        ("Mərkəzi banklarla əməkdaşlıq", "Cooperation with central banks", 70, []),
        ("Beynəlxalq tədbirlər", "International events", 71, []),
        ("AMB tərəfindən təqdim edilən texniki yardımlar",
         "Technical assistance by the CBA", 75, []),
    ]),
    "human-resources": ("İnsan resursları", 722, [
        ("Vakansiyalar", "Vacancies", None, []),
        ("İşə müraciət edənlər üçün məlumat", "Information for job applicants", 724, []),
        ("Niyə bizə qoşulmalı?", "Why join us?", 725, []),
        ("MALİYYƏÇİSƏN təcrübə proqramı", "MALIYYECHISEN internship program", 726, []),
    ]),
    # Press-release feeds and photo/video galleries are app features, not CMS
    # pages — their menu nodes stay title-only.
    "media": ("Media", 56, [
        ("Press-relizlər", "Press-releases", None, []),
        ("Elanlar", "Announcements and notices", None, []),
        ("Təqdimat və məruzələr", "Presentations and speeches", 59, []),
        ("Korporativ sosial məsuliyyət", "Corporate Social Responsibility", 60, []),
        ("Fotoqalereya", "Photo gallery", None, []),
        ("Videoqalereya", "Video gallery", None, []),
        ("Tədbirlər", "Events", None, [
            ("COP29", "COP29", 865, [
                ("Fotoqalereya", "Photo gallery", 869, []),
                ("Video qalereya", "Video gallery", 870, []),
            ]),
            ("Azərbaycan mərkəzi bankçılığı - 105 il",
             "Azerbaijan Central Banking - 105 years", 861, [
                ("Azərbaycan mərkəzi bankçılığının yaranmasının 105-ci ildönümüdür",
                 "Central Bank of Azerbaijan celebrates its 105th anniversary", 862, []),
                ("Mərkəzi bankçılığın 105 illik yubileyinə həsr olunan tədbir",
                 "Mərkəzi bankçılığın 105 illik yubileyinə həsr olunan tədbir", 863, []),
            ]),
            ("Azərbaycan mərkəzi bankçılığı - 100 il",
             "Azerbaijan Central Banking - 100 Years", None, [
                ("Azərbaycan Respublikası Prezidentinin Sərəncamı",
                 "Decree of the President of the Republic of Azerbaijan", 156, []),
                ("Məqalə - Azərbaycanda mərkəzi bankçılığın 100 illik inkişaf yolu",
                 "100 year development path of central banking in Azerbaijan", 158, []),
                ("Yubiley poçt markası", "Jubilee stamp", 159, []),
                ("Yubiley pul nişanı", "Commemorative coin", 160, []),
                ("Yubileylə əlaqədar jurnalistlər üçün seminar və press-tur",
                 "Training and press-tour related to the anniversary", 162, []),
                ("Fotoqalereya", "Photo gallery", 163, []),
                ("Video qalereya", "Video gallery", 164, []),
            ]),
            ("Heydər Əliyev - 100 il", "Haydar Aliyev-100 years", 813, []),
            ("Heydər Əliyev - 90 il", "Heydar Aliyev – 90 years", 65, []),
            ("AR Mərkəzi Bankı – 20 il",
             "Central Bank of the Republic of Azerbaijan – 20 years", 66, []),
        ]),
        ("İnformasiya sorğusu", "Request for information", 63, []),
        ("İnzibati işlərə baxan vəzifəli şəxslər",
         "Officials authorized to consider cases on administrative violations", 121, []),
    ]),
    # Root /pages/strategy is an app route; only the progress-report child is
    # a CMS page. az title must match seed_pages.py.
    "fsds": ("Maliyyə sektorunun inkişaf Strategiyası", None, [
        ("2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası icra statusu",
         "Financial Sector Development Strategy 2024-2026 Progress Report 2024", 877, []),
    ]),
    # Interactive Statistic Database is an external app (navigation.e-cbar.az)
    # — title-only node. Page 132 (NSDP) exists only in English on the live
    # site; the stub handling hides its az variant.
    "statistics": ("Statistika", 39, [
        ("Statistik bülleten", "Statistical bulletin", 40, []),
        ("Makroiqtisadi statistika", "Macroeconomic indicators", 41, []),
        ("Pul-kredit statistikası", "Monetary indicators", 42, []),
        ("Xarici sektorun statistikası", "External sector statistics", 43, []),
        ("Maliyyə sektorunun statistikası", "Financial market indicators", None, [
            ("Kredit təşkilatları", "Credit institutions", 188, []),
            ("Sığorta", "Insurance", 189, []),
            ("Kapital bazarı", "Capital market", 190, []),
        ]),
        ("Ödəniş sistemlərinin statistikası", "Payment system indicators", 45, []),
        ("İnteraktiv statistik məlumat bazası", "Interactive Statistic Database", None, []),
        ("Statistik hesabatların yayımlanması qrafiki",
         "Schedule of statistical releases", 103, []),
        ("NSDP üçün statistik məlumatlar", "Statistical Data for NSDP", 132, []),
    ]),
    # Standalone top-level pages; dumps live in the shared fsds-misc dir.
    "disclosure-schedule": ("Məlumatların yayımlanması qrafiki", 72, []),
    "questions-answers": ("Sual − cavab", 73, []),
    "references": ("İstinadlar", 74, []),
    "fincert": ("FinCERT", 893, []),
    "nakhchivan": ("Naxçıvan Muxtar Respublikası İdarəsi", 811, []),
}

# section name -> dumps directory under SCRATCH (defaults to the section name)
DUMP_DIRS = {
    "fsds": "fsds-misc",
    "disclosure-schedule": "fsds-misc",
    "questions-answers": "fsds-misc",
    "references": "fsds-misc",
    "fincert": "fsds-misc",
    "nakhchivan": "fsds-misc",
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:5253")
    ap.add_argument("--username", default="admin")
    ap.add_argument("--password", default="ChangeMe123!")
    ap.add_argument("--section", choices=[*SECTIONS, "all"], default="all")
    args = ap.parse_args()

    api = Api(args.api, args.username, args.password)
    names = list(SECTIONS) if args.section == "all" else [args.section]
    for name in names:
        root_az, root_dump, children = SECTIONS[name]
        print(f"== {name} ({root_az})")
        dumps = SCRATCH / DUMP_DIRS.get(name, name)
        run_seed(api, dumps, root_az, children, root_dump=root_dump)


if __name__ == "__main__":
    main()
