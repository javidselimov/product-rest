# Data model: Maliyyə savadlılığı

Saxlanılan yeni obyekt yoxdur. Mövcud cədvəllər: `page_translations` (mətn), `page_details` (sol menyu bayrağı, spec 041), `page_assets` (fayllar).
Aşağıdakılar saytın view-modelidir (`features/about-content/model/types.ts`) və seed-in yazdığı mətnin xəritəsidir.

## §1. Bölmə və layout

```ts
type SectionKey = 'about' | 'media' | 'cooperation' | 'literacy'          // + 'literacy'
type AboutLayoutKind = … | 'financial-literacy' | 'literacy-platform'      // + iki layout
```

`SECTION_TITLES.literacy`: `Maliyyə savadlılığı`, `Financial Literacy`, `Financial literacy`. Slug xəritəsi: [research.md](./research.md) R3.

## §2. `financial-literacy` blokları

```ts
type LiteracyImage = { mediaId: number; src: string }            // src = /media/{id}; alt view-da qurulur

type LiteracyPart =
  | { kind: 'html'; html: string }
  | { kind: 'subheading'; text: string }                          // h3 mətni (düz mətn)
  | { kind: 'quote'; html: string; source: string | null }        // source: düz mətn
  | { kind: 'principles'; items: { title: string; description: string | null }[] }
  | { kind: 'chips'; items: string[] }
  | { kind: 'gallery'; images: LiteracyImage[] }

type LiteracySection = { heading: string | null; parts: LiteracyPart[] }  // heading=null: birinci h2-dən əvvəlki giriş

type LiteracyCta = {
  eyebrow: string
  title: string
  addressHtml: string                                             // poçt linki daxil, prepareCmsHtml fraqmenti
  email: string                                                   // mailto-dan, kiçik hərf
}

type FinancialLiteracyBlock = {
  kind: 'financial-literacy'
  sections: LiteracySection[]
  cta: LiteracyCta | null
  /** Qalereyanın göstərdiyi fayllar: view onları Attachments-dən çıxarır (research R5). */
  usedMediaIds: number[]
}
```

Qaydalar: `principles` və `chips`-in ikonu indeksə görədir (siyahı dizayndan uzundursa ikonlar təkrarlanır), modeldə ikon yoxdur. Mətn sahələri düz mətndir
(`textOf`), `html` sahələri `CmsContent` ilə render olunur.

## §3. `literacy-platform` blokları

```ts
type LiteracyPlatformBlock = {
  kind: 'literacy-platform'
  introHtml: string
  noteHtml: string | null                                         // blockquote mətni (html, linklər qalır)
  photos: LiteracyImage[]
  sections: { heading: string; html: string }[]
  link: { href: string; label: string } | null                    // yalnız http(s)
  /** Tanınmayan hər şey yerində, intro-dan sonra və bölmələrin arasında qalır. */
  usedMediaIds: number[]
}
```

Tanınmayan bloklar (məsələn ikinci `blockquote`) yerləşdikləri bölmənin `html`-inə və ya `introHtml`-ə düşür, heç nə atılmır.

## §4. Seed mətni (`0030-financial-literacy-seed.sql`)

Mətnin forması [contracts/cms-markup.md](./contracts/cms-markup.md) nümunələridir. Paraqraflar **köhnə mətndən olduğu kimi** götürülür, aşağıdakı
cədvəllər yalnız yeni və ya dəyişən hissələri verir. Linklər redaktorun formasındadır (`target="_blank" rel="noopener noreferrer nofollow"`).
EN-in yeni hissələri qaralama tərcümədir.

### 4.1 Kök 106 (`maliyye-savadliligi` / `financial-literacy`)

