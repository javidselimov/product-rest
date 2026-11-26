/**
 * "Haqqımızda" fikstürləri (spec 024) — test mühitindən (api-cbar-test) 2026-10-14-də götürülüb.
 *
 * Real CMS HTML-i formaya salınmamış bugünkü məzmundur: parser onu mətn itirmədən göstərməlidir
 * (SC-004). Qlobal `pageTreeAz` dəyişmir — About testləri bu ağacı `server.use` ilə verir.
 */
import type { PageNode } from '@/entities/page-node'

import type { PageDetail } from '@/features/pages/model/schemas'

export const aboutTreeAz: PageNode[] = [
  {
    id: 1,
    title: 'Haqqımızda',
    slug: 'haqqimizda',
    navUrl: null,
    children: [
      {
        id: 2,
        title: 'Tarixi',
        slug: 'tarixi',
        navUrl: null,
        children: [],
      },
      {
        id: 3,
        title: 'Təşkilati struktur və idarəetmə',
        slug: 'teskilati-struktur-ve-idareetme',
        navUrl: null,
        children: [
          {
            id: 233,
            title: 'İdarə Heyəti',
            slug: 'idare-heyeti',
            navUrl: '/organization?section=board',
            children: [],
          },
          {
            id: 234,
            title: 'Rəhbərlik',
            slug: 'rehberlik',
            navUrl: '/organization?section=management',
            children: [],
          },
          {
            id: 235,
            title: 'Struktur bölmələr',
            slug: 'struktur-bolmeler',
            navUrl: '/organization?section=divisions',
            children: [],
          },
          {
            id: 236,
            title: 'Ərazi idarələr',
            slug: 'erazi-idareler',
            navUrl: '/organization?section=offices',
            children: [],
          },
          {
            id: 183,
            title: 'Pul Siyasəti və Maliyyə Sabitliyi Komitəsi',
            slug: 'pul-siyaseti-ve-maliyye-sabitliyi-komitesi',
            navUrl: null,
            children: [],
          },
        ],
      },
      {
        id: 4,
        title: 'Missiya və dəyərlər',
        slug: 'missiya-ve-deyerler',
        navUrl: null,
        children: [],
      },
      {
        id: 5,
        title: 'Əlaqə',
        slug: 'elaqe',
        navUrl: null,
        children: [],
      },
      {
        id: 242,
        title: 'Haqqımızda (Kopya)',
        slug: 'haqqimizda-copy',
        navUrl: null,
        children: [
          {
            id: 243,
            title: 'Tarix (Kopya)',
            slug: 'tarix-copy',
            navUrl: null,
            children: [],
          },
          {
            id: 244,
            title: 'Təşkilati struktur və idarəetmə (Kopya)',
            slug: 'teskilati-struktur-ve-idareetme-copy',
            navUrl: null,
            children: [
              {
                id: 245,
                title: 'İdarə Heyəti (Kopya)',
                slug: 'idare-heyeti-copy',
                navUrl: '/organization?section=board&copy=1',
                children: [],
              },
              {
                id: 246,
                title: 'Rəhbərlik (Kopya)',
                slug: 'rehberlik-copy',
                navUrl: '/organization?section=management&copy=1',
                children: [],
              },
              {
                id: 247,
                title: 'Struktur bölmələr (Kopya)',
                slug: 'struktur-bolmeler-copy',
                navUrl: '/organization?section=divisions&copy=1',
                children: [],
              },
              {
                id: 248,
                title: 'Ərazi idarələr (Kopya)',
                slug: 'erazi-idareler-copy',
                navUrl: '/organization?section=offices&copy=1',
                children: [],
              },
              {
                id: 249,
                title: 'Pul Siyasəti və Maliyyə Sabitliyi Komitəsi (Kopya)',
                slug: 'pul-siyaseti-ve-maliyye-sabitliyi-komitesi-copy',
                navUrl: null,
                children: [],
              },
            ],
          },
          {
            id: 250,
            title: 'Missiya və dəyərlər (Kopya)',
            slug: 'missiya-ve-deyerler-copy',
            navUrl: null,
            children: [],
          },
          {
            id: 251,
            title: 'Əlaqə (Kopya)',
            slug: 'elaqe-copy',
            navUrl: null,
            children: [],
          },
        ],
      },
    ],
  },
]

export const aboutTreeEn: PageNode[] = [
  {
    id: 1,
    title: 'About Us',
    slug: 'about-us',
    navUrl: null,
    children: [
      {
        id: 2,
        title: 'History',
        slug: 'history',
        navUrl: null,
        children: [],
      },
      {
        id: 3,
        title: 'Organizational structure and management',
        slug: 'organizational-structure-and-management',
        navUrl: null,
        children: [
          {
            id: 233,
            title: 'Board',
            slug: 'board',
            navUrl: '/organization?section=board',
            children: [],
          },
          {
            id: 234,
            title: 'Management',
            slug: 'management',
            navUrl: '/organization?section=management',
            children: [],
          },
          {
            id: 235,
            title: 'Divisions',
            slug: 'divisions',
            navUrl: '/organization?section=divisions',
            children: [],
          },
          {
            id: 236,
            title: 'Regional offices',
            slug: 'regional-offices',
            navUrl: '/organization?section=offices',
            children: [],
          },
          {
            id: 183,
            title: 'Monetary Policy and Financial Stability Committee',
            slug: 'monetary-policy-and-financial-stability-committee',
            navUrl: null,
            children: [],
          },
        ],
      },
      {
        id: 4,
        title: 'Mission and values',
        slug: 'mission-and-values',
        navUrl: null,
        children: [],
      },
      {
        id: 5,
        title: 'Contacts',
        slug: 'contacts',
        navUrl: null,
        children: [],
      },
      {
        id: 242,
        title: 'About Us (Copy)',
        slug: 'about-us-copy',
        navUrl: null,
        children: [
          {
            id: 243,
            title: 'History (Copy)',
            slug: 'history-copy',
            navUrl: null,
            children: [],
          },
          {
            id: 244,
            title: 'Organizational structure and management (Copy)',
            slug: 'organizational-structure-and-management-copy',
            navUrl: null,
            children: [],
          },
          {
            id: 250,
            title: 'Mission and values (Copy)',
            slug: 'mission-and-values-copy',
            navUrl: null,
            children: [],
          },
          {
            id: 251,
            title: 'Contacts (Copy)',
            slug: 'contacts-copy',
            navUrl: null,
            children: [],
          },
        ],
      },
    ],
  },
]

