# Data Model: "Tarix" səhifəsinin interaktiv dizaynı

**Spec**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

Backend modeli dəyişmir. Bu sənəd `web-cbar-new`-də CMS HTML-dən çıxarılan **görünüş
modelini** təsvir edir (`features/about-content/model/types.ts`). Mənbə həmişə səhifənin
`content` HTML-idir (`prepareCmsHtml`-dən keçmiş).

## 1. Axın

```text
api-cbar GET /api/v1/pages/{slug}?locale=…   (dəyişmir)
        │ content (HTML)
        ▼
views/cms-page/loader.ts
        │ layoutFor(slug, locale)  ── R2: dilə görə reyestr
        ▼
parseAbout(html, 'history')
        │ parseHistory → timelineEvent[] (024, dəyişmir)
        │             → photoLayout + işarə paraqrafı (R4, YENİ)
        │             → groupByYear (R3, YENİ)
        ▼
AboutBlock[]: history-hero · timeline{ years: HistoryYear[] } · html
        ▼
widgets/about-blocks → HistoryTimeline (server) → HistoryStepper (client island)
```

## 2. Tiplər

### `PhotoLayout` (YENİ)

```text
'single' | 'note' | 'hero2' | 'tall'
```

### `TimelineEvent` (DƏYİŞİR)

`kind: 'event'` variantı:

| Sahə | Tip | Mənbə | 026-da |
|---|---|---|---|
| `year` | `string` (4 rəqəm) | hücrə 1 | dəyişmir |
| `dayMonth` | `string` (boş ola bilər) | hücrə 1 | dəyişmir |
| `highlighted` | `boolean` | hücrə 1-də il `<strong>`-dadır | dəyişmir |
| `title` | `string \| null` | hücrə 2 ilk başlıq-sətir | dəyişmir |
| `html` | `string` | hücrə 2 qalan HTML. **İşarə paraqrafı çıxarılır** | dəyişir |
| `images` | `AboutImage[]` | hücrə 2 şəkil-paraqrafları | dəyişmir |
| `photoLayout` | `PhotoLayout \| null` | işarə (R4), yoxdursa avtomatik qayda. Şəkil yoxdursa `null` | **YENİ** |
| `boxed` | `boolean` | `highlighted` **və ya** (`images.length > 0` **və** `photoLayout !== 'note'`). Hadisənin il kartı içində çərçivəli qutuda olub-olmaması. İlin özünün "kartı" ilə qarışmasın deyə 024-ün `card` adı dəyişdirilir | **adı və qaydası dəyişir** |
| ~~`anchorId`~~ | — | `HistoryYear.anchorId`-ə köçür | **SİLİNİR** |

`AboutImage`-ə `width?: number`, `height?: number` əlavə olunur. Onlar `<img>` atributlarından
oxunur (müsbət tam ədəd deyilsə `undefined`). Yalnız avtomatik `tall` qərarı üçün işlədilir.

`kind: 'loose'` variantı dəyişmir: `{ kind: 'loose'; html: string }`.

### `HistoryYear` (YENİ)

| Sahə | Tip | Qayda |
|---|---|---|
| `year` | `string` | unikal, cədvəldə ilk rast gəlinmə sırası |
| `anchorId` | `string` | `year-{yyyy}` — JS-siz lövbər və köhnə 024 linkləri |
| `items` | `TimelineEvent[]` | həmin ilin hadisələri və ona bağlanan `loose` sətirlər, cədvəl sırası ilə. Ən azı bir `event` var |

### `AboutBlock` → `timeline` (DƏYİŞİR)

```text
024: { kind: 'timeline'; events: TimelineEvent[]; years: YearLink[] }
026: { kind: 'timeline'; years: HistoryYear[] }
```

`YearLink` tipi silinir (yeganə istifadəçisi `YearNav` idi).

### `AboutLayoutKind`

Dəyişmir. `layoutFor(slug, locale)` imzası dəyişir (R2).

## 3. Qaydalar və validasiya

| # | Qayda | Spec |
|---|---|---|
| V1 | `photoLayout`: işarə tanınırsa onun dəyəri, yoxdursa R4 avtomatik cədvəli. Şəkil yoxdursa `null` (işarə olsa belə; işarə paraqrafı yenə çıxarılır) | FR-004, FR-004a |
| V2 | İşarə paraqrafı: hücrə 2-nin yuxarı səviyyə `<p>`-si, `textOf` nəticəsi `/^\[\s*foto\s*:\s*(single\|note\|hero2\|tall)\s*\]$/i`-yə uyğun gəlir. Bir neçə işarə varsa, birincisi götürülür, hamısı çıxarılır | FR-004a |
| V3 | Tanınmayan işarə (`[foto: xyz]`) adi paraqraf kimi `html`-də qalır | FR-004a, WS I.3 |
| V4 | `groupByYear`: ilsiz sətir əvvəlki hadisənin ilinə, ilk sətir ilsizdirsə birinci ilin əvvəlinə | Edge Cases |
| V5 | Timeline-da `event` yoxdursa blok yaranmır, səhifə `plain` olur (024 qaydası) | Edge Cases |
| V6 | `years.length === 1` → görünüş yalnız kartdır (ox, düymə və avtomatik keçid olmur). Bu, model yox, UI qaydasıdır | Edge Cases |

## 4. Client vəziyyəti (`HistoryStepper`)

| State | Tip | İlkin | Dəyişir |
|---|---|---|---|
| `index` | `number` | `0`. Mount-da hash `#yyyy` / `#year-yyyy` tanınırsa həmin il | nöqtə, düymə, ←/→, swipe, avtomatik keçid |
| `pauses` | `Set<'hover' \| 'focus' \| 'zoom'>` (ref) | boş. Mount-da şərtlər ödənirsə (reduced-motion yox, `#il` yox, N≥2) interval qurulur (R7) | səbəb əlavə/çıxarılır; boş + görünür + tab aktiv → tik sayılır. İstifadəçi keçidi `cycle`-ı artırır → interval yenidən qurulur (FR-015) |
| `announce` | `boolean` | `false` | istifadəçinin ilk öz keçidindən sonra `true` (`aria-live`, R9) |
| `zoom` | `{ src, alt } \| null` | `null` | şəkil kliki / dialog bağlanması |

Törəmə dəyərlər ayrıca saxlanılmır (W V): `prevDisabled = index === 0`,
`nextDisabled = index === N−1`, `progress = index / (N−1)`.

```text
autoplay:  off ──(şərtlər ödənir: reduced-motion yox, hash yox, N≥2)──▶ counting
           counting ──(tick, pauses boş, görünür, tab aktiv, index < N−1)──▶ counting (index+1, elan yox)
           counting ──(istifadəçi keçidi)──▶ counting (sayğac sıfırdan, elan var)
           counting ──(pointerenter | klaviatura fokusu daxil | lightbox açıldı)──▶ paused
           paused ──(səbəblər çoxluğu boşaldı)──▶ counting
           counting ──(index = N−1)──▶ counting (gözləyir; istifadəçi geri qayıdarsa davam)
```

## 5. Vəziyyətlər (W VII.4)

| Vəziyyət | Görünüş |
|---|---|
| Səhifə tapılmır / API xətası | Dəyişmir (cms-page loader, 024) |
| Cədvəl yoxdur və ya pozuqdur | `plain` (024) |
| Bir il | Yalnız kart |
| Şəkil yüklənmir | Foto yeri fonla (`brand-700`) qalır, link işləyir |
| JS yoxdur | Bütün illər alt-alta, ox lövbər linkləri, düymələr gizli |
