# figma-bridge MCP — istifadə qaydaları

`tools/figma-bridge/` Figma-nı **canlı** oxumaq üçündür: token yox, REST kvotası
yox, pulsuz planda işləyir. İki qapısı var — Claude üçün MCP tool-ları
(`figma_*`), sənin üçün `cli.mjs`. Texniki quruluş `tools/figma-bridge/README.md`
faylındadır; bu fayl gündəlik istifadə qaydasıdır.

## 1. Bir dəfəlik quraşdırma

1. **Figma desktop** → *Plugins → Development → Import plugin from manifest…*
2. `tools/figma-bridge/plugin/manifest.json` faylını seç.
3. Plugin artıq *Plugins → Development → **CBAR Figma bridge*** altındadır.

MCP serveri repo kökündəki `.mcp.json`-da qeydiyyatdadır. Tool-ların görünməsi
üçün **Claude Code-u bir dəfə yenidən başlat**.

## 2. Hər sessiyada

| Addım | Nə etmək lazımdır |
| --- | --- |
| 1 | Figma-da faylı aç, sonra plugini işə sal |
| 2 | Plugin pəncərəsində **yaşıl nöqtə + "connected"** görünməlidir |
| 3 | Pəncərəni **açıq saxla** — bağlasan körpü qırılır |

Bu qədər. Bridge-i əl ilə başlatmağa ehtiyac yoxdur: **MCP serveri onu öz
prosesində qaldırır**. `bridge.mjs` yalnız Claude Code işləmirsə və sən təkcə
CLI-dan istifadə edirsənsə lazımdır:

```sh
node tools/figma-bridge/bridge.mjs      # açıq qalsın
```

İşləyib-işləmədiyini bir əmrlə yoxla: `figma_health` (və ya
`node tools/figma-bridge/cli.mjs health`). Cavab üç sətirdir — bridge, plugin,
növbə. Nəyisə soruşmazdan əvvəl **plugin: connected** yazısını gör.

## 3. Əmrlər

Hamısı MCP-də `figma_` prefiksi ilə, CLI-da prefiksiz eyni adla işləyir.

### Naviqasiya — əvvəlcə node id-sini tap

| Əmr | Nə verir |
| --- | --- |
| `ping` | hansı fayl, hansı səhifə, nə seçilib |
| `pages` | bütün səhifələr + id-ləri |
| `index --page "Design System"` | səhifənin üst səviyyə node-ları |
| `find "Button" --type COMPONENT_SET --page "*"` | ada və tipə görə axtarış |

`find` sorğusu ya adi substring-dir, ya da `/naxış/i` şəklində regex.
`--page "*"` bütün sənədi gəzir (ilk dəfə bir neçə saniyə çəkir).

### Oxuma

| Əmr | Nə verir |
| --- | --- |
| `node 2446:316 --depth 5` | **REST formatında** node dump-ı |
| `selection --depth 5` | eyni şey, Figma-da hazırda seçili olan üçün |
| `sets --page "Components"` | hər component set + variant oxları |
| `components --page "Icons"` | hər komponent + publish key |
| `variables` | Variables: kolleksiya → mod → dəyər, alias-lar həll olunmuş |
| `styles` | lokal paint/text/effect/grid style-lar |
| `css 2446:316` | Figma-nın node üçün hesabladığı CSS |
| `text 2446:316` | node-un altındakı bütün mətnlər + tipografiya |
| `svg 2163:170` | SVG markup |
| `png 2446:316 --scale 2` | PNG (base64, `-o foo.png` ilə şəkil kimi yazılır) |
| `select 2446:316` | Figma-nı hərəkət etdirir: səhifəni açır, seçir, zoom edir |

### Toplu iş

| Əmr | Nə edir |
| --- | --- |
| `dump --page "Design System"` | `variables.json` + `styles.json` + `index.json` + `sets.json` + hər set üçün `<ad>-set.json` |
| `icons --map tools/figma-cbar/icon-map-all.json --out tools/figma-cbar/svg-all` | hər ikon üçün bir `.svg`, `gen-icons.js`-in gözlədiyi adla |

## 4. Tipik ax(ın)lar

**Bir komponentin ölçülərini öyrənmək:**