export const aboutPagesAz: Record<string, PageDetail> = {
  haqqimizda: {
    id: 1,
    title: 'Haqqımızda',
    slug: 'haqqimizda',
    content:
      '<p style="text-align: center"><strong>Azərbaycan Respublikasının Mərkəzi Bankı</strong></p>\n<p style="text-align: justify">Azərbaycan Respublikasının Milli Bankı “Azərbaycan Respublikası Milli Bankının yaradılması haqqında” Azərbaycan Respublikası Prezidentinin 1992-ci il 11 fevral tarixli Fərmanı ilə yaradılmışdır.</p>\n<p style="text-align: justify">“Azərbaycan Respublikasının Konstitusiyasına əlavələr və dəyişikliklər edilməsi haqqında” 18 mart 2009–cu il tarixli Azərbaycan Respublikasının Referendum Aktının qüvvəyə minməsi ilə əlaqədar olaraq “Azərbaycan Respublikası Milli Bankı” “Azərbaycan Respublikasının Mərkəzi Bankı” adlandırılmışdır.</p>\n<p style="text-align: justify">Azərbaycan Respublikası Mərkəzi Bankının statusu, onun məqsəd, funksiya və səlahiyyətləri, habelə idarəetmə və təşkilati strukturu, dövlətin mərkəzi bankı kimi dövlət hakimiyyəti orqanları ilə və digər şəxslərlə münasibətləri “Azərbaycan Respublikasının Mərkəzi Bankı haqqında” Azərbaycan Respublikasının 10 dekabr 2004-cü il tarixli Qanunu (Qanun) ilə tənzimlənir. Mərkəzi Bankın müstəsna olaraq ölkənin milli valyutasının emissiya funksiyası Azərbaycan Respublikasının Konstitusiyası ilə təsbit olunur. Mərkəzi Bank öz fəaliyyətində həmçinin Azərbaycan Respublikasının digər qanunvericilik aktlarını və Azərbaycan Respublikasının tərəfdar çıxdığı beynəlxalq müqavilələri rəhbər tutur.</p>\n<p style="text-align: center"><strong>Mərkəzi Bankın məqsədləri</strong> </p>\n<p style="text-align: justify">Mərkəzi Bankın fəaliyyətinin əsas məqsədi Qanunla müəyyən edilmiş səlahiyyətləri daxilində qiymətlərin sabitliyinin təmin edilməsidir.</p>\n<p style="text-align: justify">Əsas məqsədinə xələl gətirmədən Mərkəzi Bank maliyyə bazarlarını tənzimləyən qanunlarla müəyyən edilmiş səlahiyyətlər daxilində maliyyə sabitliyini təmin edir. </p>\n<p style="text-align: justify">Mənfəət götürmək Mərkəzi Bankın əsas məqsədi deyildir.</p>\n<p style="text-align: center"><strong>Mərkəzi Bankın funksiyaları</strong> </p>\n<p style="text-align: justify">Mərkəzi Bank öz məqsədlərinə nail olmaq üçün Qanunun 5-ci maddəsində müəyyən edilmiş funksiyaları həyata keçirir. Mərkəzi Bankın funksiyaları aşağıdakılardır:</p>\n<ul><li><strong>Pul və məzənnə siyasətinin müəyyən edilməsi və həyata keçirilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bankın əsas funksiyası dövlətin pul və onun tərkib hissəsi olan məzənnə siyasətinin müəyyən edilməsi və həyata keçirilməsidir.</p>\n<ul><li><strong>Nağd pul dövriyyəsinin təşkil edilməsi, </strong><strong>Azərbaycan Respublikası Konstitusiyasının 19-cu maddəsinin II hissəsinə və bu Qanuna müvafiq olaraq pul nişanlarının tədavülə buraxılmasının və tədavüldən çıxarılmasının həyata keçirilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bankın mühüm funksiyalarından biri də Azərbaycan Respublikasının milli valyutasının (manatın) emissiya edilməsidir. Azərbaycan Respublikası Konstitusiyasının 19-cu maddəsinə əsasən Mərkəzi Bank bu hüququn müstəsna sahibidir. Bu səlahiyyət çərçivəsində Mərkəzi Bank manatda olan kağız və metal pul nişanlarını tədavülə buraxır və tədavüldən çıxarır, həmçinin onların dövriyyəsinin təşkili üzrə tədbirlər görür.</p>\n<ul><li><strong>Manatın xarici valyutalara nisbətdə rəsmi məzənnəsinin mütəmadi müəyyən edilməsi və elan edilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank manatın xarici valyutalara nisbətdə rəsmi məzənnəsini müəyyən edir və elan edir.</p>\n<ul><li><strong>“Valyuta tənzimi haqqında” Azərbaycan Respublikasının Qanununa uyğun olaraq valyuta tənziminin və nəzarətinin həyata keçirilməsi</strong></li></ul>\n<p style="text-align: justify">Valyuta tənzimi və nəzarəti – məzənnə siyasətinin həyata keçirilməsini dəstəkləyən, beynəlxalq hesablaşmaların aparılması, xarici valyuta ilə dövriyyənin tənzimlənməsi, o cümlədən əqdlərin həyata keçirilməsi, valyutadan istifadənin məhdudlaşdırılması və valyutanın hərəkəti üzrə dövlət nəzarətinin aparılması ilə bağlı kompleks tədbirlərdən ibarət fəaliyyətdir.</p>\n<ul><li><strong>Sərəncamında olan beynəlxalq qızıl-valyuta ehtiyatlarının saxlanması və idarə edilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank sərəncamında olan beynəlxalq qızıl-valyuta ehtiyatlarını saxlayır və idarə edir.</p>\n<ul><li><strong>Beynəlxalq standart və metodologiyalara uyğun olaraq monetar, maliyyə bazarları və ödəniş sistemləri üzrə statistikanın, ölkənin tədiyə balansının, beynəlxalq investisiya balansının və icmal (dövlət və qeyri-dövlət) xarici borc statistikasının tərtib edilməsi, məlumatların ümumiləşdirilməsi və yayılmasının təmin edilməsi, habelə ölkənin tədiyə balansının proqnozlaşdırılmasında iştirak edilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bankın funksiyalarından biri qanunvericiliyə uyğun olaraq hesabat tədiyə balansının tərtib edilməsi və ölkənin proqnoz tədiyə balansının hazırlanmasında iştirak edilməsidir. Mərkəzi Bank ölkənin icmal (dövlət və qeyri-dövlət) xarici borc statistikasını və beynəlxalq investisiya balansını tərtib edir, məlumatların ümumiləşdirilməsini və yayılmasını təmin edir. </p>\n<ul><li><strong>Ödəniş sistemlərinin sabit, təhlükəsiz və effektiv fəaliyyətinin təmin edilməsi, inkişafına dəstək verilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank ölkə ərazisində fəaliyyət göstərən banklar, xarici bankların yerli filialları və poçt rabitəsinin milli operatoru arasında milli valyutada hesablaşmaların həmin təşkilatların Mərkəzi Bankda açdıqları müxbir hesablar vasitəsilə həyata keçirilməsini təşkil edir. Mərkəzi Bank ödəniş xidmətləri təchizatçıları tərəfindən ödəniş əməliyyatlarının aparılması və onlar arasında hesablaşmaların həyata keçirilməsi qaydalarını, həmçinin ödəniş alətlərinə dair tələbləri müəyyən edir.</p>\n<ul><li><strong>Maliyyə bazarlarının fəaliyyətinin sabitliyi və dayanıqlığının təmin edilməsi, maliyyə bazarlarında tənzimləmə və nəzarətin, o cümlədən makroprudensial tənzimləmə və nəzarətin həyata keçirilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank maliyyə bazarlarının fəaliyyətinin sabitliyi və dayanıqlığını təmin etmək məqsədilə banklar, bank olmayan kredit təşkilatları, sığorta bazarının peşəkar iştirakçıları, investisiya şirkətləri və qiymətli kağızlar bazarında digər lisenziyalaşdırılan şəxslər, investisiya fondları, investisiya fondunun idarəçiləri, klirinq (prosessinq) fəaliyyətini həyata keçirən şəxslər, kredit büroları və maliyyə bazarlarını tənzimləyən qanunlarla Mərkəzi Bankın nəzarət etdiyi subyektlər kimi müəyyən edilən digər şəxslərin (nəzarət subyektlərinin) fəaliyyətinin lisenziyalaşdırılmasını, tənzimlənməsini və fəaliyyətləri üzərində nəzarəti həyata keçirir.</p>\n<ul><li><strong>Maliyyə bazarlarında istehlakçıların və investorların hüquqlarının qorunması üçün tədbirlərin görülməsi və maliyyə bazarları sahəsində maarifləndirmə işlərinin aparılması</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank nəzarət subyektlərinin fəaliyyətinin tənzimlənməsi və fəaliyyətinə nəzarətlə bağlı istehlakçıların və investorların hüquqlarının qorunması məqsədilə Mərkəzi Bank tərəfindən müəyyən edilmiş qaydaya uyğun olaraq maliyyə xidmətlərinin (məhsullarının) test məqsədli alışını həyata keçirir, maliyyə bazarlarında istehlakçıların və investorların qanuni maraqlarının pozulması və ya pozulmasına şərait yaradan halların aradan qaldırılması barədə nəzarət subyektlərinə icrası məcburi olan göstərişlər verir.</p>\n<ul><li><strong>Əmanətlərin sığortalanması sahəsində nəzarət sisteminin fəaliyyətinin təmin edilməsi</strong></li></ul>\n<p style="text-align: justify">Mərkəzi Bank əmanətlərin sığortalanması sahəsində nəzarət sisteminin fəaliyyətinin təmin edilməsi istiqamətində işləri həyata keçirir.</p>\n<p style="text-align: justify">Mərkəzi Bankın həyata keçirdiyi funksiyalar bütövlükdə ölkənin makroiqtisadi sabitliyinə dəstək göstərilməsinə xidmət edir.</p>\n<p style="text-align: justify">“Maliyyə xidmətləri bazarında tənzimləmə və nəzarət sisteminin idarəedilməsinin təkmilləşdirilməsi haqqında” Azərbaycan Respublikası Prezidentinin 28 noyabr 2019-cu il tarixli Sərəncamı ilə Azərbaycan Respublikasının qanunlarında maliyyə bazarlarına nəzarət orqanının müəyyən edilmiş səlahiyyətləri, o cümlədən onun maliyyə xidmətləri bazarında lisenziyalaşdırma, tənzimləmə və nəzarət, investorların və maliyyə xidmətləri istehlakçılarının hüquqlarının qorunması sahəsində vəzifə və hüquqları Azərbaycan Respublikasının Mərkəzi Bankına verilmişdir.</p>\n<p style="text-align: center"><strong>Mərkəzi Bankın dövlət orqanları ilə münasibətləri </strong> </p>\n<p style="text-align: justify">Azərbaycan Respublikasının Konstitusiyası və qanunları ilə müəyyən edilmiş funksiya və səlahiyyətlərini həyata keçirərkən Mərkəzi Bank müstəqildir və bu zaman hər hansı dövlət hakimiyyəti və yerli özünüidarəetmə orqanları, fiziki və hüquqi şəxslər onun fəaliyyətinə hər hansı bir səbəbdən bilavasitə, yaxud dolayı yolla məhdudiyyət qoya bilməz, Qanunda nəzərdə tutulmuş hallar istisna olmaqla, fəaliyyəti üzərində monitorinq həyata keçirə, qanuna zidd təsir və müdaxilə edə bilməz. Lakin Mərkəzi Bank qanunla müəyyən edilmiş müstəqillik statusuna malik olsa da, öz fəaliyyətini digər iqtisadi dövlət orqanları və qurumları ilə qarşılıqlı surətdə əlaqələndirir. Eyni zamanda Mərkəzi Bank dövlətin iqtisadi siyasətinin müxtəlif istiqamətləri üzrə məsələlərin müzakirəsində iştirak edir, müvafiq təkliflər verir. Mərkəzi Bank dövlətin bankı olaraq dövlət xəzinədarlıq hesablarına xidmət göstərir, həmin hesablar üzrə mədaxil-məxaric əməliyyatlarını aparır. Mərkəzi Bank dövlət büdcəsində qısamüddətli vəsait çatışmazlığı yarandıqda dövlətə qanunla müəyyən edilmiş limitlər çərçivəsində kredit verə bilər.</p>\n<p style="text-align: center"><strong>Mərkəzi Bankın hesabatlılığı</strong></p>\n<p style="text-align: justify">Mərkəzi Bank fəaliyyətinin şəffaflığını artırmaq və ictimai etimadı gücləndirmək üçün ictimaiyyəti öz məqsəd və funksiyalarının həyata keçirməsi ilə bağlı daim məlumatlandırır. Mərkəzi Bankın sədri ölkə iqtisadiyyatına, o cümlədən maliyyə sektorunun inkişafı üzrə görülən işlərə dair ölkə Prezidentinə hesabat verir. Həmçinin dövlət büdcəsi layihəsinin müzakirəsi zamanı Bankın sədri qarşıdakı il üçün pul siyasətinin əsas istiqamətləri barədə Azərbaycan Respublikasının Milli Məclisinə məlumat verir. Mərkəzi Bankın illik fəaliyyəti Azərbaycan Respublikasının Prezidenti tərəfindən təyin edilmiş auditor tərəfindən yoxlanılır və maliyyə hesabatı Prezidentə təqdim edilir. Mərkəzi Bankın illik hesabatı ictimaiyyətə də açıqlanır. Belə ki, illik hesabat, o cümlədən audit yoxlamasından keçmiş maliyyə hesabatı hər il kütləvi informasiya vasitələrində (Mərkəzi Bankın internet saytında) dərc edilir.</p>',
    assets: [],
  },
  tarixi: {
    id: 2,
    title: 'Tarixi',
    slug: 'tarixi',
    content:
      '<p style="text-align: center"><strong>Azərbaycan Respublikasının Mərkəzi Bankı</strong></p>\n<p style="text-align: justify">Azərbaycan öz müstəqilliyini bərpa etdikdən dərhal sonra qəbul edilmiş qanunvericilik aktlarından biri “Azərbaycan Respublikasının iqtisadi müstəqilliyinin əsasları haqqında” Azərbaycan Respublikasının 1991-ci il 25 may tarixli Konstitusiya Qanununun “Bank sistemi və pul tədavülü” adlanan 14-cü maddəsində Azərbaycanda müstəqil bank sisteminin və milli pul vahidinin tədavülünün hüquqi əsasları təsbit edilmiş, Milli Bankın statusu və səlahiyyətləri müəyyən edilmişdir. Milli Bank kredit, pul tədavülü, hesablaşmalar və valyuta münasibətləri sahəsində dövlət siyasətini həyata keçirən, bütövlükdə bank sisteminin fəaliyyətini tənzimləyən və ehtiyat bank funksiyalarını icra edən ali emissiya idarəsi elan edilmişdir.</p>\n<p style="text-align: justify">Azərbaycan Respublikası Prezidentinin 1992-ci il 11 fevral tarixli “Azərbaycan Respublikası Milli Bankının yaradılması haqqında” Fərmanı ilə Azərbaycan Respublikasının Milli Bankı yaradılmışdır. Fərmanın qüvvəyə mindiyi gün (12 fevral tarixi) Bankın yaradılması günü kimi qeyd edilir.</p>\n<p style="text-align: justify">1992-ci il 7 avqust tarixində Milli Bankın fəaliyyətini tənzimləyən ilk qanun - “Azərbaycan Respublikasının Milli Bankı haqqında” qanun, həmçinin həmin ilin 1 dekabr tarixində isə Azərbaycan Respublikasının Milli Məclisi tərəfindən “Azərbaycan Respublikasının Milli Bankının Nizamnaməsinin təsdiq edilməsi haqqında” qərar qəbul olunmuşdur.</p>\n<p style="text-align: justify">1992-ci ilin avqust ayının 15-də Azərbaycan Respublikasının milli valyutası – manat dövriyyəyə buraxılmışdır. 1994-cü il yanvarın 1-dən manat ölkənin yeganə ödəniş vasitəsi elan olunmuşdur. 1995-ci il 12 noyabr tarixində referendum yolu ilə qəbul olunmuş müstəqil Azərbaycan Respublikasının ilk Konstitusiyasının 19-cu maddəsinin II hissəsində Milli Bank pul nişanlarının tədavülə buraxılması və tədavüldən çıxarılması üzrə müstəsna hüquqa malik qurum kimi müəyyən olunmuşdur.</p>\n<p style="text-align: justify">Hazırda Mərkəzi Bank öz fəaliyyətini üçüncü nəsil bank qanunları əsasında həyata keçirir (“Azərbaycan Respublikasının Milli Bankı haqqında” Azərbaycan Respublikasının Qanununun ikinci redaksiyası 1996-cı il 14 iyun tarixində, üçüncü redaksiyası 2004-cü il 10 dekabr tarixində qəbul edilmişdır).</p>\n<p style="text-align: justify">Mərkəzi Bankın məqsəd və funksiyalarının, bütün funksional sahələri üzrə fəaliyyətinin daha səmərəli və effektiv şəkildə həyata keçirilməsi üçün hüquqi əsaslar yaradılmış, pul və valyuta (məzənnə) siyasətinin müəyyənləşdirilməsi və həyata keçirilməsi, pul tədavülünün təşkili, ödəniş sistemlərinin tənzimlənməsi və inkişafı, qızıl-valyuta ehtiyatlarının saxlanması və idarə edilməsi Bankın əsas funksiyaları kimi müəyyən edilmişdir.</p>\n<p style="text-align: justify">Azərbaycan Respublikası Prezidentinin “Azərbaycan Respublikasında pul nişanlarının nominal dəyərinin və qiymətlər miqyasının dəyişdirilməsi (denominasiyası) haqqında 07 fevral 2005-ci il tarixli Fərmanına əsasən, 2006-cı il yanvarın 1-dən etibarən yeni manatın tədavülünə başlanılmışdır. Bununla əlaqədar, 1 yeni manat 5000 manata bərabər edilmiş, mövcud manat yeni manatla birgə 2006 il ərzində dövriyyədə saxlanılmış, 2007-ci il yanvarın 1-dən isə tamamilə yeni manata keçilmiş, yeni manatların əskinasları və qəpiklik sikkələr mərhələlərlə dövriyyəyə buraxılmışdır.</p>\n<p style="text-align: justify">Dövlətin mərkəzi bankı funksiyasının həyata keçirilməsi bankın adına da yenidən baxılmasını şərtləndirmiş və “Azərbaycan Respublikasının Konstitusiyasına əlavələr və dəyişikliklər edilməsi haqqında” 18 mart 2009–cu il tarixli Azərbaycan Respublikasının Referendum Aktının qüvvəyə minməsi ilə o, “Azərbaycan Respublikasının Mərkəzi Bankı” kimi adlandırılmışdır.</p>\n<p style="text-align: justify">2016-ci ildə ölkədə keçirilən iqtisadi və institusional islahatlar çərçivəsində Mərkəzi Bankın səlahiyyətlərinə dəyişikliklər edilmişdir. Belə ki, “Azərbaycan Respublikasının Mərkəzi Bankı haqqında” Azərbaycan Respublikasının Qanununa 2016-cı ilin mart ayının 4-də qəbul edilmiş dəyişikliklərə uyğun olaraq bank fəaliyyətinin lisenziyalaşdırılması və tənzimlənməsi, bank fəaliyyətinə nəzarət funksiyaları yeni yaradılmış quruma verilmişdir. Bundan sonra Mərkəzi Bankın səlahiyyətləri əsasən pul-məzənnə siyasəti, makroqitisadi və maliyyə sabitliyi siyasətinə dəstək verilməsi, banklararası mərkəzləşdirilmiş və digər lisenziyalaşdırılmayan ödəniş sistemlərinin tənzimlənməsi və inkişafının təmin edilməsi, nağd pul dövriyyəsinin təşkili istiqamətlərinə fokuslaşmışdır.</p>\n<p style="text-align: justify">“Maliyyə xidmətləri bazarında tənzimləmə və nəzarət sisteminin idarəedilməsinin təkmilləşdirilməsi haqqında” Azərbaycan Respublikası Prezidentinin 28 noyabr 2019-cu il tarixli Sərəncamı ilə Azərbaycan Respublikasının qanunlarında maliyyə bazarlarına nəzarət orqanının müəyyən edilmiş səlahiyyətləri, o cümlədən onun maliyyə xidmətləri bazarında lisenziyalaşdırma, tənzimləmə və nəzarət, investorların və maliyyə xidmətləri istehlakçılarının hüquqlarının qorunması sahəsində vəzifə və hüquqları Azərbaycan Respublikasının Mərkəzi Bankına verilmişdir.</p>\n<p style="text-align: justify">Mərkəzi Bankın hazırda fəaliyyət göstərdiyi, Bakı şəhəri, Rəşid Behbudov küçəsi, 90 ünvanında yerləşən inzibati binası 1998-ci ildə istifadəyə verilmişdir. Yeni binanın təntənəli açılışında Azərbaycan xalqının Ümummilli Lideri Heydər Əliyev və digər dövlət rəsmiləri istirak etmişdir.</p>\n<p style="text-align: center"><img alt="foto_1" src="/media/657"/><img alt="foto_2" src="/media/658"/><img alt="foto_3" src="/media/659"/></p>\n<p style="text-align: center"><em>Şəkillər: Mərkəzi Bankın inzibati binasının açılışı, 1998-ci il</em></p>\n<p style="text-align: center"><strong>Azərbaycanda mərkəzi bankçılıq fəaliyyətinin tarixi mərhələləri</strong></p>\n<p style="text-align: justify">Azərbaycanda mərkəzi bankçılığın tarixi XX əsrin əvvəllərindən başlamışdır. 1991-ci ildən başlayan müasir mərkəzi bankçılıq tarixinə qədər Azərbaycanda mərkəzi bankçılıq fəaliyyəti bir neçə mərhələdən ibarət olmuşdur: Xalq Cumhuriyyəti dövrü (1918-1920); sovet sosialist quruluşu dövrü (1920-1991).</p>\n<p style="text-align: justify">1918-ci il may ayının 28-də Azərbaycan öz müstəqilliyini elan edərək müsəlman aləmində ilk demokratik respublika – Azərbaycan Xalq Cumhuriyyətini yaratmışdır. İlk dövrdə müstəqil respublikada Rusiya pulları, həmçinin 1918-ci ilin yanvar ayından etibarən Bakı Xalq Komissarları Sovetinin qərarı ilə Bakı şəhər idarəsi və Bakı Sovetinin şəhər təsərrüfatı tərəfindən dövriyyəyə buraxılmiş “Bakı bonları” ilə yanaşı Zaqafqaziya bonlarından da geniş istifadə olunurdu. Həmin vaxtda keçmiş Rusiya Dövlət Bankının Bakı bölməsi də öz fəaliyyətini davam etdirirdi. 1919-cu il mart ayının 7-də Azərbaycan Respublikası hökuməti Azərbaycan Dövlət Bankının (mərkəzi bankın) təşkil edilməsi haqqqında qərar qəbul etmişdir. Həmin il sentyabr ayının 16-da Azərbaycan Respublikasının parlamenti Azərbaycan Dövlət Bankının Nizamnaməsini qəbul etdi. 1919-cu il 30 sentyabr tarixdə isə Azərbaycan Dövlət Bankının təntənəli açılışı oldu və həmin gündən etibarən fəaliyyətə başladı.</p>\n<p style="text-align: justify">“Banklar bankı” olan Azərbaycan Dövlət Bankı ölkədə mövcud olan kredit təşkilatlarının fəaliyyətinə nəzarət edirdi və pul nişanlarının emissiyasını həyata keçirirdi.</p>\n<p style="text-align: justify">1920-ci il 28 aprel tarixində Azərbaycan Xalq Cumhuriyyəti süquta uğradıqdan sonra yeni dövlət quruluşu olan Azərbaycan Sovet Sosialist Respublikasının Maliyyə Komissarlığının 1920-ci il 31 may tarixli Əmri ilə Azərbaycan Dövlət Bankı Azərbaycan Xalq Bankı adlandırıldı. Azərbaycan İnqilab Komitəsinin 1920-ci il 9 iyun tarixli qərarı ilə bütün banklar və digər kredit təşkilatları milliləşdirilərək Xalq Bankının tərkibinə qatıldı və bank işi dövlətin müstəsna inhisarına keçdi.</p>\n<p style="text-align: justify">Azərbaycan Xalq Bankının əsas vəzifəsi kağız pulların emissiyası idi. Maliyyə Komissarlığının tərkibində olan Xalq Bankı xalq təsərrüfatını maliyyələşdirir və smeta-büdcə işi ilə məşğul olurdu. Xalq Bankı tərəfindən kredit əməliyyatlarının keçirilməsi dayandırıldı və o, maliyyə orqanları ilə yanaşı büdcə əməliyyatlarına xidmət göstərən orqana çevrildi.</p>\n<p style="text-align: justify">1921-ci ilin sonlarında yeni iqtisadi siyasətin həyata keçirilməsi zamanı mərkəzi bankın da fəaliyyəti bərpa edildi. Azərbaycan Xalq Komissarları Şurasının 1921-ci il 16 oktyabr tarixli qərarı ilə Azərbaycan Dövlət Bankı yaradıldı və onun nizamnaməsi qəbul edildi.</p>\n<p style="text-align: justify">1922-ci il martın 12-də Azərbaycanı, Gürcüstanı və Ermənistanı özündə birləşdirən Zaqafqaziya Sovet Sosialist Respublikaları federativ ittifaqı (ZSFSR) təşkil olundu. 1922-ci ilin dekabrın 30-da isə ZSFSR Sovet Sosialist Respublikaları İttifaqının tərkibinə qatıldı. ZSFSR-nin İttifaq Şurasının 1923-cü il 10 yanvar tarixli Dekreti ilə Zaqafqaziya vahid pul sisteminə keçdi və beləliklə də Azərbaycan Dövlət Bankının pul emissiyası sahəsində fəaliyyətinə xitam verildi. Azərbaycan Xalq Komissarları Sovetinin 1923-cü il 3 iyul tarixli qərarı ilə isə Azərbaycan Dövlət Bankı Azərbaycan Dövlət Kənd Təsərrüfatı Bankı adlandırıldı və onun mərkəzi bank funksiyalarına xitam verildi. İlk dövrlərdə Azərbaycan Dövlət Kənd Təsərrüfatı Bankı kənd təsərrüfatının inkişafına yardım etməklə yanaşı pul və əmtəə dövriyyəsi məsələlərini də tənzimləyirdi.</p>\n<p style="text-align: justify">1923-cü ildə SSRİ Dövlət Bankının yaradılması ilə əlaqədar onun Bakı bölməsi yaradıldı. 1936-cı ilin dekabrında qəbul edilmiş SSRİ Konstitusiyasına müvafiq olaraq Azərbaycan SSRİ-nin tərkibinə “suveren” respublika kimi daxil oldu. Həmin ildən 1991-ci ilin sonlarına kimi mövcud olmuş SSRİ Dövlət Bankının Azərbaycan İdarəsi fəaliyyət göstərmişdir.</p>',
    assets: [
      {
        mediaId: 657,
        title: 'foto_1',
        mimeType: 'image/jpeg',
        sizeBytes: 2008,
        group: null,
        url: '/media/657',
      },
      {
        mediaId: 658,
        title: 'foto_2',
        mimeType: 'image/jpeg',
        sizeBytes: 2008,
        group: null,
        url: '/media/658',
      },
      {
        mediaId: 659,
        title: 'foto_3',
        mimeType: 'image/jpeg',
        sizeBytes: 2008,
        group: null,
        url: '/media/659',
      },
    ],
  },
  'missiya-ve-deyerler': {
    id: 4,
    title: 'Missiya və dəyərlər',
    slug: 'missiya-ve-deyerler',
    content:
      '<p style="text-align: justify"><strong>Missiya</strong></p>\n<p style="text-align: justify">Cavabdehliyi təşviq etmək, dürüstlüyü qorumaq və inkişafı dəstəkləməklə maliyyə sabitliyini təmin etmək</p>\n<p style="text-align: justify"><strong>Dürüstlük</strong></p>\n<p style="text-align: justify">Təşkilati kimliyimizin mərkəzində dürüstlük dayanır. Bizim üçün dürüstlük sadəcə gözlənti deyil; bu, bizim hesabatlılığa və etik davranışa sadiqliyimizdir. Fəaliyyətimiz zamanı qərəzsizlik prinsiplərinə istinad edirik. Biz, fəaliyyətimizdə qanuni və etik çərçivələrə riayət edirik. Biz, proses və davranışların qəbul olunmuş qaydalara uyğunluğunu təmin edirik. Biz, təşkilatdaxili və təşkilatxarici tərəfdaşlarımızla iş mühitində qarşılıqlı inama, etibara, qərəzsizliyə əsaslanan münasibətlərimizi daim qorumaq, saxlamaq və inkişaf etdirməyə çalışırıq. Qərarlarımızı verən zaman bütün maraqlı tərəflərin mənafelərini nəzərə alırıq. Hər kəsə bərabər imkanlar yaradırıq. Biz, iqtisadi sabitliyin mühafizəçiləri olaraq başa düşürük ki, ictimai etimad sarsılmaz dürüst mövqe ilə qazanılır.</p>\n<p style="text-align: justify"><strong>Cavabdehlik</strong></p>\n<p style="text-align: justify">Biz, mandatımızdan irəli gələn səlahiyyət və öhdəliklərin məsuliyyətini dərk edir və onlara sadiqlik nümayiş etdiririk. Ölkəmizin inkişafı və xalqımızın rifahının yüksəldilməsi istiqamətində üzərimizə düşən cavabdehliyi və məsuliyyəti anlayırıq. Bu istiqamətdə bütün mümkün resurslarımızdan yararlanaraq potensialımızı səfərbər edirik. Verdiyimiz qərarları şəffaf bir şəkildə kommunikasiya edirik. Məqsədlərimizə nail olmaq üçün verdiyimiz qərarlara və göstərdiyimiz fəaliyyətin nəticələrinə görə cavabdehlik daşıyır, nəticəsindən asılı olmayaraq onlara yüksək ruhla sahiblənirik.</p>\n<p style="text-align: justify"><strong>İnkişaf</strong></p>\n<p style="text-align: justify">Davamlı öyrənmə və əməkdaşlıq mədəniyyətini təşviq etməklə missiyamızı effektiv həyata keçirir, fəaliyyətimizə dəyər qatacaq yenilikləri tətbiq etməkdən çəkinmirik. Hər zaman yeni ideyalar, yeni yanaşmalar və innovativ həll yolları axtarışındayıq. Müsbət transformasiya imkanlarından istifadə etməklə davamlı təkmilləşməyə və inkişaf etməyə fokuslanırıq. Dəyişən bazar tələblərinə çevik reaksiyaların verilməsi və texnoloji tendensiyaların öncədən proqnozlaşdırılması diqqət mərkəzimizdədir. Fəaliyyətimizin qatdığı dəyərin fərqindəyik, buna görə də işimizi ən mükəmməl şəkildə görmək üçün bütün qüvvəmizi səfərbər edirik. İnkişaf yolunda kollektiv nailiyyətə, qarşılıqlı faydaya və ortaq məqsədlərə yönəlirik. Biz, maliyyə sektorunun dinamik dəyişikliklərini effektiv idarə edir, sabitliyi təmin etməklə yanaşı iqtisadiyyatın dayanıqlı inkişafına töhfə veririk. Ekosistemi sərbəst şəkildə inkişaf etməsi üçün təşviq edirik.</p>',
    assets: [],
  },
  'pul-siyaseti-ve-maliyye-sabitliyi-komitesi': {
    id: 183,
    title: 'Pul Siyasəti və Maliyyə Sabitliyi Komitəsi',
    slug: 'pul-siyaseti-ve-maliyye-sabitliyi-komitesi',
    content:
      '<p style="text-align: justify">Azərbaycan Respublikası Mərkəzi Bankının Pul Siyasəti və Maliyyə Sabitliyi Komitəsi pul və məzənnə siyasətinin işlənməsi və həyata keçirilməsi, maliyyə bazarlarının tənzimlənməsi və nəzarəti sahəsində mərkəzi bankın struktur bölmələrinin operativ fəaliyyətinin tənzimlənməsini və koordinasiyasını təmin edən kollegial orqandır. Komitənin iclaslarında pul və məzənnə siyasətinin əməliyyat çərçivəsi, pul siyasəti alətlərinin parametrləri, maliyyə sabitliyi üzrə risklərin dərin və hərtərəfli diaqnostikası əsasında makro ve mikro-prudensial siyasət, baş verməsi ehtimal olunan böhran situasiyalarının idarə olunması və tənzimlənməsi üzrə qərarlar üzrə təkliflərə dair İdarə Heyətinə tövsiyələr verilir, həmçinin İdarə Heyətinin səlahiyyətlərinə aid olan məsələlər istisna olmaqla müvafiq qərarlar qəbul edilir. Komitəyə Mərkəzi Bankın Sədri rəhbərlik edir. Komitənin üzvləri Mərkəzi Bankın pul, məzənnə və maliyyə sabitliyi siyasətinin işlənməsi və həyata keçirilməsində bilavasitə iştirak edən blokların rəhbərləridir.</p>',
    assets: [],
  },
  'struktur-bolmeler': {
    id: 235,
    title: 'Struktur bölmələr',
    slug: 'struktur-bolmeler',
    content: null,
    assets: [],
  },
}

