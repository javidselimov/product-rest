# Research: Media sorğuları

## R1. Kartlar cədvəldən qurulur

- **Decision**: Hər cədvəl sətri bir kartdır: `Ad | Dəyər | Əlavə mətn`.
- **Rationale**: TipTap `class` və `div` saxlamır, cədvəl isə qorunur. Redaktor sətir əlavə etməyi artıq bilir. Yanaşma spec 024-dəki kimidir.
- **Alternatives**: Ayrıca API sahələri (sxem və admin forması lazımdır, tələb olunmur). Yalnız CSS ilə cədvəli kart göstərmək (ikon və boş əlavə mətn üçün struktur çatmır).

## R2. Layout slug ilə, yalnız Media bölməsində

- **Decision**: `mediaLayoutFor(slug)` ayrıca reyestrdir, loader onu yalnız `media` bölməsində çağırır.
- **Rationale**: Digər Media səhifələrinin cədvəlləri dəyişmir (FR-007). Slug başlıq dəyişəndə dəyişmir (`PagesController`).
- **Alternatives**: `layoutFor`-a əlavə etmək: reyestr About üçündür, `plain` bölmə yoxlaması olmadan qarışar.

## R3. Bir blok, üç hissə

- **Decision**: Blok `{ kind: 'media-requests', introHtml, cards, restHtml }`.
- **Rationale**: `AboutBlocks`-un blok aralığı 32/36-dır, Figma-da mətndən kartlara 16-dır. Bir blok bu aralığı öz içində saxlayır.
- **Alternatives**: Ayrı `contact-cards` bloku + mənfi margin: kövrəkdir.

## R4. Kart sahələri düz mətndir

- **Decision**: Ad, dəyər, əlavə mətn `textOf`-dan keçir. Keçid dəyər xanasındakı ilk `<a>`-dan alınır, yalnız `mailto:`, `tel:`, `https:`.
- **Rationale**: `dangerouslySetInnerHTML` lazım deyil, kartın tipoqrafiyası sabit qalır.
- **Alternatives**: Xanaları `CmsContent` ilə render etmək: `p` margin-ləri kartı pozur.

## R5. İkon

- **Decision**: `mailto:` və ya `@` → `EnvelopeIcon`. `tel:` və ya yalnız rəqəm, boşluq, `+()-` olan mətn → `PhoneIcon`. Qalanı ikonsuz.
- **Rationale**: Redaktor nömrəni keçidsiz yazsa da kart düzgün qalır. Spec FR-005 buna görə genişləndirilib.

## R6. Tipoqrafiya

- **Decision**: `CmsContent` üçün yeni `media-requests` variantı. Abzaslar arası Figma-dakı boş sətir qədərdir (desktop 28, mobil 22).
- **Rationale**: `about` variantında abzas margin-i 16, başlıq 20/600-dür, Figma-da 18/500 brand rəngidir.

## R7. Rəng token-ları

| Figma | Token |
|---|---|
| `#004976` başlıq, dəyər, ikon | `primary` |
| `#222222` mətn | `foreground` |
| `#787878` ad | `muted-foreground` |
| `#333333` əlavə mətn | `site-text-strong` |
| `#D4D4D4` haşiyə | `site-divider` |
| `#F5F5F5` ikon qutusu | `site-surface-muted` |
