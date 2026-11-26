# figma-bridge — istifadə təlimatı

Figma faylını **canlı** oxumaq üçün lokal körpü: token yoxdur, REST limiti
yoxdur, CBAR hesabındakı Dev seat ilə işləyir. İki yolla istifadə olunur:

- **Claude Code vasitəsilə** — `figma_*` MCP tool-ları (adi dildə soruşursan,
  Claude özü çağırır).
- **Terminaldan** — `node tools/bridge/figma-bridge/cli.mjs <əmr>`.

Hər ikisi eyni əmrləri işlədir; fərq yalnız prefiksdədir (`figma_node` ↔ `node`).

---

## 1. Bir dəfəlik quraşdırma

1. Figma desktop-da faylı aç. CBAR hesabında Design seat yoxdursa, fayl
   **Dev Mode**-da açılır — bu normaldır, plugin orada işləyir.
2. Sol yuxarı Figma menyusu → **Plugins → Development → Import plugin from
   manifest…** → `tools/bridge/figma-bridge/plugin/manifest.json`.
3. MCP server repo kökündəki `.mcp.json`-da qeydiyyatdadır. Tool-ların
   görünməsi üçün Claude Code-u bir dəfə yenidən başlat.

`manifest.json` dəyişsə (məs. `git pull`-dan sonra), plugini **yenidən import
et** — Figma manifesti import zamanı oxuyur.

## 2. Hər sessiyada

| # | Nə et | Nə görməlisən |
| --- | --- | --- |
| 1 | Figma-da lazımi faylı aç | — |
| 2 | Dev Mode: sağ panel → **Plugins → Development → CBAR Figma bridge** (adın özünə kliklə) | Panel açılır |
| 3 | Gözlə | **connected** (bir neçə saniyə "connecting" yaza bilər) |
| 4 | Paneli **açıq saxla** | Inspect tabına keçmək və ya başqa plugin açmaq onu bağlayır |

Claude-dan **"figma health yoxla"** istə və ya:

```sh
node tools/bridge/figma-bridge/cli.mjs health
```

Cavabda `plugin: connected · <fayl> · <səhifə>` görünməlidir.

Bridge-i (`bridge.mjs`) əl ilə qaldırmağa ehtiyac yoxdur — Claude Code-un MCP
serveri onu özü qaldırır. Yalnız Claude Code bağlıdır və CLI işlədirsənsə:

```sh
node tools/bridge/figma-bridge/bridge.mjs   # açıq qalsın
```

## 3. Tool-lar

### Vəziyyət

| Tool | Parametrlər | Nə verir |
| --- | --- | --- |
| `figma_health` | — | bridge işləyir? plugin qoşulub? növbədə nə var? Figma-ya toxunmur |
| `figma_ping` | — | açıq fayl, səhifə, seçilmiş node-lar, rejim (`dev`/`figma`) |

### Naviqasiya — əvvəl node id-ni tap

| Tool | Parametrlər | Nə verir |
| --- | --- | --- |
| `figma_pages` | — | bütün səhifələr, id və uşaq sayı |
| `figma_index` | `page` | səhifənin üst səviyyə node-ları (ucuz, ilk addım üçün) |
| `figma_find` | `query` **(məcburi)**, `type`, `page`, `limit` (200) | ada görə axtarış. `query` substring və ya `/regex/i`; `type` məs. `COMPONENT_SET,FRAME,TEXT`; `page: "*"` bütün sənəd |

Node id `2446:316` formasındadır. Dev Mode-da node-u seçib URL-dən də götürə
bilərsən: `?node-id=2446-316` → `2446:316`.

### Oxuma

| Tool | Parametrlər | Nə verir |
| --- | --- | --- |
| `figma_node` | `id` **(məcburi, vergüllə bir neçə)**, `depth` (5) | REST API formatında tam dump: ölçülər, auto-layout, fill, stroke, effektlər, uşaqlar |
| `figma_selection` | `depth` (5) | `figma_node` ilə eyni, Figma-da hazırda seçili olan üçün |
| `figma_css` | `id` | Figma-nın hesabladığı CSS (padding, radius, font, rəng) |
| `figma_text` | `id` | node-un altındakı bütün mətnlər + tipoqrafiya |
| `figma_svg` | `id`, `outlineText` (false) | SVG markup |
| `figma_png` | `id`, `scale` (2) | PNG şəkil |

`depth`: 1 = yalnız node özü, uşaqsız. Böyük frame üçün 2–3 ilə başla.

### Dizayn sistemi

| Tool | Parametrlər | Nə verir |
| --- | --- | --- |
| `figma_variables` | — | Variables: kolleksiya → mod → dəyər, alias-lar həll olunmuş (REST API bunu vermir) |
| `figma_styles` | — | lokal paint / text / effect / grid style-lar |
| `figma_sets` | `page` | hər component set + variant oxları + variant id-ləri |
| `figma_components` | `page` | hər komponent + publish key + aid olduğu set |

### Toplu iş

| Tool | Parametrlər | Nə edir |
| --- | --- | --- |
| `figma_dump` | `page`, `out`, `depth` (5) | `variables.json`, `styles.json`, `index.json` + hər set üçün `<ad>-set.json` |
| `figma_icons` | `map` **və ya** `page` + `match`, `out` | hər ikon üçün ayrıca `.svg` |

### Figma-nı hərəkət etdirmək

| Tool | Parametrlər | Nə edir |
| --- | --- | --- |
| `figma_select` | `id` | node-un səhifəsini açır, seçir, zoom edir. Dev Mode-da hələ yoxlanmayıb |

