#!/usr/bin/env python3
"""Seed the Market actors section with the real cbar.az content (az/en).

Consumes the structural dumps captured from the live site (one markdown file
per page+locale with the body as clean HTML, see --dumps), then via the admin
API (see seed_lib.py):

  1. ensures the full Market actors subtree exists — pages are matched by
     (parent, az title) like seed_pages.py, so re-runs never duplicate;
  2. uploads every referenced register/guideline file to the media library
     (the API dedups identical bytes by checksum, so re-runs are free);
  3. rewrites the dump HTML into editor-compatible HTML — accordion markup the
     TipTap Details extension emits, tables, /media/{id} links — and saves it
     on each page translation;
  4. attaches files that the body never links inline as page assets, so they
     render in the Documents section.

Run while the admin API is up:

    python3 scripts/seed_market_actors.py \
        [--api http://localhost:5253] \
        [--dumps /Users/binturong/Documents/projects/cbar/.scratch/market-actors]
"""
import argparse
from pathlib import Path

from seed_lib import Api, run_seed

# (az title, en title, dump page id or None, [children])
# az titles of the section and its existing 7 children must match seed_pages.py
# so the tree is extended in place rather than duplicated.
CHILDREN = [
    ("Kredit təşkilatları", "Credit institutions", None, [
        ("Banklar", "Banks", 195, []),
        ("Bank olmayan kredit təşkilatları", "Non-Bank Credit Institutions", 196, []),
        ("Kredit ittifaqları", "Credit Unions", 197, []),
        ("Bankların ödəniş agentləri", "Bank payment agents", 883, []),
    ]),
    ("Kapital bazarı", "Capital market", None, [
        ("Emitentlər", "Issuers", None, [
            ("Qiymətli kağızların dövlət qeydiyyatı ilə bağlı təlimat",
             "Guidelines on state registration of securities", 729, []),
            ("Səhmdarların ümumi yığıncağının məsafədən (onlayn) keçirilməsinə dair təlimat",
             "Guideline on conducting general meeting of shareholders remotely (online)", 730, []),
            ("Emitentlər tərəfindən məlumatların açıqlanmasına dair Təlimat",
             "Guidelines on disclosure of information by issuers", 881, []),
        ]),
        ("Fond birjası", "Stock Exchange", 198, []),
        ("Mərkəzi depozitar", "National Depository Center", 199, []),
        ("İnvestisiya şirkətləri", "Investment companies", 200, []),
        ("İnvestisiya xidmətlərini (əməliyyatlarını) həyata keçirən banklar",
         "Banks providing investment services and operations", 879, []),
        ("Klirinq təşkilatı", "Clearing House", 206, []),
        ("İnvestisiya fondları və onların idarəçiləri",
         "Investment funds and their managers", 201, []),
        ("İxtisas şəhadətnamələri", "Specialization certificates", 876, []),
        ("Emissiya prospekti və informasiya memorandumlarına dair şablon formalar",
         "Prospectus and information memorandum templates", 884, []),
        ("Kapital bazarında lisenziyalaşdırma proseslərinə dair təlimatlar",
         "Guidelines on licensing procedures in the capital market", 885, []),
        ("Dövlət qeydiyyatına alınmış investisiya qiymətli kağızları",
         "State registered investment securities", 886, []),
    ]),
    ("Sığorta", "Insurance", None, [
        ("Sığortaçılar və təkrarsığortaçılar", "Insurers and reinsurers", 202, []),
        ("Sığorta vasitəçiləri", "Insurance Intermediaries", 203, []),
        ("Xarici sığorta brokerləri", "Foreign insurance brokers", 204, []),
        ("Sığorta sahəsində yardımçı hüquqi şəxslər və müstəqil ekspertlər",
         "Loss adjusters", 207, []),
        ("Aktuarilər", "Actuaries", 458, []),
        ("Attestasiya", "Attestation", 205, []),
    ]),
    ("Ödənişlər", "Payments", None, [
        ("Elektron pul təşkilatları", "Electronic money institutions", 853, []),
        ("Ödəniş təşkilatları", "Payment institutions", 854, []),
        ("Ödəniş sistemi operatorları", "Payment system operators", 855, []),
        ("Ödəniş agentləri", "Payment agents", 856, []),
    ]),
    ("Poçt rabitəsinin milli operatoru", "National postal operator", 194, []),
    ("Valyuta mübadiləsi məntəqələri", "Currency exchange offices", 464, []),
    ("Müsahibə Komissiyası tərəfindən baxılmış müraciətlərə dair statistika",
     "Statistics on Applications Considered by the Interview Commission", 894, []),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:5253")
    ap.add_argument("--username", default="admin")
    ap.add_argument("--password", default="ChangeMe123!")
    ap.add_argument("--dumps",
                    default="/Users/binturong/Documents/projects/cbar/.scratch/market-actors")
    args = ap.parse_args()

    api = Api(args.api, args.username, args.password)
    run_seed(api, Path(args.dumps), "Bazar iştirakçıları", CHILDREN)


if __name__ == "__main__":
    main()
