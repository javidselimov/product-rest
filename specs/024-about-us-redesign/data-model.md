# Data model: "Haqqımızda" bölməsi

Backend dəyişmir. Burada **view model**-lər var: loader-lərin mövcud API cavablarından və
CMS HTML-indən qurduğu, view-lara prop kimi gedən serializable tiplər. Hamısı
`product-rest/web-cbar-new/src` daxilindədir.

## 1. Mənbələr (dəyişmir)

| Mənbə | Sxem | Bu feature-da istifadəsi |
|---|---|---|
| `GET /api/v1/pages/tree?locale=` | `entities/page-node` `PageNode` (`id, title, slug, navUrl, children`) | menyu, breadcrumb, layout seçimi, divisions CMS səhifəsinin slug-ı |
| `GET /api/v1/pages/{slug}?locale=` | `features/pages` (`id, title, slug, content, assets`) | About CMS səhifələri, "Struktur bölmələr" sxemi və faylları |
| `GET /api/v1/organization/staff?type=` / `…/staff/{id}` | `features/organization` `StaffMember` | İdarə Heyəti, Rəhbərlik, bio |
| `GET /api/v1/organization/divisions` | `Division` (`id, name, description`) | siyahı və şöbə səhifəsi |
| `GET /api/v1/organization/offices` | `Office` | Ərazi idarələr |

## 2. Ümumi şablon

```ts
// widgets/about-shell/model.ts
type Crumb = { label: string; href: string | null }   // son element href=null
type AboutNavItem = {
  key: string; title: string; href: string; external: boolean
  current: boolean; open: boolean; children: AboutNavItem[]   // dərinlik ≤ 2
}
type ShareLinks = { pageUrl: string; title: string }    // mütləq ünvan, loader-də headers()-dən
type AboutShellData = { locale: Locale; crumbs: Crumb[]; nav: AboutNavItem[]; share: ShareLinks }
```

**Qaydalar**: `nav` "Haqqımızda" kökünün (`ABOUT_SECTION_TITLES` ilə tapılır, mövcud məntiq)
uşaqlarından qurulur. `open = true` aktiv zəncirdəki qovşaqlar üçün. `crumbs[0]` həmişə
"Ana səhifə" → `/{locale}`. Ağac sorğusu uğursuz olsa `nav = []`, `crumbs` = [Ana səhifə,
səhifə başlığı] (şablon sınmır).

## 3. CMS səhifə layout-ları (`features/about-content/model/types.ts`)

```ts
type AboutLayoutKind = 'about-main' | 'history' | 'mission' | 'plain'

/** Strukturlu və adi blokların sıralı qarışığı — CMS sırası qorunur. */
type AboutBlock =
  | { kind: 'html'; html: string }                                   // adi məzmun (fallback daxil)
  | { kind: 'date-cards'; cards: { date: string; html: string }[] }  // 1–6
  | { kind: 'highlight'; title: string | null; html: string }
  | { kind: 'accordion-group'; html: string }                         // ardıcıl <details>, ilki open
  | { kind: 'history-hero'; html: string }                          // başlığın daxili HTML-i (`<em>` vurğusu)
  | { kind: 'timeline'; events: TimelineEvent[]; years: YearLink[] }
  | { kind: 'mission'; html: string }                               // `blockquote` daxili HTML
  | { kind: 'values'; items: ValueItem[] }

type TimelineEvent =
  | { kind: 'event'; anchorId: string | null; year: string; dayMonth: string; highlighted: boolean
      title: string | null; html: string; images: { src: string; alt: string }[]; card: boolean }
  | { kind: 'loose'; html: string }                                  // ili tapılmayan sətir
type YearLink = { year: string; anchorId: string }                   // `year-1919`, unikal
type ValueItem = { title: string; icon: { src: string; alt: string } | null; html: string }

type AboutPageViewData = {
  shell: AboutShellData
  title: string
  layout: AboutLayoutKind
  blocks: AboutBlock[]
  attachments: AttachmentFile[]          // mövcud entity
  childPages: { key: string; title: string; href: string }[]   // mövcud davranış: boş səhifədə
}
```

**Validasiya** (kontrakt [cms-markup.md](./contracts/cms-markup.md)):

- `date-cards.cards.length` 1–6, `date` boş deyil. Pozulsa → `html` bloku (bütün cədvəl).
- `TimelineEvent.year` `/\b[12]\d{3}\b/`-ə uyğun ilk ədəd. `anchorId` yalnız həmin ilin ilk
  hadisəsində doludur. `card = images.length > 0 || highlighted`.
- `images[].src` yalnız `/media/…` və ya `https:` ilə başlayır, əks halda şəkil atılmır (Maddə X.1).
- `layout = 'plain'` olanda `blocks = [{ kind: 'html', html }]` (bu günkü davranış).
- Parser `null` qaytarsa (balanssız HTML) layout `plain`-ə düşür.

## 4. Təşkilat

```ts
type StaffCardData = { id: number; href: string; fullName: string | null
                       position: string | null; photoUrl: string | null }   // mövcud
type BoardData = { chair: StaffCardData | null; deputies: StaffCardData[] }  // ilk = sədr
type DivisionListItem = { id: number; name: string | null; href: string }
type DivisionsIntro = { html: string; attachments: AttachmentFile[] } | null // CMS "Struktur bölmələr"

type OrganizationViewData = {
  shell: AboutShellData
  section: OrganizationSection          // mövcud enum
  error: boolean
  board: BoardData                      // section=board
  staff: StaffCardData[]                // section=management
  divisionsIntro: DivisionsIntro        // section=divisions
  divisions: DivisionListItem[]
  offices: OfficeData[]                 // mövcud
}

type StaffMemberViewData = {            // mövcud + shell
  shell: AboutShellData
  fullName: string | null; position: string | null
  receptionDays: string | null; phone: string | null; tel: string | null
  photoUrl: string | null; bioHtml: string
}

type DivisionViewData = { shell: AboutShellData; name: string; html: string }
```

**Qaydalar**: `board.chair` sıralamada birinci üzvdür (`type=1`), bir üzv olanda `deputies = []`
və "Sədr müavinləri" bölməsi render olunmur. `DivisionsIntro` CMS səhifəsinin `content` boş və
`assets` boş olanda `null`-dur. Şöbə `href` = `/{locale}/organization/divisions/{id}`.

## 5. Vəziyyətlər

| Səhifə | loading | empty | error |
|---|---|---|---|
| CMS About səhifəsi | route `loading.tsx` (mövcud) | `childPages` kartları (mövcud) | `notFound()` səhifə yoxdursa |
| Təşkilat bölməsi | mövcud | `EmptyState` (mövcud açar) | `ErrorState kind="server"`, şablon qalır |
| Şöbə səhifəsi | mövcud | — | siyahı xətası → `ErrorState`; id yoxdur → `notFound()` |
