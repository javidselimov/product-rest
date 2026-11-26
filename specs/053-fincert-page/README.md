# Spec 053 — FinCERT: təhvil qeydi

## Harada qaldım (2026-11-19)

- [x] Bütün tapşırıqlar (T001–T069) icra olunub, `tasks.md`-də `[X]`.
- [x] İki API: `dotnet build` keçir, PGlite üzərində endpoint yoxlamaları yaşıldır, route-diff fərqsizdir.
- [x] İki frontend: `npm run verify` keçir, testlər Node 22-də də yaşıldır.
- [ ] Commit edilməyib (istəklə edilir). Hər komponent ayrıca MR-dır, deploy sırası: `api-cbar-admin` → `api-cbar` → `web-cbar-admin-new` →
  `web-cbar-new`. Workspace sənədləri və `specs/` ayrıca commit.

## Redaktorun etməli olduğu işlər (deploy-dan sonra)

- [ ] **FIRST loqosunu yükləmək:** **FinCERT → Beynəlxalq üzvlüklər → FIRST → Loqo**. Seed loqosuz yazır, kart loqosuz da düzgün görünür.
- [ ] **en FIRST mətnini yoxlamaq:** ad, təsvir və nişan qaralamadır.
- [ ] **RFC-2350 sənədlərini yükləmək:** köhnə PDF-lər test mühitinin media kitabxanasında yoxdur. Seed köhnə `uploads.cbar.az` linklərini
  `rfc_url`-ə yazır, ona görə kart hələ köhnə sayta aparır. Sənəd yüklənib **FinCERT → Ümumi → RFC-2350 faylı**-nda seçiləndə fayl linki əvəz edir.

## Açıq qalanlar

- **Üzvlük nişanının fonu:** hazırda `#F5F5F5` (`site-surface-muted`) istifadə olunur. Kontraktda isə yazılıb ki, summary-də görünən fill yoxdur.
  Ölçmə vaxtı Figma bridge plugini qoşulu deyildi, `figma_node` ilə dəqiqləşdirilməlidir (`widgets/fincert/fincert-memberships.tsx`).
- **FIRST-in az adı:** Figma mətnidir ("Forum **for** Incident Response…"), təşkilatın rəsmi adı isə "Forum **of** …"-dur (en seed belədir).
  Lazım olsa redaktor dəyişir.
- **`npm run roundtrip`** (canlı admin API + real "Haqqımızda"/"Pul siyasəti" səhifələri) lokal mühitdə işlədilməyib, çünki Docker yoxdur. Redaktora
  extension əlavə olunmayıb. Yeni fikstür `fincert-direction.html` `roundtrip.test.ts`-də keçir.
- **`page-893` id-si** köhnə saytın qaydasından (`page-<id>/<slug>`) və `seed_sections.py`-dən götürülüb, canlı bazada yoxlanmayıb.
- FinCERT **sayt axtarışında yoxdur**, FAQ kimi. Ayrıca iş tələb edir.

## Plandan qəsdən sapmalar

| Yer | Plan | Edilən | Səbəb |
|---|---|---|---|
| Admin API: loqo və RFC faylı | `{ id, url }` | IFI-dəki `AssetRef` (`{ mediaId, originalName, mimeType, sizeBytes }`) | panel önizləməsi `mediaId`-dən qurulur; `contracts/admin-api.md` yeniləndi, OpenAPI təsdiqlənib |
| Sayt API sorğusu | keşsiz | `cachedJson` (10 s), FAQ kimi | layihənin bütün CMS sorğuları kimi; redaktə ən geci 10 s-də görünür |
| Ankerin `scroll-margin` | header hündürlüyü sabiti | `scroll-mt-6` | saytın header-i yapışqan deyil; digər ankerli bloklar kimi |
| Soft-delete filtri | controller-də | `HasQueryFilter` (`CbarDbContext`) | FAQ/IFI nümunəsi ilə eyni |
| Ümumi forma | dörd kart | "Əlaqə", "Hesabat portalı", dil tablı "Mətnlər və sənəd" | bir dil tabı bütün dilə bağlı sahələri saxlayır (missiya, portal mətni, RFC) |
| Media seçicisi | "yalnız şəkil/sənəd" | yeni ümumi `FieldConfig.mediaAccept` | seçicidə növ süzgəci yox idi; API-də dəyişiklik yoxdur |
| `isBlankHtml` | — | `features/faq/lib` → `shared/lib` | iki feature (FAQ, FinCERT); feature-lər arası import FSD-ni pozardı |

## Yoxlama nəticələri (2026-11-19)

| Yoxlama | Nəticə |
|---|---|
| SC-002: seed-dən sonra `GET /api/v1/fincert` köhnə mətnlə | az/en 4 istiqamət, `li` sayları 3/0/3/0, e-poçt, telefon, portal, RFC linkləri — itən bənd 0 |
| `0037` təkrar işlədilmə / sətir silinəndən sonra / boş baza | heç nə yaranmır / heç nə yaranmır / xəta yoxdur |
| `cbar_web_ro` ilə `INSERT` | `permission denied` |
| Admin API (quickstart §3 + əlavə hallar) | 25/25 |
| web-cbar-new `verify` | 163 fayl, 1586 test, build |
| web-cbar-admin-new `verify` | 68 fayl, 665 test, build |
| SSR (JS-siz) `/az/fincert`, `/en/fincert` | 6 bölmə, ankerlər, 4 bağlı `<details>`, linklər |
| `page-893/fincert`, `/en/page-893/…`, `?language=en` | 308 → `/az/fincert`, `/en/fincert`, `/en/fincert` |
| `GET /fincert` 500 | səhifə 133-ün CMS mətni |
| Figma ölçüləri 1728 / 744 / 390 (Edge CDP) | kontraktla eyni; əlaqə kartı 92 px (Figma 90, 1 px border, ±2 daxilində); üfüqi sürüşmə 0 |

Köməkçi skriptlər və loqlar `.tmp-053/`-dədir (commit olunmur).