/**
 * Kontrakt nümunələri — `specs/024-about-us-redesign/contracts/cms-markup.md` §6.
 * TipTap-ın yazdığı formadadır (cədvəl `colgroup/tbody/td colspan`, accordion `data-accordion`).
 */
export const aboutContractHtml = {
  main: [
    '<p>Azərbaycan Respublikasının Milli Bankı 1992-ci ildə yaradılmışdır.</p>',
    '<table style="min-width: 50px"><colgroup><col><col></colgroup><tbody>',
    '<tr><td colspan="1" rowspan="1"><p>11.02.1992</p></td><td colspan="1" rowspan="1"><p>“Azərbaycan Respublikası Milli Bankının yaradılması haqqında” Fərman</p></td></tr>',
    '<tr><td colspan="1" rowspan="1"><p>10.12.2004</p></td><td colspan="1" rowspan="1"><p>“Azərbaycan Respublikasının Mərkəzi Bankı haqqında” Qanun</p></td></tr>',
    '</tbody></table>',
    '<blockquote><h3>Mərkəzi Bankın məqsədləri</h3><p>Əsas məqsəd qiymətlərin sabitliyidir.</p></blockquote>',
    '<h2>Mərkəzi Bankın funksiyaları</h2>',
    '<details data-accordion=""><summary>Pul və məzənnə siyasəti</summary><div data-type="details-content"><p>Birinci funksiya.</p></div></details>',
    '<details data-accordion=""><summary>Rəsmi məzənnə</summary><div data-type="details-content"><p>İkinci funksiya.</p></div></details>',
    '<h2>Mərkəzi Bankın hesabatlılığı</h2><p>Hesabat mətni.</p>',
  ].join(''),
  history: [
    '<h2>Bir əsrdən artıq <em>mərkəzi bankçılıq</em> tarixi</h2>',
    '<table style="min-width: 50px"><colgroup><col><col></colgroup><tbody>',
    '<tr><td colspan="1" rowspan="1"><p>7 mart 1919</p></td><td colspan="1" rowspan="1"><h3>Dövlət Bankının təsis edilməsi haqqında qərar qəbul edilib</h3><p>Hökumət qərar qəbul edib.</p></td></tr>',
    '<tr><td colspan="1" rowspan="1"><p>30 sentyabr 1919</p></td><td colspan="1" rowspan="1"><p><strong>Azərbaycan Dövlət Bankı fəaliyyətə başlayıb</strong></p><p>Açılış mərasimi.</p><p><img src="/media/120" alt="Bina"></p></td></tr>',
    '<tr><td colspan="1" rowspan="1"><p>11 fevral <strong>1992</strong></p></td><td colspan="1" rowspan="1"><h3>Milli Bank yaradılıb</h3><p>Fərman.</p><p><img src="/media/121" alt="Fərman"><img src="/media/122" alt="Bina"></p></td></tr>',
    '<tr><td colspan="1" rowspan="1"><p>Tarixsiz qeyd</p></td><td colspan="1" rowspan="1"><p>İli olmayan sətir.</p></td></tr>',
    '</tbody></table>',
    '<p>Cədvəldən sonrakı mətn.</p>',
  ].join(''),
  mission: [
    '<blockquote><p>Missiyamız - maliyyə sabitliyini təmin etmək</p></blockquote>',
    '<h3>Dürüstlük</h3><p><img src="/media/123" alt=""></p><p>Dürüstlük mətni.</p>',
    '<p><strong>Cavabdehlik</strong></p><p>Cavabdehlik mətni.</p>',
  ].join(''),
}

