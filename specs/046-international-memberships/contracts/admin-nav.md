# Admin nav contract (spec 046)

`web-cbar-admin-new/src/app/routes/nav.ts`. Route-lar, `NavKey`-lər, ikonlar və `findNavItem` dəyişmir — yalnız qruplar.

## Qruplar (sıra = menyu sırası)

| # | `NavGroup` | az | en | Bəndlər (`NavKey`) | Görünüş |
|---|---|---|---|---|---|
| — | (yox) | — | — | `dashboard`, `pages`, `mediaLibrary` | qrupsuz, yuxarıda |
| 1 | `about` | Haqqımızda | About us | `organization`, `csrProjects` | qrup |
| 2 | `marketParticipants` | Bazar iştirakçıları | Market participants | `meas` | tək bənd → başlıqsız |
| 3 | `legalActs` | Hüquqi aktlar | Legal acts | `laws` | tək bənd → başlıqsız |
| 4 | `nationalCurrency` | Milli pul nişanları | National currency | `moneyMarks` | tək bənd → başlıqsız |
| 5 | `statistics` | Statistika | Statistics | `currencyRates`, `azir`, `inflation`, `yieldCurves` | qrup |
| 6 | `media` | Media | Media | `pressReleases`, `events`, `releaseSchedule`, `galleries`, `videos` | qrup |
| 7 | `cooperation` | Beynəlxalq əməkdaşlıq | International cooperation | `ifiOrganizations`, `memorandums` | qrup |
| 8 | `consumer` | İstehlakçı hüquqları | Consumer rights | `monthlyReports` (spec 052) | tək bənd → başlıqsız |
| 9 | `publications` | Nəşrlər və tədqiqatlar | Publications and research | `workingPapers` (spec 054) | tək bənd → başlıqsız |
| 10 | `faq` | Sual-cavab | FAQ | `faq` (spec 051) | tək bənd → başlıqsız |
| 11 | `fincert` | FinCERT | FinCERT | `fincert` (spec 053) | tək bənd → başlıqsız |
| 12 | `homepage` | Ana səhifə | Homepage | `homepageBlocks`, `infoLines`, `liveStreams`, `imagePopups` | qrup |
| 13 | `admin` | İdarəetmə | Administration | `users`, `settings` | qrup |

Silinən qrup açarları: `content`, `finance` (`nav.json` `groups.*` yenilənir, az və en).

## API (modul daxili)

```ts
export const NAV_GROUPS: readonly NavGroup[]                 // yuxarıdakı sıra
export const navItems: NavItem[]                              // mövcud; `group` yeni açarlarla
export function navEntries(): NavEntry[]                      // sidebar və mobil sheet bunu render edir
export const groupOf: (pathname: string) => NavGroup | undefined  // aktiv qrup (findNavItem(pathname)?.group)
```

`navEntries()` qaydası: qrupsuz bəndlər `navItems` sırası ilə əvvəl; sonra `NAV_GROUPS` sırası ilə hər qrup — bəndi 1-dirsə `item`, ≥2-dirsə `group`,
0-dırsa heç nə.

## Davranış

- Qrup başlığı `<button type="button" aria-expanded aria-controls="nav-group-<key>">`; bənd siyahısı `id="nav-group-<key>"`, bağlıda `hidden`.
- Açıq qruplar = `useUiStore.openNavGroups` ∩ mövcud qruplar. Store persist-dir (`nexus-ui`); köhnə saxlanmış state-də sahə yoxdursa `[]`; bilinməyən açarlar atılır.
- Ekrana gələndə (ilk açılış və hər marşrut dəyişikliyi) onun qrupu store-a əlavə olunur, yəni açılır (`useLayoutEffect`, bağlı kadr görünmür); əvvəl açılanlar bağlanmır. Redaktor aktiv qrupu da bağlaya bilər — həmişə məcburi açıq saxlamaq düyməni işləməz göstərərdi (icra zamanı qərar, 2026-11-16).
- Mobil sheet eyni `Sidebar` komponentidir; bənd klikində sheet bağlanır (mövcud `onNavigate`).
- ⌘K palet: `NAV_GROUPS` üzrə `Command.Group`, tək bəndlik qruplar da başlıqla (axtarış nəticəsində kontekst); qrupsuzlar başlıqsız.
- Testlər (`router.test.tsx` + yeni `sidebar.test.tsx`): hər `NavKey` tam bir yerdə; bağlı halda 12 sətir (spec 051-dən sonra 13, spec 052-dən sonra 14, spec 053-dən sonra 15); birbaşa `/memorandums` açılışında "Beynəlxalq əməkdaşlıq" açıq, bənd `aria-current="page"`; klaviatura ilə açma; vəziyyətin yenilənmədən sonra qalması (persist), saxlanmış state-də sahə olmayanda xəta yoxdur.

