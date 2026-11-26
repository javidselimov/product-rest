# Vizual fərqlər və manual yoxlama — spec 026

**Tarix**: 2026-10-22 | **Figma**: `1845:118772` / `tarix/Timeline` `1845:119481` | **Prototip**: `tarix.html`

## Qəbul edilmiş fərqlər

| # | Element | Figma / prototip | Sayt | Səbəb |
|---|---|---|---|---|
| D1 | Əvvəlki/növbəti düymə | prototip 22×44 | 44×44 dairəvi, kit `Button` `icon-lg` | Toxunma hədəfi minimumu (WCAG 2.5.8), kit control-u (W III.1). Figma həndəsəsi ölçülə bilmədi (research R12) |
| D2 | Ox treki, düymə haşiyəsi | `#DBDEE3` | kit `neutral-200` (rəngsiz) | Kitdə mavi çalarlı boz yoxdur (research R11, D-2) |
| D3 | Ox etiketi | `#8C9199` | `muted-foreground` (`neutral-500`) | eyni |
| D4 | Lightbox fonu | `rgba(0,20,35,.9)` | kit `Dialog` overlay-i | Kit control-u, fokus tələsi kitdən gəlir (research R8) |
| D5 | Hero → timeline aralığı | prototip: planşet 48, desktop 40 | eyni (`tab:mt-3 desk:mt-1`, 024 blok aralığı 36-nın üstünə) | 024-dən fərqlidir. FR-003 hero-nun özünü dəyişmir, yalnız aralığı |
| D6 | Hadisə tarixi | Figma "7 mart 1919" | `{gün-ay} {il}`. Gün-ay boşdursa sətir yoxdur | Model il və gün-ayı ayrı saxlayır (024) |

## Avtomatik yoxlanılıb (2026-10-22)

| Yoxlama | Nəticə |
|---|---|
| `npm run verify` (lint, typecheck, 912 test, build) | ✅ |
| Node 22: `about-content`, `about-blocks`, `views` (159 test) | ✅ |
| Build CSS: `@media (scripting: enabled)` gizlətməsi, `scripting: none` düymə gizlətməsi, `print:block!`, `@keyframes history-fade` | ✅ |
| `/az/tarix-copy` server HTML-i (test API): 16 panel, yalnız 1 aktiv, 16 ox lövbəri, mənbədəki 23 `<h3>`-ün hamısı HTML-də, 1998 `hero2` | ✅ (US6-2, SC-001 qismən) |
| `/az/tarix`, `/az/history-copy`, `/en/history`, `/en/history-copy-2` timeline almır | ✅ (FR-022a) |

## Manual yoxlanılmalı (brauzer lazımdır)

Bu sessiyada brauzer aləti yox idi. Aşağıdakılar quickstart §2–§4 üzrə əl ilə edilməlidir:

- [ ] JS söndürülmüş brauzerdə bütün illər alt-alta, düymələr yoxdur (quickstart §2 #11)
- [ ] Çap önizləməsi (#13)
- [ ] 1728 / 1024 / 744 / 390 enlərində Figma ilə ±2 px, üfüqi sürüşmə yoxdur (SC-003, SC-004)
- [ ] Ardıcıl 5 "Növbəti" klikində düymə yerindən tərpənmir (FR-007a)
- [ ] Swipe (mobil emulyator), avtomatik keçid, reduced-motion (#6–#8, #14)
- [ ] Lighthouse Accessibility, 024 ilə müqayisə (SC-005)
- [ ] İl keçidi < 300 ms, LCP fərqi < 100 ms (SC-006)
- [ ] Admin roundtrip `[foto: …]` işarəsi ilə (T033) — test admin giriş məlumatı lazımdır
