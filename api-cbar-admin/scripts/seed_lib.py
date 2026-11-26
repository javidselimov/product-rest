"""Shared machinery for seeding cbar.az sections into the CMS via the admin API.

Section seed scripts (seed_market_actors.py, seed_legal_framework.py, …) define
a TREE of (az title, en title, dump page id or None, [children]) plus a dumps
directory, and call run_seed(). See seed_market_actors.py for the dump format.
"""
import json
import mimetypes
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

from bs4 import BeautifulSoup

SIZE_SUFFIX = re.compile(r"\s*\(\s*\d+(?:[.,]\d+)?\s*(?:B|KB|MB|GB|bayt)\s*\)\s*$", re.I)
TEXT_ALIGN = re.compile(r"text-align:\s*(left|right|center|justify)", re.I)


class Api:
    def __init__(self, base, username, password):
        self.base = base
        token = self.call("/api/v1/auth/login",
                          payload={"username": username, "password": password})["accessToken"]
        self.headers = {"Authorization": f"Bearer {token}"}

    def call(self, path, payload=None, method=None):
        req = urllib.request.Request(
            self.base + path,
            data=json.dumps(payload).encode() if payload is not None else None,
            headers={"Content-Type": "application/json", **getattr(self, "headers", {})},
            method=method or ("POST" if payload is not None else "GET"),
        )
        with urllib.request.urlopen(req) as r:
            body = r.read()
            return json.loads(body) if body else None

    def upload(self, path: Path, filename: str):
        boundary = uuid.uuid4().hex
        mime = mimetypes.guess_type(filename)[0] or "application/octet-stream"
        head = (f"--{boundary}\r\n"
                f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
                f"Content-Type: {mime}\r\n\r\n").encode()
        body = head + path.read_bytes() + f"\r\n--{boundary}--\r\n".encode()
        req = urllib.request.Request(
            self.base + "/api/v1/media", data=body,
            headers={"Content-Type": f"multipart/form-data; boundary={boundary}",
                     **self.headers},
            method="POST",
        )
        with urllib.request.urlopen(req) as r:
            return json.loads(r.read())


# Frontmatter markers the gatherer agents used for pages that exist only in
# one language on the live site (the other locale 302-redirects to the
# homepage). Pages where the live site genuinely renders an "Azerbaijani
# only" notice keep their real title and are NOT stubs.
STUB_PATTERNS = re.compile(
    r'^title:\s*""'
    r"|^servedLang:\s*az"
    r"|^status:\s*(?:not-available|unavailable)",
    re.I | re.M,
)


def load_dump(dumps: Path, page_id: int, lang: str):
    """Returns (body soup, downloads {anchor_id: (url, label)}) or None."""
    f = dumps / "pages" / f"{page_id}-{lang}.md"
    if not f.exists():
        return None
    text = f.read_text()
    frontmatter = re.match(r"\A---\n.*?\n---\n", text, flags=re.S)
    if frontmatter and STUB_PATTERNS.search(frontmatter.group(0)):
        return None   # locale doesn't exist on the live site
    text = re.sub(r"\A---\n.*?\n---\n", "", text, flags=re.S)     # frontmatter
    text = re.sub(r"^# .*$", "", text, count=1, flags=re.M)       # H1 (page title)
    text = re.sub(r"\n## Components used.*\Z", "", text, flags=re.S)
    # Agent annotations are not page content: "## Notes" sections, the
    # "## Content" section heading itself, blockquote/NOTE remarks, comments.
    text = re.sub(r"\n## Notes\n.*?(?=\n## |\Z)", "", text, flags=re.S)
    text = re.sub(r"^## Content\s*$", "", text, flags=re.M)
    text = re.sub(r"^> .*$", "", text, flags=re.M)
    text = re.sub(r"^NOTE:.*$", "", text, flags=re.M)
    text = re.sub(r"<!--.*?-->", "", text, flags=re.S)
    text = re.sub(r'<span class="unresolved-asset">.*?</span>', "", text, flags=re.S)
    soup = BeautifulSoup(text, "lxml")
    body = soup.body or soup

    downloads = {}
    for section in body.select("section.file-downloads"):
        for a in section.find_all("a", href=True):
            label = SIZE_SUFFIX.sub("", a.get_text(" ", strip=True))
            downloads[a.get("id") or a["href"]] = (a["href"], label)
        section.decompose()
    return body, downloads


