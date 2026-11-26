# Admin panel kontraktı — `web-cbar-admin-new` (spec 057)

## Yer

- Sol menyu dəyişmir: "Ana səhifə → Ana səhifə blokları" (`/homepage-blocks`).
- `HOMEPAGE_SECTION_TABS` (`features/homepage/model/section.ts`): "Nəşrlər"-dən sonra **"Strategiya və sənədlər"** tabı,
  `/homepage-blocks/strategy-docs`.
- Hub (`pages/homepage-blocks/index.tsx` `HUB_CARDS`): eyni adlı kart, ikon kitin `DocumentIcon`-u (`references/icons.md`-də var).
- Route-lar: `/homepage-blocks/strategy-docs`, `/new`, `/$id` (`createCrudRoutes`). Crumb `HOMEPAGE_CRUMBS`-dır.

## Siyahı (`CrudListPage`)

| Sütun | Mənbə |
|---|---|
| Sıra | `sortOrder` |
| Başlıq | `title` |
| Keçid | `pageTitle`, yoxdursa `urls`-un ilk dəyəri. `linkBroken` olanda "Keçid işləmir" nişanı (`Badge`, xəbərdarlıq rəngi) |
| Dillər | `LocaleBadges` (`entities/content/ui`) |
| Status | mühərrikin status nişanı |

- Başlıq altı təsvir (`descriptionKey`): «Saytda ilk üç dərc olunmuş sənəd göstərilir. Birincisi böyük kartdır.»
- Başlıqda "Yeni" və **"Sıranı dəyiş"** (`features/crud/components/reorder-dialog.tsx`, dialoq başlığı "Sənədlərin sırası"). Sürükləmə və
  yuxarı/aşağı düymələri var, hər hərəkət dərhal `PUT /homepage-strategy-docs/order` ilə saxlanır. Xətada siyahı serverin sırasına qayıdır, xəta
  mesajı göstərilir (mövcud dialoq davranışı).
- Filtrlər: axtarış (başlıq) və status.

## Forma (`CrudFormPage`)

Ümumi sahələr:

| Sahə | Tip | Qeyd |
|---|---|---|
| Status | select (`Dərc olunub` / `Qaralama`) | defolt `Dərc olunub` |
| Səhifə | searchable select (kit `Combobox`), `nullable` | seçimlər səhifə ağacından, `pages/homepage-blocks` route-unda `LookupGate` ilə. Kömək mətni: «Kart bu səhifəyə aparır. Ünvan yazılan dildə ünvan üstündür.» |

Dil tabları (`az` / `en`):

| Sahə | Tip | Qeyd |
|---|---|---|
| Başlıq | text, 300 | ən azı bir dildə məcburi |
| Qısa mətn | textarea, 500 | kömək mətni: «Yalnız kiçik kartlarda görünür.» |
| Üz qabığı | media, `mediaAccept: 'image'` | kömək mətni: «Böyük kart 424×240, kiçik kart 200×236. Bu dildə yoxdursa digər dilin üz qabığı göstərilir.» |
| Ünvan | text, 1000 | `isAllowedLink`. Kömək mətni: «Boş qalsa, seçilmiş səhifənin bu dildəki ünvanı işlədilir.» |

Forma qaydaları:

- Klient yoxlaması (`superRefine`) API-nin qaydalarının güzgüsüdür (data-model "Validasiya"). Server xətası `translations.<dil>.<sahə>` həmin tabın
  sahəsinə, `pageId` səhifə sahəsinə düşür.
- Yadda saxlanılmamış dəyişikliklə çıxanda panel soruşur (`useBlocker`, mövcud mühərrik davranışı).
- Başlıqsız dil saxlanılmır. Tabda başqa sahə doludursa, forma göndərilmir və başlıq sahəsinin altında xəta görünür: «Bu dildə mətn yazılıbsa,
  başlıq da yazılmalıdır.» Bu, FinCERT üzvlüklərinin qaydasıdır. Səssiz itki yoxdur, implementasiyada xəbərdarlıq əvəzinə seçilib.
- Boş mətn sahəsi payload-da `''` kimi gedir (CRUD mühərrikinin qaydası), API onu `null` saxlayır.

## i18n

`locales/{az,en}/homepage.json`: `tabs.strategyDocs`, `hub.strategyDocs.{title,description}`, `strategyDocs.{title,entity,description,reorderTitle}`,
`fields.{page,pageHelp,summary,summaryHelp,cover,coverHelp,url,urlHelp}`, `columns.link`, `badges.linkBroken`, `errors.*`. Mövcud açarlar
təkrarlanmır (`fields.title`, `fields.url` artıq var). Bu, tasks mərhələsində fayla baxılaraq dəqiqləşir. `check:i18n` az/en bərabərliyini
yoxlayır.

## MSW

Mövcud `shared/testing/handlers/homepage.ts`-ə (digər ana səhifə blokları kimi `createCrudStore`) əlavə olunur:
- `/homepage-strategy-docs` store-u;
- `PUT …/order` (permutasiya yoxlaması);
- server yoxlamalarının eyni mesajları və `errors` açarları;
- soft delete.

Səhifə seçimləri mövcud `handlers/pages.ts` ağacından gəlir.

## Route

`createCrudRoutes(authLayoutRoute, registerModule(strategyDocsModuleBase), { list, form })`. `list` və `form` `pages/homepage-blocks/strategy-docs.tsx`-in
`StrategyDocsPage` / `StrategyDocsFormPage` komponentləridir (`lazyRouteComponent`, `pages/events` nümunəsi): səhifə ağacını `LookupGate` ilə
yükləyir və seçimləri modula ötürür.
