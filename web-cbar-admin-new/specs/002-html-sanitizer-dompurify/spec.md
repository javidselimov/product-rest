# Spec 002 — HTML sanitizasiyası üçün DOMPurify

**Status:** qəbul edilib · **Tarix:** 2026-10-30 · **Konstitusiya:** Maddə II, X.1, X.4

## Kontekst

Redaktorun önizləmə dialoqu (`features/rich-text/ui/preview-dialog.tsx`) redaktə
olunan HTML-i, o cümlədən HTML mənbə rejimində əl ilə yazılmış məzmunu DOM-a
yerləşdirir. Sanitizasiya indiyədək öz yazdığımız `shared/lib/sanitize-html.ts`
ilə aparılırdı. Bu həll iki problem yaradırdı:

1. Snyk Code həmin axını **DOM XSS** kimi göstərirdi, çünki öz yazdığımız
   sanitizer-i təmizləyici kimi tanımır.
2. Blacklist yanaşması (məlum təhlükəli teq və atributların silinməsi)
   allowlist-dən zəifdir. Bundan əlavə, sanitizasiya olunmuş HTML yenidən sətrə
   çevrilib `innerHTML` ilə təkrar parse olunurdu və bu, mutation XSS riski yaradır.

## Qərar

- Yeni runtime dependency: **`dompurify` (^3)**. Paket öz tiplərini daxil edir,
  əlavə `@types` paketi lazım deyil.
- DOMPurify konfiqi tək yerdədir: `shared/lib/sanitize-html.ts#SANITIZE_CONFIG`.
  Sanitizasiya adətən həmin modulun funksiyaları ilə aparılır. İstisna redaktorun
  önizləməyə ötürdüyü HTML-dir (`rich-text-editor.tsx`): orada
  `DOMPurify.sanitize(html, SANITIZE_CONFIG)` birbaşa çağırılır, çünki Snyk Code
  yalnız kitabxana çağırışının özünü sanitizer kimi tanıyır, bizim wrapper-ləri yox.
- Konfiqurasiya:
  - `ADD_TAGS: ['iframe']` — legacy Google Maps və YouTube embed-ləri qorunur;
  - `FORBID_ATTR: ['srcdoc']`, `FORBID_TAGS: ['style']`;
  - `ADD_ATTR: allowfullscreen, frameborder, loading, target`.
- Önizləmə `sanitizeHtmlToFragment` (`RETURN_DOM_FRAGMENT`) ilə qurulur.
  Node-lar konteynerə birbaşa əlavə olunur, `dangerouslySetInnerHTML` və
  `innerHTML` kimi HTML sink-ləri istifadə edilmir.

## Kənarlaşma

**D1** — Maddə X.1-in istisnası: redaktor önizləməsində istifadəçinin HTML-i DOM-a
yerləşdirilir. Bu, yalnız DOMPurify ilə sanitizasiyadan sonra və HTML sətri
olmadan, DOM fragment vasitəsilə mümkündür.

## Yoxlama

- `src/shared/lib/sanitize-html.test.ts`: script, `on*` atributları, `javascript:`,
  `vbscript:` və `data:` sxemləri, `srcdoc`, eləcə də legacy markup-ın dəyişməz
  qalması yoxlanılır.
- `src/features/rich-text/ui/rich-text-editor.test.tsx`: mənbə rejimində yazılmış
  zərərli HTML önizləmə dialoqunda təmizlənmiş şəkildə görünür.
- `npm audit`: critical və ya high tapıntı yoxdur (Maddə X.4).