```sh
node tools/figma-bridge/cli.mjs find "Alert" --type COMPONENT_SET --page "*"
node tools/figma-bridge/cli.mjs node 2446:316 --depth 5 -o tools/figma-cbar/alert-set.json
node tools/figma-cbar/spec.js alert-set.json 2446:316 Size=md
```

**Tokenləri yeniləmək:**

```sh
node tools/figma-bridge/cli.mjs variables -o tools/figma-bridge/out/variables.json
# sonra template5/.claude/skills/figma-sync ilə tokens.css-i yaz
```

**İkonları yenidən çəkmək:**

Üç addım — bütün 500 node (250 ikon × Outline/Solid):

```sh
# 1. Icons səhifəsinin komponent siyahısı → icon-map-all.json (ad qaydası + düzəlişlər)
node tools/figma-bridge/cli.mjs components --page Icons -o tools/figma-bridge/out/icons-components.json
node tools/figma-cbar/build-icon-map.js

# 2. Hər node üçün bir .svg
node tools/figma-bridge/cli.mjs icons --map tools/figma-cbar/icon-map-all.json --out tools/figma-cbar/svg-all

# 3. template5/src/icons/generated/ — kateqoriya başına bir modul + manifest
node tools/figma-cbar/gen-icons.js
```

Figma-da adı səhv və ya boş qalan node-lar `tools/figma-cbar/icon-names.json`
ilə düzəldilir (açar node id-si). Ad toqquşması olsa `build-icon-map.js` dayanır
— düzəlişi ora yaz, Figma faylına toxunma. `template5/src/icons/icons.tsx` isə
əl ilə saxlanılır: alias-lar + üç Lucide ikonu.

**Hər şeyi bir dəfəyə:** `dump --page "Design System"` — nəticə
`tools/figma-bridge/out/` içindədir (gitignore-lanıb).

## 5. Nəticə hara düşür

- **CLI:** `-o fayl` versən fayla, verməsən ekrana. 200 kB-dan böyükdürsə ekrana
  yazılmır — `-o` istəyir. `svg`/`png` üçün fayl adının uzantısı `.svg`/`.png`
  olsa, JSON yox, şeyin özü yazılır.
- **MCP:** 64 kB-dan kiçik cavab birbaşa qayıdır. Böyükdürsə
  `tools/figma-bridge/out/` içinə yazılır və tool yolu + içindəkilərin qısa
  siyahısını qaytarır — 7 MB-lıq dump-ı konteksti doldurmaq üçün heç bir səbəb
  yoxdur. `out` arqumenti versən həmişə fayla yazılır.
- Yollar əmri **işə saldığın qovluğa** nisbətdir; standart dəyərlər repo kökündən
  işlədiyini fərz edir. Repo-dan kənara yazmaq mümkün deyil.

## 6. Nəsə işləmirsə

| Nə görürsən | Nə deməkdir |
| --- | --- |
| `The Figma plugin is not connected` | plugin pəncərəsi bağlıdır və ya Figma-da başqa fayl açıqdır → plugini yenidən işə sal |
| `No bridge on http://127.0.0.1:7332` | nə Claude Code işləyir, nə də `bridge.mjs` → birini qaldır |
| `… did not answer within 120s` | node çox böyükdür → `--depth` azalt (5 → 3) |
| `Node 2446:316 not found` | id başqa fayldandır → `find`/`index` ilə düzgün id-ni tap |
| `port 7332 is already in use` | artıq bir bridge işləyir — bu problem deyil, mövcud olanı istifadə et |

Diqqət: plugin pəncərəsini bağlasan `health` **45 saniyəyə qədər** hələ də
"connected" göstərə bilər — bu köhnəlmə pəncərəsidir, xəta deyil.

## 7. Sərhədlər

- Plugin yalnız **oxuyur**. Sənədi dəyişən yeganə əmr `select`-dir, o da ancaq
  aktiv səhifəni və seçimi dəyişir.
- Bridge yalnız `127.0.0.1`/`::1`-ə bağlanır — şəbəkədən çıxış yoxdur.
- Cari səhifədən kənara ilk müraciət `loadAllPagesAsync()` ödəyir; böyük
  kitabxanada bir neçə saniyə çəkir, sonrakı əmrlər sürətlidir.
- Vektor həndəsəsi `node` çıxışında yoxdur — onun üçün `svg` var.
- `tools/` heç vaxt npm paketinə düşmür (root `package.json` `files` yalnız
  `index.js` + beş template qovluğunu göndərir).
