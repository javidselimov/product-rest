# Local-only seed script: commented out so it is not active in the repo.
# To run it locally, uncomment every line below (strip the leading "# ").
#
# #!/usr/bin/env python3
# """Seed the pages tree with the real cbar.az menu structure (az/en).
#
# Idempotent: pages are matched by (parent, az title) against the existing tree
# and skipped when present. Run while the admin API is up:
#
#     python3 scripts/seed_pages.py [--api http://localhost:5253]
# """
# import argparse
# import json
# import urllib.request
#
# # (az, en, [children]) — structure mirrors the live cbar.az sitemap (June 2026).
# TREE = [
#     ("Haqqımızda", "About us", [
#         ("Tarix", "History"),
#         ("Təşkilati struktur və idarəetmə", "Organizational structure and management"),
#         ("Missiya və dəyərlər", "Mission and values"),
#         ("Əlaqə", "Contacts"),
#     ]),
#     ("Pul siyasəti", "Monetary policy", [
#         ("Pul siyasəti icmalı", "Monetary Policy Review"),
#         ("Pul siyasətinin əsas istiqamətləri", "Main directions of the monetary policy"),
#         ("Pul siyasəti qərarları", "Monetary policy decisions"),
#         ("Proqnozlaşdırma və siyasət təhlili sistemi", "Forecasting and Policy Analysis System"),
#         ("Pul siyasəti alətləri və pul bazarı", "Monetary policy tools and money market"),
#     ]),
#     ("Bazar iştirakçıları", "Market actors", [
#         ("Kredit təşkilatları", "Credit institutions"),
#         ("Kapital bazarı", "Capital market"),
#         ("Sığorta", "Insurance"),
#         ("Ödənişlər", "Payments"),
#         ("Poçt rabitəsinin milli operatoru", "National postal operator"),
#         ("Valyuta mübadiləsi məntəqələri", "Currency exchange offices"),
#         ("Müsahibə Komissiyası tərəfindən baxılmış müraciətlərə dair statistika",
#          "Statistics on Applications Considered by the Interview Commission"),
#     ]),
#     ("Hüquqi aktlar", "Legal framework", [
#         ("Mərkəzi Bankın hüquqi əsasları", "Legal framework of the Central Bank"),
#         ("Kredit təşkilatları", "Credit Institutions"),
#         ("Ödənişlər", "Payments"),
#         ("Kapital bazarı", "Capital Market"),
#         ("Sığorta", "Insurance"),
#         ("Valyuta tənzimi", "Currency regulation"),
#         ("Statistika", "Statistics"),
#         ("Metodoloji sənədlər", "Methodological documents"),
#         ("Digər", "Other"),
#     ]),
#     ("Ödəniş sistemləri", "Payment systems", [
#         ("Ödəniş və hesablaşmalar sistemləri", "Payment and Settlement Systems"),
#         ("Reqlament və tariflər", "Reglaments and tariffs"),
#         ("İştirakçılar", "Participants"),
#         ("Ödəniş sistemləri üzrə standartlar", "Payment System Standards"),
#         ("Rəqəmsal ödənişlərin inkişafı", "Development of Digital Payments"),
#         ("Ödəniş sistemlərinə nəzarət", "Oversight of Payment Systems"),
#         ("Rəqəmsal ödənişlərin stimullaşdırılması", "Stimulation of Digital Payments"),
#         ("Açıq bankçılıq", "Open Banking"),
#         ("İcmal və infoqrafika", "Review and infographics"),
#     ]),
#     ("Milli pul nişanları", "National Currency", [
#         ("Milli pul nişanlarının tarixi", "History of national currency"),
#         ("Tədavüldə olan pul nişanları", "Currency in circulation"),
#         ("İnvestisiya, yubiley və xatirə pul nişanları", "Bullion coins and commemorative coins"),
#         ("Tədavüldən çıxarılmış pul nişanları", "Currency withdrawn from circulation"),
#         ("Pul nişanları üzrə hüquqi baza", "Currency legislation"),
#         ("Nağd pul dövriyyəsi", "Cash circulation"),
#         ("Pul nişanlarının dəyişdirilməsi", "Replacement of currencies"),
#         ("Saxta pul nişanları", "Counterfeit money"),
#         ("Operator banklar", "Operator banks"),
#         ("İnvestisiya pul nişanları üzrə satış agentləri", "Bullion coin sales agents"),
#         ("Yubiley və xatirə pul nişanları üzrə satış agenti", "Commemorative coin sales agents"),
#     ]),
#     ("Statistika", "Statistics", [
#         ("Statistik bülleten", "Statistical bulletin"),
#         ("Makroiqtisadi statistika", "Macroeconomic indicators"),
#         ("Pul-kredit statistikası", "Monetary indicators"),
#         ("Xarici sektorun statistikası", "External sector statistics"),
#         ("Maliyyə sektorunun statistikası", "Financial market indicators"),
#         ("Ödəniş sistemlərinin statistikası", "Payment system indicators"),
#         ("İnteraktiv statistik məlumat bazası", "Interactive Statistic Database"),
#         ("Statistik hesabatların yayımlanması qrafiki", "Schedule of statistical releases"),
#         ("NSDP üçün statistik məlumatlar", "Statistical Data for NSDP"),
#     ]),
#     ("Nəşrlər və tədqiqatlar", "Publications and research", [
#         ("İllik hesabat", "Annual reports"),
#         ("Maliyyə sabitliyi hesabatı", "Financial Stability Report"),
#         ("Bank sektoru üzrə makroprudensial siyasət çərçivəsi",
#          "Banking sector macroprudential policy framework"),
#         ("Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası", "Risk-Based Supervision Policy Concept"),
#         ("Nəzarət Texnologiyaları üzrə Yol Xəritəsi",
#          "Brief Overview of the Supervision Technologies Road Map"),
#         ("İstehlakçıların hüquqlarının müdafiəsi və Maliyyə savadlılığı",
#          "Consumer Protection and Financial Literacy"),
#         ("Maliyyə bazarlarında kibertəhlükəsizlik Strategiyası",
#          "Cybersecurity Strategy in Financial Markets"),
#         ("Dayanıqlı Maliyyə üzrə Yol Xəritəsi", "Sustainable Finance Roadmap"),
#         ("Kreditləşmə fəaliyyəti və maliyyələşmə mənbələrinə dair sorğu",
#          "Credit Conditions and Funding Sources Survey Results"),
#         ("Maliyyə xidmətləri sahəsində tənzimləyici çərçivənin hazırlıq səviyyəsinin təhlili",
#          "Regulatory Framework Readiness Analysis"),
#         ("İşçi məqalələr silsiləsi", "Working paper series"),
#         ("Ekonometrik modellər", "Econometric models"),
#         ("Sahələrarası maliyyə axınlarının təhlili", "Intersectoral Financial Flows Analysis"),
#         ("Mikromaliyyə Modeli üzrə Strateji Çərçivə",
#          "Strategic Framework for a Microfinance Model"),
#     ]),
#     ("Media", "Media", [
#         ("Press-relizlər", "Press-releases"),
#         ("Elanlar", "Announcements and notices"),
#         ("Təqdimat və məruzələr", "Presentations and speeches"),
#         ("Korporativ sosial məsuliyyət", "Corporate Social Responsibility"),
#         ("Fotoqalereya", "Photo gallery"),
#         ("Videoqalereya", "Video gallery"),
#         ("Tədbirlər", "Events"),
#         ("İnformasiya sorğusu", "Request for information"),
#         ("İnzibati işlərə baxan vəzifəli şəxslər",
#          "Officials authorized to consider cases on administrative violations"),
#     ]),
#     ("İstehlakçıların və investorların hüquqları", "Consumer and Investor Rights", [
#         ("Fəaliyyət istiqamətləri", "Activity directions"),
#         ("Müraciətlərə baxılması", "Review of appeals"),
#         ("Vətəndaşların qəbulu", "Reception of citizens"),
#         ("Bizimlə əlaqə", "Contact us"),
#         ("Əks əlaqə", "Call back"),
#         ("İnfoqrafika", "Infographics"),
#         ("Vətəndaş müraciətlərinə dair statistika", "Statistics of citizens' appeals"),
#         ("Bank xidmətlərindən istifadə üzrə şikayət indeksi",
#          "Complaint index on bank customers' use of bank services"),
#         ("Avto-icbari sığorta üzrə şikayət indeksi",
#          "Complaint index on compulsory MTPL insurance"),
#         ("Tədbirlər", "Events"),
#         ("Təkliflər", "Proposals"),
#         ("Ərazi idarələrinə müraciət", "Appeal to Regional Offices"),
#         ("Tətbiq edilmiş nəzarət tədbirləri", "Supervisory actions imposed"),
#         ("Kapital bazarı", "Capital market"),
#         ("Ödəniş xidmətləri", "Payment services"),
#         ("Rəqəmsal fırıldaqçılıq statistikası", "Digital Fraud Statistics"),
#     ]),
#     ("Maliyyə sektorunun inkişaf Strategiyası", "Financial Sector Development Strategy", [
#         ("2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası icra statusu",
#          "Financial Sector Development Strategy 2024-2026 Progress Report 2024"),
#     ]),
#     ("Maliyyə savadlılığı", "Financial Literacy", [
#         ("Ümumi məlumat", "General information"),
#         ("Seminarlar/vebinarlar", "Seminars and webinars"),
#         ("Müsabiqələr", "Competitions"),
#         ("Maliyyə Savadlılığı portalı", "Financial Literacy Portal"),
#         ("Virtual Təhsil Platforması", "Virtual Education Platform"),
#         ("Maliyyə məhsul və xidmətlərinin məlumat-axtarış sistemi",
#          "Information and Search System for Financial Products and Services"),
#     ]),
#     ("Dayanıqlı Maliyyə", "Sustainable Finance", [
#         ("Dayanıqlı Maliyyə üzrə Yol Xəritəsi", "Sustainable Finance Roadmap"),
#         ("Dayanıqlı maliyyə taksonomiyalarının qarşılıqlı əlaqəliliyi və müqayisəliliyinin inkişafına dair Yol Xəritəsi",
#          "Roadmap for Advancing Interoperability and Comparability of Sustainable Finance Taxonomies"),
#         ("Dayanıqlı maliyyə üzrə hesabatlar", "Reports on sustainable finance"),
#         ("Dayanıqlı maliyyə üzrə sənədlər", "Sustainable Finance Documents"),
#         ("Xəbərlər", "News"),
#         ("Bilmək faydalıdır", "Useful to know"),
#     ]),
#     ("Beynəlxalq əməkdaşlıq", "International Cooperation", [
#         ("Beynəlxalq təşkilatlarla əməkdaşlıq", "Cooperation with international organizations"),
#         ("Mərkəzi banklarla əməkdaşlıq", "Cooperation with central banks"),
#         ("Beynəlxalq tədbirlər", "International events"),
#         ("AMB tərəfindən təqdim edilən texniki yardımlar", "Technical assistance by the CBA"),
#     ]),
#     ("İnsan resursları", "Human Resources", [
#         ("Vakansiyalar", "Vacancies"),
#         ("İşə müraciət edənlər üçün məlumat", "Information for job applicants"),
#         ("Niyə bizə qoşulmalı?", "Why join us?"),
#         ("MALİYYƏÇİSƏN təcrübə proqramı", "MALIYYECHISEN internship program"),
#     ]),
#     ("Məlumatların yayımlanması qrafiki", "Information Disclosure Schedule", []),
#     ("Sual − cavab", "Questions and Answers", []),
#     ("İstinadlar", "References", []),
#     ("FinCERT", "FinCERT", []),
#     ("Naxçıvan Muxtar Respublikası İdarəsi", "Nakhchivan AR Office", []),
# ]
#
#
# def call(api, path, token=None, payload=None):
#     req = urllib.request.Request(
#         api + path,
#         data=json.dumps(payload).encode() if payload is not None else None,
#         headers={"Content-Type": "application/json",
#                  **({"Authorization": f"Bearer {token}"} if token else {})},
#         method="POST" if payload is not None else "GET",
#     )
#     with urllib.request.urlopen(req) as r:
#         return json.loads(r.read())
#
#
# def existing_lookup(api, token):
#     """(parent_id or None, az title) → page id, from the current tree."""
#     lookup = {}
#
#     def walk(nodes, parent):
#         for n in nodes:
#             lookup[(parent, n["title"])] = n["id"]
#             walk(n.get("children") or [], n["id"])
#
#     walk(call(api, "/api/v1/pages/tree?locale=az", token), None)
#     return lookup
#
#
# def main():
#     ap = argparse.ArgumentParser()
#     ap.add_argument("--api", default="http://localhost:5253")
#     ap.add_argument("--username", default="admin")
#     ap.add_argument("--password", default="ChangeMe123!")
#     args = ap.parse_args()
#
#     token = call(args.api, "/api/v1/auth/login",
#                  payload={"username": args.username, "password": args.password})["accessToken"]
#     lookup = existing_lookup(args.api, token)
#     created = skipped = 0
#
#     def ensure(az, en, parent_id, sort_order):
#         nonlocal created, skipped
#         key = (parent_id, az)
#         if key in lookup:
#             skipped += 1
#             return lookup[key]
#         page = call(args.api, "/api/v1/pages", token, {
#             "parentId": parent_id,
#             "sortOrder": sort_order,
#             "status": "published",
#             "showInFooter": False,
#             "translations": {"az": {"title": az, "content": None},
#                              "en": {"title": en, "content": None}},
#         })
#         lookup[key] = page["id"]
#         created += 1
#         return page["id"]
#
#     for i, (az, en, children) in enumerate(TREE, start=1):
#         section_id = ensure(az, en, None, i)
#         for j, (caz, cen) in enumerate(children, start=1):
#             ensure(caz, cen, section_id, j)
#
#     print(f"done: created={created} skipped={skipped}")
#
#
# if __name__ == "__main__":
#     main()