| Yer | az (Figma) | en |
|---|---|---|
| giriş | köhnə p1 | köhnə p1 |
| h2 | İnsan maliyyə cəhətdən necə sağlam ola bilər? | What does it mean to be financially healthy? |
| mətn | köhnə p3, p4 | köhnə p3, p4 |
| h2 | Maliyyə savadlılığı nədir? | What is financial literacy? |
| sitat | Maliyyə savadlılığı fərdlərin maliyyə məhsul və xidmətlərini başa düşmək, maliyyə risk və imkanlarını qiymətləndirmək, rasional seçimlər etmək üçün zəruri olan məlumatlılıq səviyyəsi, bilik, bacarıq və davranışlar toplusudur. | Financial literacy is a set of awareness, knowledge, skills, attitudes and behaviours that enable individuals to understand financial products and services, assess financial risks and opportunities, and make rational choices. |
| mənbə | İƏİT (İqtisadi Əməkdaşlıq və İnkişaf Təşkilatı), 2012 | OECD (Organisation for Economic Co-operation and Development), 2012 |
| mətn | Maliyyə savadlılığını insanlar həyatları boyu … öhdəsindən asanlıqla gəlir. (köhnə p5-in 2–4-cü cümlələri) | Since financial literacy is acquired … cope with these decisions easily. |
| h2 | Maliyyə sağlamlığının dörd prinsipi | Four principles of financial health |
| mətn | Yüksək rifah üçün aşağıdakı vərdiş və bacarıqlar maliyyə savadlılığının yüksək olduğunu göstərən faktorlardır: | The following habits and skills indicate high financial literacy and lead to greater well-being: |
| kart 1 | Dayanıqlı gəlir — Sabit və davamlı gəlir mənbəyinə malik olmaq | Stable income — Having a steady and sustainable source of income |
| kart 2 | Səmərəli xərcləmə — Xərcləri planlaşdırmaq və büdcəyə nəzarət etmək | Efficient spending — Planning expenses and keeping to a budget |
| kart 3 | Effektiv qənaət — Gələcək və gözlənilməz hallar üçün yığım etmək | Effective saving — Saving for the future and for the unexpected |
| kart 4 | Rasional sərmayə — Risk və gəlirliliyi qiymətləndirərək investisiya etmək | Rational investment — Investing after weighing risk and return |
| mətn | köhnə p6 | köhnə p6 |
| h2 | Mərkəzi Bankın fəaliyyəti | Activities of the Central Bank |
| mətn | Azərbaycan Respublikasının Mərkəzi Bankı istehlakçıların maliyyə savadlılığının artırılması və bu yolla onların hüquqlarının müdafiəsi fonunda müxtəlif səpkili tədbirlər həyata keçirir. | The Central Bank of the Republic of Azerbaijan is implementing various measures to increase consumers' financial literacy and thereby protect their rights. |
| h3 | Əsas hədəf qrupları | Main target groups |
| etiketlər | Məktəblilər · Tələbələr · Müəllimlər · Ev təsərrüfatı ilə məşğul olan yaşlı əhali · Kiçik və orta sahibkarlar · İnsan resursları menecerləri · İqtisadiyyat və bankçılıq üzrə jurnalistlər | Schoolchildren · Students · Teachers · Elderly people engaged in household work · Small and medium-sized entrepreneurs · Human resource managers · Journalists specialising in economics and banking |
| h3 | Maarifləndirmə formatları | Awareness formats |
| mətn | köhnə p8 | köhnə p8 |
| qalereya | köhnə media paraqrafı (1380–1386) | = |
| CTA | köhnə p9, p10, p11 | köhnə p9, p10, p11 |

### 4.2 Platforma səhifələri (110, 111, 112)

Hər səhifənin quruluşu: giriş paraqrafları → `blockquote` qeyd → media paraqrafı → `h2` bölmələr → keçid düyməsi.

| Səhifə | Qeyd (köhnə paraqrafdan) | Bölmələr: az / en | Düymə |
|---|---|---|---|
| 110 Portal | "Portalın resurslarından istifadə hər kəs üçün əlçatandır…" / "Everyone can access…" | Maliyyə xidmətləri / Financial services · Mərkəzi Bank / Central Bank · Pullar / Money · "Mərkəzi Bank" oyun simulyatoru / "Central Bank" game simulator · Xəbərlər / News · Digər bölmələr / Other sections | `https://www.bizimpullar.az/` — "Portala keçid: www.bizimpullar.az" / "Go to the portal: www.bizimpullar.az" |
| 111 Virtual | "Platformada yerləşdirilən bütün resurslar ödənişsizdir." / "All resources posted on the platform are free of charge." | Distant tədris modulları / Distance learning modules · Qeydiyyat / Registration · Sertifikat / Certificate · Uşaqlar üçün kurslar / Courses for children · Əlaqə / Contact | `https://edu.e-cbar.az/` — "Platformaya keçid: edu.e-cbar.az" / "Go to the platform: edu.e-cbar.az" |
| 112 infobank | "Sistemdəki məlumatlar mütəmadi olaraq monitorinq olunur…" / "The system's information is regularly monitored…" | Necə işləyir / How it works · Əlaqə / Contact | `https://infobank.az/` — "Sistemə keçid: infobank.az" / "Go to the system: infobank.az" |

Bölmələrin paraqrafları köhnə mətndən Figma-dakı bölgüyə görə götürülür. Köhnə bir paraqraf iki bölməyə düşürsə (111: "Kursların hazır…" + "Tədris
prosesinin…", 112: p1-in ikinci cümləsi), Figma kimi bölünür. Köhnə paraqrafdakı `%C2%A0` ilə bitən YouTube linki təmizlənir (`https://youtu.be/0iNZkyQ0Q7M`).

### 4.3 Naviqasiya (`page_details`)

| page_id | Səhifə | `show_in_side_nav` |
|---|---|---|
| 107 | Ümumi məlumat | false |
| 108 | Seminarlar/vebinarlar | false |
| 109 | Müsabiqələr | false |
| 452 | Maliyyə savadlılığı (Kopya) — alt ağacı ilə | false |

Səhifələr slug ilə tapılır (`umumi-melumat`, `seminarlar-vebinarlar`, `musabiqeler`, `maliyye-savadliligi-copy`, az). Sətir artıq varsa toxunulmur.