def to_editor_html(body, downloads, media_id_for):
    """Rewrite a dump body into the HTML the TipTap editor round-trips."""
    used = set()

    # The page renderer prints the title itself; drop any H1 the dump carried.
    for h1 in body.find_all("h1"):
        h1.decompose()

    # Inline placeholder links (#asset-N) -> media links.
    for a in body.find_all("a", href=True):
        href = a["href"]
        if href.startswith("#asset-"):
            key = href.lstrip("#")
            if key not in downloads:
                a.decompose()
                continue
            url, label = downloads[key]
            used.add(key)
            text = SIZE_SUFFIX.sub("", a.get_text(" ", strip=True))
            if not text or text.startswith("#asset-"):
                text = label
            mid = media_id_for(url)
            if mid is None:
                a["href"] = url   # source link is dead on cbar.az; keep it as-is
            else:
                a["href"] = f"/media/{mid}"
                a["data-media-link"] = ""
            if not a.find("img"):
                a.string = text
        elif "uploads.cbar.az" in href:
            mid = media_id_for(href)
            text = SIZE_SUFFIX.sub("", a.get_text(" ", strip=True))
            if not text or text.startswith("#asset-"):
                # Already-resolved inline link that kept its placeholder text:
                # fall back to the manifest label, then the filename.
                label_by_url = {u: l for u, l in downloads.values()}
                text = (label_by_url.get(href)
                        or urllib.parse.unquote(href.rsplit("/", 1)[-1]))
            if mid is not None:
                a["href"] = f"/media/{mid}"
                a["data-media-link"] = ""
            if not a.find("img"):   # keep image-wrapped links (lightbox style)
                a.string = text

    # Accordions: the editor's Details extension persists
    # <details data-accordion><summary>…</summary><div data-type="details-content">…</div></details>
    for details in body.find_all("details"):
        details.attrs = {"data-accordion": ""}
        summary = details.find("summary")
        if summary is not None:
            summary.extract()
        content = BeautifulSoup("", "lxml").new_tag("div")
        content["data-type"] = "details-content"
        for child in list(details.children):
            content.append(child.extract())
        if summary is not None:
            details.append(summary)
        details.append(content)

    # Inline images: registry/history photos, campaign banners. Rewrite
    # uploads.cbar.az sources to media-library ids like file links.
    for img in body.find_all("img", src=True):
        src = img["src"]
        if "uploads.cbar.az" in src:
            mid = media_id_for(src)
            if mid is not None:
                img["src"] = f"/media/{mid}"

    # Video embeds: wrap youtube iframes the way the editor's Youtube
    # extension persists them so they survive an admin edit round-trip.
    for iframe in body.find_all("iframe", src=True):
        if "youtube" not in iframe["src"]:
            iframe.decompose()
            continue
        if not (iframe.parent and iframe.parent.get("data-youtube-video") is not None):
            wrapper = BeautifulSoup("", "lxml").new_tag("div")
            wrapper["data-youtube-video"] = ""
            iframe.wrap(wrapper)

    # Drop presentation attributes so stored HTML matches editor output.
    for tag in body.find_all(True):
        if tag.name == "a":
            tag.attrs = {k: v for k, v in tag.attrs.items()
                         if k in ("href", "data-media-link")}
        elif tag.name == "img":
            tag.attrs = {k: v for k, v in tag.attrs.items() if k in ("src", "alt")}
        elif tag.name == "iframe":
            tag.attrs = {k: v for k, v in tag.attrs.items()
                         if k in ("src", "width", "height", "allowfullscreen")}
        elif tag.name == "div" and tag.get("data-youtube-video") is not None:
            tag.attrs = {"data-youtube-video": ""}
        elif tag.name == "details":
            pass
        elif tag.name == "div" and tag.get("data-type") == "details-content":
            tag.attrs = {"data-type": "details-content"}
        elif tag.name in ("p", "h2", "h3", "h4"):
            m = TEXT_ALIGN.search(tag.get("style") or "")
            tag.attrs = {"style": f"text-align: {m.group(1).lower()}"} if m else {}
        else:
            tag.attrs = {}

    html = "".join(str(c) for c in body.children)
    html = re.sub(r"<p>(\s|&nbsp;|<br\s*/?>)*</p>", "", html)
    unused = [downloads[k] for k in downloads if k not in used]
    return html.strip() or None, unused


def make_media_resolver(api, dumps: Path):
    """url -> media id (uploading on first use), or None for dead source links."""
    file_map = {}
    map_file = dumps / "file-map.txt"
    if map_file.exists():
        for line in map_file.read_text().splitlines():
            url, _, path = line.partition("|")
            if path:
                file_map[url] = Path(path if path.startswith("/") else dumps / path)

    media_ids = {}

    def media_id_for(url):
        if url in media_ids:
            return media_ids[url]
        local = file_map.get(url)
        if local is None or not local.exists() or local.stat().st_size == 0:
            print(f"  ! no local copy (dead link on cbar.az?), keeping external url: {url}",
                  file=sys.stderr)
            media_ids[url] = None
            return None
        # '#' in source URLs is part of the filename (legacy CMS quirk like
        # "Regulations#24.pdf"), not a fragment — only strip the query string.
        filename = re.sub(r"\?.*$", "", url).rsplit("/", 1)[-1]
        filename = urllib.parse.unquote(filename).strip() or local.name
        if "." not in filename.rsplit("/", 1)[-1]:
            # extension-less name: sniff the content so the API accepts it
            magic = local.read_bytes()[:8]
            if magic.startswith(b"%PDF"):
                filename += ".pdf"
        try:
            asset = api.upload(local, filename)
        except urllib.error.HTTPError as e:
            detail = e.read().decode(errors="replace")[:200]
            print(f"  ! upload rejected ({e.code}) for {filename!r}: {detail} — keeping external url",
                  file=sys.stderr)
            media_ids[url] = None
            return None
        media_ids[url] = asset["id"]
        return asset["id"]

    return media_id_for, media_ids