/**
 * Test mühitinin "Tarix (Kopya)" (`tarix-copy`) məzmunu, 2026-10-22 — spec 026 T005(h).
 * `13 fevral 2026 / ffgfgf` sınaq sətri qəsdən saxlanılıb (research R3): 2026 oxda üçüncü il olur.
 */
export const historyCopyHtml = "<h2>Bir əsrdən artıq <em>mərkəzi bankçılıq</em> tarixi</h2><table style=\"min-width: 50px;\"><colgroup><col style=\"min-width: 25px;\"><col style=\"min-width: 25px;\"></colgroup><tbody><tr><td colspan=\"1\" rowspan=\"1\"><p>7 mart 1919</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Dövlət Bankının təsis edilməsi haqqında qərar qəbul edilib</h3><p>Azərbaycan Respublikası hökuməti Azərbaycan Dövlət Bankının (mərkəzi bankın) təşkil edilməsi haqqında qərar qəbul edib. Sentyabr ayının 16-da isə Azərbaycan Respublikasının parlamenti Azərbaycan Dövlət Bankının Nizamnaməsini qəbul edib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>30 sentyabr 1919</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Azərbaycan Dövlət Bankı fəaliyyətə başlayıb</h3><p>Azərbaycan Dövlət Bankının təntənəli açılış mərasimi keçirilib və həmin gündən etibarən fəaliyyətə başlayıb. “Banklar bankı” olan Azərbaycan Dövlət Bankı ölkədə mövcud olan kredit təşkilatlarının fəaliyyətinə nəzarət edirdi və pul nişanlarının emissiyasını həyata keçirirdi</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>31 may 1920</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Dövlət Bankı Azərbaycan Xalq Bankı adlandırılıb</h3><p>Azərbaycan Xalq Cumhuriyyəti süquta uğradıqdan sonra yeni dövlət quruluşu olan Azərbaycan Sovet Sosialist Respublikasının Maliyyə Komissarlığının 1920-ci il 31 may tarixli Əmri ilə Azərbaycan Dövlət Bankı Azərbaycan Xalq Bankı adlandırıldı</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>13 fevral 2026</p></td><td colspan=\"1\" rowspan=\"1\"><h3>ffgfgf</h3><p>gvbvbvbvbv</p><p></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>1936</p></td><td colspan=\"1\" rowspan=\"1\"><h3>SSRİ Dövlət Bankının Azərbaycan İdarəsi yaradılıb</h3><p>SSRİ Dövlət Bankının Azərbaycan İdarəsi yaradıldı və bu qurum 1991-ci ilin sonlarına kimi fəaliyyət göstərdi</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>fevral 1989</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Qalib Ağayev SSRİ Dövlət Bankının Azərbaycan Respublikası Bankı İdarə Heyətinin sədri təyin edilib</h3><p>Qalib Ağayev SSRİ Dövlət Bankının Azərbaycan Respublikası Bankı İdarə Heyətinin sədri təyin edilib. Azərbaycan öz müstəqilliyini bərpa etdikdən sonra o, 1992-ci ilin noyabr ayınadək Azərbaycan Respublikası Milli Bankının Prezidenti, daha sonra Azərbaycan Respublikası Milli Bankı İdarə Heyətinin sədri vəzifəsini icra edib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>25 may 1991</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Müstəqil bank sisteminin və milli pul vahidinin tədavülünün hüquqi əsasları təsbit edilib</h3><p>Azərbaycan öz müstəqilliyini bərpa etdikdən dərhal sonra qəbul edilmiş qanunvericilik aktlarından biri “Azərbaycan Respublikasının iqtisadi müstəqilliyinin əsasları haqqında” Azərbaycan Respublikasının 1991-ci il 25 may tarixli Konstitusiya Qanununun “Bank sistemi və pul tədavülü” adlanan 14-cü maddəsində Azərbaycanda müstəqil bank sisteminin və milli pul vahidinin tədavülünün hüquqi əsasları təsbit edilib, Milli Bankın statusu və səlahiyyətləri müəyyən edilib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>11 fevral <strong>1992</strong></p></td><td colspan=\"1\" rowspan=\"1\"><h3>Azərbaycan Respublikası Milli Bankı yaradılıb</h3><p>Azərbaycan Respublikası Prezidentinin “Azərbaycan Respublikası Milli Bankının yaradılması haqqında” Fərmanı ilə Azərbaycan Respublikasının Milli Bankı yaradılıb. Fərmanın qüvvəyə mindiyi gün (12 fevral tarixi) Bankın yaradılması günü kimi qeyd edilir</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>7 avqust 1992</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Milli Bank haqqında ilk qanun qəbul edilib</h3><p>Milli Bankın fəaliyyətini tənzimləyən ilk qanun - “Azərbaycan Respublikasının Milli Bankı haqqında” qanun qəbul olunub</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>15 avqust <strong>1992</strong></p></td><td colspan=\"1\" rowspan=\"1\"><h3>Manat dövriyyəyə buraxılıb</h3><p>Azərbaycan Respublikasının milli valyutası – manat dövriyyəyə buraxılıb</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>noyabr 1992</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Cavanşir Abdullayev Milli Bankın İdarə Heyətinin sədri təyin edilib</h3><p>Cavanşir Abdullayev Azərbaycan Respublikası Milli Bankı İdarə Heyətinin sədri təyin edilib və 1993-cü ilin avqust ayınadək bu vəzifəni icra edib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>1 dekabr 1992</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Milli Bankın nizamnaməsi təsdiq edilib</h3><p>Azərbaycan Respublikasının Milli Məclisi tərəfindən “Azərbaycan Respublikasının Milli Bankının Nizamnaməsinin təsdiq edilməsi haqqında” qərar qəbul olunub</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>avqust 1993</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Qalib Ağayev Milli Bankın İdarə Heyətinin sədri vəzifəsinə təyin edilib</h3><p>Qalib Ağayev Azərbaycan Respublikası Milli Bankı İdarə Heyətinin sədri vəzifəsinə təyin edilib və 1994-cü ilin aprel ayınadək bu vəzifəni icra edib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>1 yanvar 1994</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Manat yeganə ödəniş vasitəsi kimi müəyyən edilib</h3><p>Manat ölkənin yeganə ödəniş vasitəsi elan olunmuşdur</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>iyul 1994</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Elman Rüstəmov Milli Bankın İdarə Heyətinin sədri təyin edilib</h3><p>Elman Rüstəmov Azərbaycan Respublikası Milli Bankı İdarə Heyətinin sədri vəzifəsinə təyin edilib. 2009-cu ildə keçirilən referendumdan sonra onun vəzifəsi Azərbaycan Respublikası Mərkəzi Bankının sədri adlandırılıb</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>12 noyabr 1995</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Milli Banka dövlətin müstəqil pul və emissiya siyasətini həyata keçirmək səlahiyyəti təsbit edilib</h3><p>Referendum yolu ilə qəbul olunmuş müstəqil Azərbaycan Respublikasının ilk Konstitusiyasının 19-cu maddəsinin II hissəsində Milli Bank pul nişanlarının tədavülə buraxılması və tədavüldən çıxarılması üzrə müstəsna hüquqa malik qurum kimi müəyyən olunub. Hazırda Mərkəzi Bank öz fəaliyyətini üçüncü nəsil bank qanunları əsasında həyata keçirir (“Azərbaycan Respublikasının Milli Bankı haqqında” Azərbaycan Respublikasının Qanununun ikinci redaksiyası 1996-cı il 14 iyun tarixində, üçüncü redaksiyası 2004-cü il 10 dekabr tarixində qəbul edilmişdir)</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>6 oktyabr 1998</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Bakı şəhəri, Rəşid Behbudov küçəsi, 90 ünvanında yerləşən inzibati bina istifadəyə verilib</h3><p>Mərkəzi Bankın əvvəl fəaliyyət göstərdiyi, Bakı şəhəri, Rəşid Behbudov küçəsi, 90 ünvanında yerləşən inzibati binası istifadəyə verilmişdir. Yeni binanın təntənəli açılışında Azərbaycan xalqının Ümummilli Lideri Heydər Əliyev və digər dövlət rəsmiləri iştirak etmişdir</p><p><img src=\"/media/657\" alt=\"foto_1\"></p><p><img src=\"/media/658\" alt=\"foto_2\"></p><p><img src=\"/media/659\" alt=\"foto_3\"></p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>7 fevral <strong>2005</strong></p></td><td colspan=\"1\" rowspan=\"1\"><h3>Yeni manata keçid edilib</h3><p>Azərbaycan Respublikası Prezidentinin “Azərbaycan Respublikasında pul nişanlarının nominal dəyərinin və qiymətlər miqyasının dəyişdirilməsi (denominasiyası) haqqında” Fərmanına əsasən, 2006-cı il yanvarın 1-dən etibarən yeni manatın tədavülünə başlanılmışdır. Bununla əlaqədar, 1 yeni manat 5000 manata bərabər edilmiş, mövcud manat yeni manatla birgə 2006 il ərzində dövriyyədə saxlanılmış, 2007-ci il yanvarın 1-dən isə tamamilə yeni manata keçilmiş, yeni manatların əskinasları və qəpiklik sikkələr mərhələlərlə dövriyyəyə buraxılmışdır.</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>18 mart <strong>2009</strong></p></td><td colspan=\"1\" rowspan=\"1\"><h3>Milli Bank Mərkəzi Bank adlandırılıb</h3><p>Dövlətin mərkəzi bankı funksiyasının həyata keçirilməsi bankın adına da yenidən baxılmasını şərtləndirib və “Azərbaycan Respublikasının Konstitusiyasına əlavələr və dəyişikliklər edilməsi haqqında” Azərbaycan Respublikasının Referendum Aktının qüvvəyə minməsi ilə o, “Azərbaycan Respublikasının Mərkəzi Bankı” kimi adlandırılıb</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>4 mart 2016</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Səlahiyyətlərdə dəyişikliklər edilib</h3><p>İqtisadi və institusional islahatlar çərçivəsində Mərkəzi Bankın səlahiyyətlərinə dəyişikliklər edilmişdir. Belə ki, “Azərbaycan Respublikasının Mərkəzi Bankı haqqında” Azərbaycan Respublikasının Qanununa qəbul edilmiş dəyişikliklərə uyğun olaraq bank fəaliyyətinin lisenziyalaşdırılması və tənzimlənməsi, bank fəaliyyətinə nəzarət funksiyaları yeni yaradılmış quruma verilmişdir. Bundan sonra Mərkəzi Bankın səlahiyyətləri əsasən pul-məzənnə siyasəti, makroiqtisadi və maliyyə sabitliyi siyasətinə dəstək verilməsi, banklararası mərkəzləşdirilmiş və digər lisenziyalaşdırılmayan ödəniş sistemlərinin tənzimlənməsi və inkişafının təmin edilməsi, nağd pul dövriyyəsinin təşkili istiqamətlərinə fokuslaşmışdır</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>28 noyabr 2019</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Maliyyə bazarlarının tənzimlənməsi Mərkəzi Banka həvalə edilib</h3><p>“Maliyyə xidmətləri bazarında tənzimləmə və nəzarət sisteminin idarəedilməsinin təkmilləşdirilməsi haqqında” Azərbaycan Respublikası Prezidentinin Sərəncamı ilə Azərbaycan Respublikasının qanunlarında maliyyə bazarlarına nəzarət orqanının müəyyən edilmiş səlahiyyətləri, o cümlədən onun maliyyə xidmətləri bazarında lisenziyalaşdırma, tənzimləmə və nəzarət, investorların və maliyyə xidmətləri istehlakçılarının hüquqlarının qorunması sahəsində vəzifə və hüquqları Azərbaycan Respublikasının Mərkəzi Bankına verilmişdir</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>aprel 2022</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Taleh Kazımov Mərkəzi Bankın sədri vəzifəsinə təyin edilib</h3><p>Taleh Kazımov aprel ayının 12-də Azərbaycan Respublikası Milli Məclisinin qərarı ilə Azərbaycan Respublikası Mərkəzi Bankı İdarə Heyətinin üzvü, Azərbaycan Respublikası Prezidentinin 13 aprel 2022-ci il tarixli Sərəncamı ilə Mərkəzi Bankın sədri vəzifəsinə təyin edilib</p></td></tr><tr><td colspan=\"1\" rowspan=\"1\"><p>3 iyun 2026</p></td><td colspan=\"1\" rowspan=\"1\"><h3>Heydər Əliyev 167 ünvanında yerləşən yeni inzibati bina istifadəyə verilib</h3><p>Mərkəzi Bank Bakı şəhəri, Nizami rayonu, Heydər Əliyev prospekti, 167 ünvanında yerləşən inzibati binası istifadəyə verilib. Yeni binanın təntənəli açılışında Azərbaycan Respublikasının prezidenti İlham Əliyev iştirak edib</p></td></tr></tbody></table><p></p>"