### `out` parametri

Oxuma tool-larının hamısı `out` qəbul edir — cavab fayla yazılır, söhbətə yox.
`svg`/`png` üçün `.svg`/`.png` uzantılı fayl versən, şeyin özü yazılır.

**`dump` və `icons` üçün `out`-u həmişə açıq ver:**
`tools/bridge/figma-bridge/out/...`. Standart dəyərləri köhnə qovluğa
(`tools/figma-bridge/out`) işarə edir — gitignore-da olmayan yeni qovluq yaradır.
Yazmaq yalnız `tools/` daxilində mümkündür.

## 4. Claude-dan necə istəmək

Node id bilmək lazım deyil — nə istədiyini de, Claude əvvəl axtarıb tapır.

| Sən yazırsan | Claude nə edir |
| --- | --- |
| "Figma-da hansı səhifələr var?" | `figma_pages` |
| "Main page-də header-i tap" | `figma_index` / `figma_find "header"` |
| "Seçdiyim komponentin ölçülərini ver" | `figma_selection` (əvvəl Figma-da seç) |
| "Bu kartın CSS-i nədir?" | `figma_find` → `figma_css` |
| "Statistics blokunun şəklini göstər" | `figma_find` → `figma_png` |
| "Button-un variantlarını sadala" | `figma_sets` |
| "Rəng və spacing tokenlərini çıxar" | `figma_variables`, `figma_styles` |
| "Bu ikonu SVG kimi `src/...`-ə yaz" | `figma_svg` + fayla yazma |
| "Bu bölməni kodla qur" | `figma_node` + `figma_png` + `figma_css`, sonra komponentləri CBAR UI kit-dən yığır |

**Ən sürətli yol:** Figma-da elementi seç və "seçdiyimi oxu" yaz — axtarış
addımı olmur.

## 5. Terminaldan (CLI)

Repo kökündən:

```sh
B=tools/bridge/figma-bridge/cli.mjs

node $B health
node $B pages
node $B index --page "Main page"
node $B find "Button" --type COMPONENT_SET --page "*"
node $B node 2446:316 --depth 3 -o tools/bridge/figma-bridge/out/button.json
node $B selection --depth 3
node $B css 2446:316
node $B text 2446:316
node $B svg 2163:170 -o tools/bridge/figma-bridge/out/icon.svg
node $B png 2446:316 --scale 2 -o tools/bridge/figma-bridge/out/card.png
node $B variables -o tools/bridge/figma-bridge/out/variables.json
node $B dump --page "Main page" --out tools/bridge/figma-bridge/out/dump
```

`-o` verməsən cavab ekrana çıxır; 200 kB-dan böyükdürsə `-o` tələb edir.

## 6. Böyük cavablar

- MCP cavabı **64 kB-dan böyükdürsə**, avtomatik
  `tools/bridge/figma-bridge/out/<əmr>-<id>.json` faylına yazılır, Claude yalnız
  yolu və qısa xülasəni görür.
- `out/` gitignore-dadır — commit olunmur.
- Böyük frame `120s` ərzində cavab vermirsə, `depth`-i azalt (5 → 3 → 2).

## 7. Nəsə işləmirsə

| Görürsən | Səbəb | Həll |
| --- | --- | --- |
| `plugin: NOT connected` | plugin işə salınmayıb və ya panel bağlanıb | Plugins → Development → CBAR Figma bridge |
| `did not answer within 120s. The plugin never took the job` | plugin paneli bağlıdır, amma bridge hələ "connected" göstərir (45 san köhnəlmə) | plugini yenidən işə sal |
| `did not answer within 120s` (iş götürülüb) | node çox böyükdür | `depth` azalt |
| `No bridge on http://127.0.0.1:7332` | Claude Code da, `bridge.mjs` da işləmir | birini qaldır |
| `port 7332 is already in use` | bridge artıq işləyir | problem deyil |
| `Node … not found` | id başqa fayldandır | `figma_find` / `figma_index` ilə düzgün id-ni tap |
| Import: *editorType does not include dev* | köhnə manifest | manifest-də `"editorType": ["figma", "dev"]` olmalıdır, yenidən import et |
| Plugin klikləyəndə açılmır (Dev Mode) | manifest-də `capabilities` yoxdur | `"capabilities": ["inspect"]` olmalıdır, yenidən import et |
| *You must enable two-factor authentication to publish* | təsadüfən **Publish** basılıb | publish lazım deyil — pəncərəni bağla, plugin adına klikləyib işə sal |
| Design mode-da *Request Figma Design…* pəncərəsi | CBAR hesabında Design seat yoxdur | Dev Mode-a qayıt (**Shift+D**), plugini oradan işə sal |

Konsol xətaları üçün: **Plugins → Development → Show/Hide console**.

## 8. Sərhədlər

- Plugin yalnız **oxuyur**. Sənədi dəyişən yeganə əmr `select`-dir — o da
  yalnız aktiv səhifəni və seçimi.
- Yalnız Figma-da **hazırda açıq olan** faylı görür. Başqa faylı oxumaq üçün
  onu aç və plugini orada işə sal.
- Bridge yalnız `127.0.0.1` / `::1`-də dinləyir — şəbəkəyə heç nə çıxmır.
- Vektor həndəsəsi `figma_node` çıxışında yoxdur — onun üçün `figma_svg`.
- Cari səhifədən kənara ilk müraciət bütün səhifələri yükləyir; böyük faylda bir
  neçə saniyə çəkir, sonrakılar sürətlidir.