def run_seed(api, dumps: Path, root_az_title: str, children, root_dump=None):
    """Ensure the subtree under the existing root page and seed dump content.

    Pages are matched by (parent_id, az title); existing pages get their
    content replaced, missing ones are created as published. Files the body
    never links inline are attached as page assets. root_dump seeds content
    onto the (existing) section root page itself. Idempotent.
    """
    media_id_for, media_ids = make_media_resolver(api, dumps)

    lookup = {}

    def walk_existing(nodes, parent):
        for n in nodes:
            lookup[(parent, n["title"])] = n["id"]
            walk_existing(n.get("children") or [], n["id"])

    walk_existing(api.call("/api/v1/pages/tree?locale=az"), None)

    counts = {"created": 0, "updated": 0, "attached": 0}

    def build_content(dump_id):
        """dump id -> ({locale: html}, pending assets, set of locales that exist).

        A locale absent from the returned set has no page on the live site
        (stub dump); its translation must be omitted entirely so the page is
        hidden in that locale, matching live behavior.
        """
        content = {"az": None, "en": None}
        pending_assets = {}
        present = set()
        for lang in ("az", "en"):
            dump = load_dump(dumps, dump_id, lang)
            if dump is None:
                print(f"  ! no {lang} variant for dump {dump_id} (stub or missing)",
                      file=sys.stderr)
                continue
            present.add(lang)
            body, downloads = dump
            html, unused = to_editor_html(body, downloads, media_id_for)
            content[lang] = html
            for url, label in unused:
                pending_assets.setdefault(url, {})[lang] = label
        if not present:
            present = {"az", "en"}   # nothing to go on; keep both translations
        return content, pending_assets, present

    def put_content(page_id, az, en, content, present):
        page = api.call(f"/api/v1/pages/{page_id}")
        tr = page["translations"]
        translations = {}
        if "az" in present:
            translations["az"] = {"title": tr.get("az", {}).get("title") or az,
                                  "content": content["az"]}
        if "en" in present:
            translations["en"] = {"title": tr.get("en", {}).get("title") or en,
                                  "content": content["en"]}
        api.call(f"/api/v1/pages/{page_id}", method="PUT", payload={
            "parentId": page["parentId"],
            "sortOrder": page["sortOrder"],
            "status": page["status"],
            "showInFooter": page["showInFooter"],
            "translations": translations,
        })
        counts["updated"] += 1

    def attach_assets(page_id, pending_assets):
        if not pending_assets:
            return
        existing = {a["mediaId"]
                    for a in (api.call(f"/api/v1/pages/{page_id}").get("assets") or [])}
        for url, titles in pending_assets.items():
            mid = media_id_for(url)
            if mid is None or mid in existing:
                continue
            existing.add(mid)   # distinct URLs can dedup to the same bytes
            title_az = titles.get("az") or titles.get("en")
            title_en = titles.get("en") or titles.get("az")
            try:
                api.call(f"/api/v1/pages/{page_id}/assets", payload={
                    "mediaId": mid,
                    "translations": {"az": {"title": title_az},
                                     "en": {"title": title_en}},
                    "groupLabel": None,
                })
                counts["attached"] += 1
            except urllib.error.HTTPError as e:
                if e.code != 409:   # already attached -> fine on re-runs
                    raise

    def seed(node, parent_id, sort_order):
        az, en, dump_id, kids = node

        content = {"az": None, "en": None}
        pending_assets = {}
        present = {"az", "en"}
        if dump_id is not None:
            content, pending_assets, present = build_content(dump_id)

        key = (parent_id, az)
        if key in lookup:
            page_id = lookup[key]
            if dump_id is not None:
                put_content(page_id, az, en, content, present)
        else:
            translations = {}
            if "az" in present:
                translations["az"] = {"title": az, "content": content["az"]}
            if "en" in present:
                translations["en"] = {"title": en, "content": content["en"]}
            page = api.call("/api/v1/pages", payload={
                "parentId": parent_id,
                "sortOrder": sort_order,
                "status": "published",
                "showInFooter": False,
                "translations": translations,
            })
            page_id = lookup[key] = page["id"]
            counts["created"] += 1

        attach_assets(page_id, pending_assets)

        for i, child in enumerate(kids, start=1):
            seed(child, page_id, i)
        return page_id

    section_key = (None, root_az_title)
    if section_key not in lookup:
        raise SystemExit(f"{root_az_title!r} root page not found — run seed_pages.py first.")
    section_id = lookup[section_key]

    if root_dump is not None:
        content, pending, present = build_content(root_dump)
        put_content(section_id, root_az_title, root_az_title, content, present)
        attach_assets(section_id, pending)

    for i, child in enumerate(children, start=1):
        seed(child, section_id, i)

    print(f"done: created={counts['created']} updated={counts['updated']} "
          f"assets-attached={counts['attached']} media-uploaded={len(media_ids)}")