## Səhifə redaktorunda bölmə kartı (`ManagedSectionCard`)

| az slug (`-copy` kəsilir) | Kart |
|---|---|
| `beynelxalq-teskilatlarla-emekdasliq` | "Təşkilatlar **Beynəlxalq əməkdaşlıq → Maliyyə təşkilatları** bölməsindən gəlir" + link `/ifi-organizations` |
| `merkezi-banklarla-emekdasliq` | "Cədvəl **Beynəlxalq əməkdaşlıq → Memorandumlar** bölməsindən gəlir" + link `/memorandums` |
| `korporativ-sosial-mesuliyyet` | "Layihələr **Haqqımızda → KSM layihələri** bölməsindən gəlir" + link `/csr-projects` |
| `melumatlarin-yayimlanmasi-qrafiki` | "Cədvəl **Media → Yayım qrafiki** bölməsindən gəlir" + link `/release-schedule` |
| `fincert` | "Məzmun **FinCERT → FinCERT** bölməsindən gəlir" + link `/fincert` (spec 053) |
| `sual-cavab` | "Məzmun **Sual-cavab → Sual-cavab** bölməsindən gəlir" + link `/faq` (spec 051). Mövzunun bağlandığı hər səhifədə isə ayrıca "Sual-cavab keçid kartı" mövzuların siyahısını göstərir |
| `bank-xidmetlerinden-istifade-uzre-sikayet-indeksi`, `avto-icbari-sigorta-uzre-sikayet-indeksi`, `infoqrafika` | "İl → ay arxivi **İstehlakçı hüquqları → Aylıq hesabatlar** bölməsindən gəlir. Giriş mətni və metodologiya burada redaktə olunur" + link `/monthly-reports?series=<seriya>` (spec 052) |
| `beynelxalq-teskilatlarda-uzvluk` | Qeyd: "Üzvlüklər bu səhifənin mətnindəki cədvəldir: birinci sütun təşkilat, ikinci il. Sayt ilə görə özü sıralayır." (keçid yox) |

Kart yalnız mövcud səhifədə (redaktə rejimi) və az slug xəritədə olanda göstərilir. Mətnlər `locales/{az,en}/pages.json`.

## Səhifə redaktorunda sol menyunun aktivliyi (spec 053)

Kartı `kind: 'link'` olan səhifənin formunda (`/pages/{id}`) sol menyu "Səhifələr"-i yox, bölmənin bəndini aktiv göstərir (`aria-current="page"`)
və onun qrupunu açır; məsələn FinCERT → "FinCERT", 122 → "Memorandumlar" ("Beynəlxalq əməkdaşlıq" açılır). `kind: 'note'` (554), adi səhifə,
yeni səhifə və səhifə yüklənərkən "Səhifələr" aktivdir. Forma `features/pages/hooks/use-managed-nav.ts` ilə `ui-store.activeNavOverride`-a
bəndin açarını yazır, unmount-da və slug dəyişəndə təmizləyir; sahə persist olunmur. `nav.ts` `activeNavItem(pathname, override)` aktivliyin
tək mənbəyidir, `document.title` və breadcrumb `findNavItem`-də qalır. Desktop sidebar və mobil sheet eyni komponentdir.
