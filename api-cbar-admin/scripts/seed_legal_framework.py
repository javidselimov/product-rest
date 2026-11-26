#!/usr/bin/env python3
"""Seed the Legal framework (Hüquqi aktlar) section with the real cbar.az content (az/en).

Same pipeline as seed_market_actors.py: consumes structural dumps captured from
the live site, ensures the subtree, uploads referenced documents to the media
library and saves editor-compatible HTML on each page translation. Idempotent.

    python3 scripts/seed_legal_framework.py \
        [--api http://localhost:5253] \
        [--dumps /Users/binturong/Documents/projects/cbar/.scratch/legal-framework]
"""
import argparse
from pathlib import Path

from seed_lib import Api, run_seed

# (az title, en title, dump page id or None, [children])
# az titles of the section and its existing 9 children must match seed_pages.py
# so the tree is extended in place rather than duplicated.
CHILDREN = [
    ("Mərkəzi Bankın hüquqi əsasları", "Legal framework of the Central Bank", 847, []),
    ("Kredit təşkilatları", "Credit Institutions", None, [
        ("Qanunlar", "Laws", 214, []),
        ("Azərbaycan Respublikası Prezidentinin aktları",
         "Decrees of the President of the Republic of Azerbaijan", 215, []),
        ("Nazirlər Kabinetinin aktları",
         "Decrees of the Cabinet of Ministers of the Republic of Azerbaijan", 216, []),
        ("Qaydalar", "Regulations", 217, []),
    ]),
    ("Ödənişlər", "Payments", None, [
        ("Qanun", "Laws", 830, []),
        ("Qaydalar", "Regulations", 831, []),
    ]),
    ("Kapital bazarı", "Capital Market", None, [
        ("Qanunlar", "Laws", 220, []),
        ("Azərbaycan Respublikası Prezidentinin aktları",
         "Decrees of the President of the Republic of Azerbaijan", 221, []),
        ("Nazirlər Kabinetinin aktları",
         "Decrees of the Cabinet of Ministers of the Republic of Azerbaijan", 222, []),
        ("Qaydalar", "Regulations", 223, []),
    ]),
    ("Sığorta", "Insurance", None, [
        ("Qanunlar", "Laws", 225, []),
        ("Azərbaycan Respublikası Prezidentinin aktları",
         "Decrees of the President of the Republic of Azerbaijan", 226, []),
        ("Nazirlər Kabinetinin aktları",
         "Decrees of the Cabinet of Ministers of the Republic of Azerbaijan", 227, []),
        ("Qaydalar", "Regulations", 228, []),
    ]),
    ("Valyuta tənzimi", "Currency regulation", None, [
        ("Qanunlar", "Laws", 460, []),
        ("Qaydalar", "Regulations", 461, []),
    ]),
    ("Statistika", "Statistics", 462, []),
    ("Metodoloji sənədlər", "Methodological documents", 848, []),
    ("Digər", "Other", 212, [
        ("Məcəllələr və digər qanunlar", "Codes and Other Laws", 231, []),
        ("Azərbaycan Respublikası Prezidentinin aktları",
         "Decrees of the President of the Republic of Azerbaijan", 232, []),
        ("Nazirlər Kabinetinin aktları",
         "Decrees of the Cabinet of Ministers of the Republic of Azerbaijan", 233, []),
        ("Qaydalar", "Regulations", 234, []),
    ]),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--api", default="http://localhost:5253")
    ap.add_argument("--username", default="admin")
    ap.add_argument("--password", default="ChangeMe123!")
    ap.add_argument("--dumps",
                    default="/Users/binturong/Documents/projects/cbar/.scratch/legal-framework")
    args = ap.parse_args()

    api = Api(args.api, args.username, args.password)
    run_seed(api, Path(args.dumps), "Hüquqi aktlar", CHILDREN)


if __name__ == "__main__":
    main()
