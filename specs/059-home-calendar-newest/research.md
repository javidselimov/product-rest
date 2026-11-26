# Research: spec 059

## R1 — "Ən yeni 3" haradan gəlir

- **Decision**: `api-cbar` `GET /api/v1/events`-ə `sort=newest` parametri. Ana səhifə `when`-siz `sort=newest&pageSize=3` göndərir.
- **Rationale**: Bugünkü API-də bütün tədbirlər yalnız artan sıradadır. Azalan sıra yalnız `when=past`-dadır, ona görə gələcək tədbirlər düşür. Sıralama
  bazada olmalıdır ki, `LIMIT 3` düzgün üçlüyü versin.
- **Alternatives considered**:
  - İki sorğu (`upcoming` + `past`) və saytda birləşdirmək: "ən yeni" = ən uzaq gələcək. `upcoming` artan sıradadır, ona görə bütün gələcəkləri
    çəkmək lazım gəlir (`pageSize=500`). Rədd edildi.
  - Artan sıranın son səhifəsini götürmək (`total`-dan `page` hesablamaq): iki ardıcıl sorğu, səhifə sərhədi 3-ə bölünməyəndə iki səhifə. Kövrəkdir.
    Rədd edildi.
  - `created_at` ilə sıralama: istifadəçi "tarixə görə" seçdi (spec Qərar 1).

## R2 — Parametrin adı və dəyərləri

- **Decision**: `sort`, yeganə dəyər `newest`. Verilməyəndə bugünkü sıra. Başqa dəyər 400 (`when` kimi, `BadRequest()`).
- **Rationale**: Sayt artıq `?sort=oldest` adını memorandumlarda işlədir (spec 045, saytın öz parametri). `order=desc` sahəni demir.
  Gələcəkdə `oldest` əlavə etmək mümkündür.
- **Alternatives considered**: `order=desc` (hansı sahə olduğu bilinmir), `newestFirst=true` (bool, genişlənmir).

## R3 — Gün daxilində sıra

- **Decision**: `sort=newest`: `starts_on DESC`, sonra saatı olanlar əvvəl, `start_time DESC`, sonra `title`.
- **Rationale**: Spec FR-002: eyni gündə gec saat daha "yeni"dir. Bugünkü `when=past` sırasına toxunulmur (gün azalan, saat **artan**), çünki
  `/media/events` ondan istifadə edir (SC-004). Ona görə `when=past&sort=newest` gün daxilində `when=past`-dan fərqlənir. Bu, OpenAPI-də yazılır.
- **Alternatives considered**: `when=past` sırasını da dəyişmək: tədbirlər səhifəsinin sırası dəyişərdi, spec-dən kənardır.

## R4 — Kliklənən sətir

- **Decision**: Başlıq `<h3><Link>`-dir və `after:absolute after:inset-0` ilə `li`-ni (`relative`) örtür. Fokus halqası pseudo-elementdədir
  (`focus-visible:after:outline-2 focus-visible:after:outline-ring`, `-outline-offset-2`). Bu, `csr-project-card.tsx`-in nümunəsidir.
- **Rationale**: Bir link, bir fokus nöqtəsi. Ekran oxuyucu linki başlıqla adlandırır, tarix və saat linkdən kənarda ayrıca oxunur. JS lazım deyil.
  `Badge` link deyil, ona görə iç-içə interaktiv element yoxdur.
- **Alternatives considered**:
  - Bütün `li`-ni `<a>` ilə bükmək: linkin adı "15 Oktyabr Mətbuat konfransı … 11:00" olur, `h3` link içində qalır. Rədd edildi.
  - `onClick` ilə `li`: semantik deyil, JS-siz işləmir. Rədd edildi.

## R5 — `href: null`

- **Decision**: `CalendarEvent.href` `string` olur, `null` budağı silinir.
- **Rationale**: `eventHref()` həmişə ünvan qaytarır (CMS səhifəsi və ya `/media/events/<slug>`). Ölü budaq Speculative Generality-dir və
  "kliklənməyən sətir" vəziyyətini yaradır, spec isə bunu istəmir.

## R6 — Başlığın keçidi

- **Decision**: `EventCalendar` `listHref: string` prop-u alır, loader `eventsListHref(locale)` ilə doldurur.
- **Rationale**: Widget `features/events/model/routes`-u import edə bilər (`widgets → features`), amma ünvanı view-dən vermək widget-i saf saxlayır
  və testdə yoxlamağı asanlaşdırır (`StrategyDocs` da ünvanları hazır alır).
