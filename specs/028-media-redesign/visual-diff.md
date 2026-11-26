# Vizual müqayisə — 028 "Media" giriş səhifəsi (SC-001)

Ölçmə: headless Edge + CDP (`getBoundingClientRect` / `getComputedStyle`), istifadəçinin
`local:testcbar` dev serveri (:3002, test API), 2026-11-02. Figma: "cbar website (Copy)" → Media →
`1045:17244`, `1658:12660`, `1658:13179`. Tolerans ±2px. Headless pəncərədə şaquli sürüşmə zolağı
var, ona görə x koordinatları Figma-dan 7px soldadır (1320 konteyner 1713-də mərkəzlənir) — en və
aralıqlar dəyişmir.

## Uyğun gələn ölçülər

| En | Element | Figma | Sayt |
|---|---|---|---|
| 1728 | Alətlər sırası | y 188, 1320×100 | y 188, 1320×100 |
| 1728 | Paylaşma düymələri | sağda, 5 ədəd, r6, gap10 | 1297,220 · 220×36, r6 |
| 1728 | Sol menyu | w 312, p20, r4, `#F5F5F5` | 197,288 · w 312, p20, r4, `bg-site-surface-muted` |
| 1728 | Menyu linki | 16/600 lh28 | 16/600 lh28 |
| 1728 | H1 | 32/600 lh44, menyu ilə eyni y | 533,288 · 984×44, 32/600/44 |
| 1728 | Məzmun | w 984, menyudan 24 sonra, H1-dən 36 sonra, 16/400 lh28 | 533,368 · w 984 (197+312+24=533 ✓; 288+44+36=368 ✓), 16/400/28 |
| 744 | Kənar boşluq / alətlər / menyu | 40 / alt-alta / 664 tam en | 40 / 664×86 alt-alta / 664 |
| 390 | Kənar boşluq / menyu / H1 / mətn | 24 / 342 / 22/600 lh28 / 14/400 | 24 / 342 / 22/600/28 / 14/400/24 |
| hamısı | Üfüqi sürüşmə | yoxdur | `scrollWidth === innerWidth` (1728, 744, 390) |
| hamısı | H1 sayı | 1 | 1 |

About reqressiyası (`/az/haqqimizda`, 1728): alətlər 197,188 1320×100; menyu 312; H1 533,288
32/600/44; məzmun 533,368 w984 — 024 `visual-diff.md` ilə eyni (x fərqi yalnız sürüşmə zolağıdır).

## Struktur yoxlaması (SSR HTML, dev server)

- `/az/media`: `section-shell`, `section-nav`, `page-tools` var; H1 "Media"; `<title>` "Media | CBAR";
  giriş mətni ("Mərkəzi Bankın kommunikasiyası…") render olunur; köhnə `#galleries/#videos`
  lövbərləri yoxdur; menyu 10 bənd (9 + "Media (Kopya)"), heç biri aktiv deyil.
- `/az/media/galleries`: şablon, 10 kart (`/az/media/galleries/{id}`), H1 "Fotoqalereyalar" (ağacda
  bənd hələ `/media#galleries` — redaktor işi, FR-012).
- `/az/korporativ-sosial-mesuliyyet`: şablon, menyuda "Korporativ sosial məsuliyyət" `aria-current`.
- Yönləndirmələr: `/media` → 307 `/az/media`; `/media/galleries` → 307; `/gallery/photos` → 308
  `/az/media/galleries`; `/gallery/photos/detail/5?language=en` → 308 `/en/media/galleries/5`;
  `/videos` → 308 `/az/media/videos`. `/media/{id}` yönləndirilmir (fayl proxy-sinə düşür).

## Fərqlər və qərarlar

| En | Element | Figma | Sayt | Qərar |
|---|---|---|---|---|
| hamısı | H1 rəngi | `#333333` | `text-foreground` `#222222` (024 şablonu) | Qəbul (spec Clarifications, 2026-11-02) — şablon bölmələr arasında eyni qalır |
| hamısı | Paylaşma düyməsi | 40×40 (`IconButton` instansı) | 36×36 (024: kit `IconButton sm`) | Qəbul (024 qərarı) |
| 744 | Alətlər sırası hündürlüyü | 138 (py24 + gap10, 2 sətir) | 86 (py0; konteynerin öz boşluğu) | Qəbul — 024 tablet qaydası ilə eyni, ölçü fərqi yalnız şaquli boşluqdur |
| hamısı | Menyu adları | Xəbərlər, Qalereya, Media sorğuları, … | CMS-dəki adlar (Press-relizlər, Fotoqalereya, İnformasiya sorğusu, …) + "Media (Kopya)" | Redaktor işi (spec "Redaktor tapşırıqları", `docs/media-cms-guide.md`), kod dəyişmir |
| hamısı | "Tədbirlər" bəndi | düz bənd | caret + aktiv zəncirdə açılan 6 uşaq | Qəbul — ağacda uşaqları var; Tədbirlər spec-i həll edər |
| hamısı | "İnzibati işlərə baxan vəzifəli şəxslər" | yoxdur | var | Maddə I.3 — redaksiya qərarı |
