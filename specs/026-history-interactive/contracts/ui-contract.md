# UI kontraktı: Tarix timeline-ı (spec 026)

Mənbələr: Figma `1845:118772` / `tarix/Timeline` `1845:119481` (**F**, bridge ilə ölçülüb; tipoqrafiya 2026-10-22 `figma_text` ilə təsdiqlənib, research R12) və
`tarix.html` prototipinin CSS-i (**P**). **P** dəyərləri Figma-dan çıxarılıb. İmplementasiya
başlamazdan əvvəl tasks-dakı ölçmə addımı onları **F** ilə təsdiqləyir və bu cədvəli yeniləyir.
Rəng token-ləri: [research R11](../research.md#r11--rənglər-və-token-lər).

## 1. Breakpoint uyğunluğu

Sayt breakpoint-ləri (`globals.css`): mobil < 744 (`tab`) < 1360 (`desk`). Prototipin
breakpoint-ləri onlara belə köçürülür:

| Sayt | Prototip qaydası | Kart |
|---|---|---|
| `desk` ≥ 1360 | ≥ 1280 | sətir: mətn (512) + halqalar (360×360) |
| `tab` 744–1359 | 600–1023 (+ 1024–1279) | sütun, halqalar gizli |
| mobil < 744 | ≤ 599 | sütun, kiçik tipoqrafiya, ox üfüqi sürüşür |

## 2. Struktur və ölçülər

### Konteyner (`tarix/Timeline`)

| | desk | tab | mobil | Mənbə |
|---|---|---|---|---|
| Hero → timeline aralığı | 40 | 48 | 32 | F (desk) / P |
| Kart → ox → düymələr aralığı | 36 | 32 | 24 | F / P |
| En | 984 (məzmun sütunu) | 100% | 100% | F |

### Kart (`Card`)

| Element | desk | tab | mobil | Mənbə |
|---|---|---|---|---|
| Fon | gradient soldan sağa brand-700 → brand-500 | ← | ← | F |
| Padding | 40 / 32 / 40 / 40 | 32 | 24 / 20 | F / P |
| Radius | 4 | ← | ← | F |
| İstiqamət, aralıq | sətir, 40 | sütun, 20 | sütun, 20 | F / P |
| Ghost il | 220/700, ağ 6%, sağ −10, alt −30, `aria-hidden` | 200, sağ −8 | 140 | P |
| Mətn sütunu | `flex: 0 1 512`, gap 16 | tam en | tam en | P |
| İl | 72/700 ağ | 64 | 48 | P |
| Halqalar (SVG) | 360×360, 6 konsentrik dairə, teal, `aria-hidden` | gizli | gizli | P |
| Keçid animasiyası | `opacity` 0 → 1, 400 ms. `prefers-reduced-motion`-da yoxdur | ← | ← | P |

### Hadisə (kart içində)

| Element | Dəyər | Mənbə |
|---|---|---|
| Hadisələr arası aralıq | 20 | P |
| Rail (bir ildə ≥ 2 hadisə) | 12 en. Nöqtə 12×12 teal (top 4, qutuda top 20, mobil qutuda 16). Xətt 2 en teal 35%, nöqtədən növbəti hadisəyə. Sonuncuda xətt yoxdur | P |
| Rail ilə gövdə arası aralıq | 16 | P |
| Gün-ay | 14/500 teal | P |
| Başlıq | 16/600 ağ (`h3`) | P |
| Mətn | 14/400 lh28, ağ 80% | P |
| Qutu (`boxed: true`) | fon ağ 5%, haşiyə 1 teal 60%, r4, p16 (mobil p12) | P |

### Foto

| Düzülüş | Şəbəkə | Mənbə |
|---|---|---|
| ümumi | gap 8, hər şəkil r4, `object-fit: cover`, fon brand-700, qutuda pt 6 | P |
| `single` | 1 sütun, 450:361 | P |
| `note` | `75fr 429fr`, hər ikisi hündürlük nisbəti 184 | P |
| `hero2` | 2 sütun. Birinci tam en 478:313, qalanları 235:160 | P |
| `tall` | `191fr 279fr` × 2 sıra, ümumi 478:376. Birinci iki sıra hündürlüyündə | P |

Hər şəkil `<a href="{src}">` içindədir (JS-siz tam ölçüdə açılır). JS ilə klik lightbox açır,
kursor `zoom-in`-dir.

### İl oxu (`Axis`)

| Element | Dəyər | Mənbə |
|---|---|---|
| Hündürlük | 76 | F |
| Kənar boşluq `p` | 24 (mobil 20) | P |
| Trek | top 20, 4 hündür, r2, neutral-200 | P |
| İrəliləmə | trek üzərində, brand-500, en `(100% − 2p) · index/(N−1)`, `width` keçidi 350 ms | P |
| Nöqtə | 12×12, ağ, haşiyə 2 neutral-200, top 16 | P |
| Keçilmiş nöqtə | fon və haşiyə brand-500 | P |
| Aktiv nöqtə | 24×24, teal, haşiyə 4 ağ, top 10 | P |
| Etiket | top 42, mərkəzdə. 12/400 lh16 ls .25 neutral-500. Aktiv: 14/600 brand-500 | P |
| Klik sahəsi | 36×64, nöqtənin mərkəzində | P |
| Aralıq | indeksə görə bərabər (research R10). Minimal en `(N−1)·56 + 2p`. Ondan dar olanda ox üfüqi sürüşür, scrollbar gizlidir, aktiv nöqtə ortaya gətirilir | P / R10 |

### Düymələr (`Controls`)

| Element | Dəyər | Mənbə |
|---|---|---|
| Sıra | sağa hizalı, gap 12, hündürlük 44 | F |
| "Əvvəlki" | ağ fon, haşiyə 1 neutral-200, ikon brand-500 | P |
| "Növbəti" | fon brand-500, ikon ağ | P |
| Ölçü | 44×44 dairəvi, ikon 20. P-dəki 22×44 toxunma hədəfi minimumundan kiçikdir (research R12) | qərar |
| Deaktiv | `disabled`, kursor default, görünüş azaldılmış | P |
| JS-siz | gizli (`@media (scripting: none)`) | R5 |

### Lightbox

Kit `Dialog` (research R8). Fon `brand-950` 90%, şəkil `max-width: min(1100px, 100%)`,
`max-height: 86vh`, `object-fit: contain`, r4. Bağlama düyməsi kitin `DialogClose`-udur. Başlıq
(`DialogTitle`, vizual gizli) şəklin `alt` mətnidir.

## 3. Əlçatanlıq

| Element | Rol / atribut |
|---|---|
| Timeline kökü | `<section aria-roledescription="carousel">` yox. Adi `section` + `aria-labelledby` (səhifə `h1`-i) |
| Kart məzmunu | `aria-live="polite"`, istifadəçinin ilk öz keçidinə qədər `off` (R9) |
| Gizli panellər | `hidden` deyil, CSS ilə gizlidir. `scripting: enabled`-da `display: none`, yəni köməkçi texnologiyadan da gizli |
| İl oxu | `<nav aria-label="İllər">` → `<ol>` → `<a href="#year-yyyy">yyyy</a>`. Aktiv: `aria-current="step"` |
| Düymələr | `<button aria-label="Əvvəlki il">` / `"Növbəti il"`, sərhəddə `disabled` |
| Şəkil linki | `aria-label="Şəkli böyüt: {alt}"` (alt boşdursa "Şəkli böyüt") |
| Fokus | Bütün interaktiv elementlərdə görünən fokus halqası (kitin `focus-visible`) |

## 4. Tərcümə açarları (`locales/{az,en}/about.json` → `history`)

| Açar | az | en |
|---|---|---|
| `yearNav` (var) | İllər | Years |
| `prev` | Əvvəlki il | Previous year |
| `next` | Növbəti il | Next year |
| `zoom` | Şəkli böyüt | Enlarge photo |
| `zoomWithAlt` | Şəkli böyüt: {{alt}} | Enlarge photo: {{alt}} |

## 5. Çap

`@media print`: bütün panellər görünür, sırası ilə. Ox, düymələr, ghost il və halqalar
gizlidir. Kart fonu ağdır, mətn tünd rəngdədir (mürəkkəb qənaəti, 024-ün çap qaydası ilə eyni
yanaşma).
