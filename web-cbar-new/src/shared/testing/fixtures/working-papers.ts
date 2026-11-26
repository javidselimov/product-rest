/**
 * Working paper fixtures (spec 054), built from the legacy list's titles (`.tmp-pubs/gen-wp-fixture.mjs`) plus the two Figma 2026
 * samples. The API order: year, then number, descending. 02/2025 is the full paper of the legacy page `page-895`; one paper is
 * az only; every seventh has no keywords.
 */
import type { WorkingPaperDetailDto, WorkingPaperListItemDto } from '@/features/working-papers/model/schemas'

export const workingPapersAz: WorkingPaperListItemDto[] = [
  {
    "id": 100,
    "number": 2,
    "year": 2026,
    "code": "02/2026",
    "key": "02-2026",
    "language": "en",
    "title": "Azərbaycanda monetar siyasətin ötürülmə mexanizminin qiymətləndirilməsi",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 101,
    "number": 1,
    "year": 2026,
    "code": "01/2026",
    "key": "01-2026",
    "language": "az",
    "title": "Qeyri-neft ixracının real effektiv məzənnəyə həssaslığı",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 102,
    "number": 2,
    "year": 2025,
    "code": "02/2025",
    "key": "02-2025",
    "language": "en",
    "title": "Likvidlik şəraitindən asılı overnayt banklararası faiz dərəcəsinin dəyişkənliyi: əsas determinantlar və siyasət tövsiyələri",
    "authors": [
      "Elmir Muxtarov",
      "Əli Hacılı",
      "Aygün Qarayeva",
      "Vüqar Əhmədov"
    ],
    "keywords": [
      "banklararası pul bazarında overnayt faizlər",
      "məcburi ehtiyatlar",
      "Markov rejim dəyişmə modeli",
      "likvidlik şəraiti"
    ]
  },
  {
    "id": 103,
    "number": 1,
    "year": 2025,
    "code": "01/2025",
    "key": "01-2025",
    "language": "en",
    "title": "Azərbaycanda potensial qeyri-neft ÜDM-in qiymətləndirilməsi",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": []
  },
  {
    "id": 104,
    "number": 4,
    "year": 2024,
    "code": "04/2024",
    "key": "04-2024",
    "language": "en",
    "title": "Qeyri-neft ÜDM-nin qısamüddətli proqnozlaşdırılması modellərin qurulması",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 105,
    "number": 3,
    "year": 2024,
    "code": "03/2024",
    "key": "03-2024",
    "language": "az",
    "title": "İdxal çəkiləri nəzərə alınmaqla hesablanmış qlobal ərzaq qiymətlərinin proqnozlaşdırılması",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 106,
    "number": 2,
    "year": 2024,
    "code": "02/2024",
    "key": "02-2024",
    "language": "en",
    "title": "Supermarket məlumatları əsasında Azərbaycanda inflyasiyanın tələb və təklif komponentlərinin müəyyənləşdirilməsi",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 107,
    "number": 1,
    "year": 2024,
    "code": "01/2024",
    "key": "01-2024",
    "language": "en",
    "title": "Azərbaycanın Rüblük Proqnozlaşdırma Modeli (AzİM 1.0)",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 108,
    "number": 4,
    "year": 2023,
    "code": "04/2023",
    "key": "04-2023",
    "language": "en",
    "title": "Bayes əsaslı VAR modelləri ilə inflyasiyanın qısamüddətli proqnozu: Azərbaycan nümunəsi",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 109,
    "number": 3,
    "year": 2023,
    "code": "03/2023",
    "key": "03-2023",
    "language": "az",
    "title": "Maliyyə inklüzivliyi və iqtisadi artım arasında əlaqə: Azərbaycan nümunəsi",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 110,
    "number": 2,
    "year": 2023,
    "code": "02/2023",
    "key": "02-2023",
    "language": "en",
    "title": "Neytral faiz dərəcəsinin qiymətləndirilməsi: Azərbaycan nümunəsi",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": []
  },
  {
    "id": 111,
    "number": 1,
    "year": 2023,
    "code": "01/2023",
    "key": "01-2023",
    "language": "en",
    "title": "Azərbaycanda real effektiv məzənnənin qeyri-neft ixracına təsiri",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 112,
    "number": 2,
    "year": 2022,
    "code": "02/2022",
    "key": "02-2022",
    "language": "en",
    "title": "Azərbaycanda iqlim dəyişikliklərinin inflyasiyaya təsirinin qiymətləndirilməsi",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 113,
    "number": 1,
    "year": 2022,
    "code": "01/2022",
    "key": "01-2022",
    "language": "az",
    "title": "Ödəniş məlumatları əsasında ÜDM-in naukastinqi modelinin qurulması",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 114,
    "number": 2,
    "year": 2021,
    "code": "02/2021",
    "key": "02-2021",
    "language": "en",
    "title": "",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 115,
    "number": 1,
    "year": 2021,
    "code": "01/2021",
    "key": "01-2021",
    "language": "en",
    "title": "Azərbaycanda ev təsərrüfatlarının son istehlak xərclərinin naukastinqi",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 116,
    "number": 2,
    "year": 2020,
    "code": "02/2020",
    "key": "02-2020",
    "language": "en",
    "title": "Azərbaycanda cari əməliyyatlar balansı komponentlərinin qiymətləndirilməsi və proqnozlaşdırılması",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 117,
    "number": 1,
    "year": 2020,
    "code": "01/2020",
    "key": "01-2020",
    "language": "az",
    "title": "Azərbaycanda istehlakçı qiymətləri indeksinin komponentləri üçün proqnozlaşdırma modelləri",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": []
  },
  {
    "id": 118,
    "number": 3,
    "year": 2019,
    "code": "03/2019",
    "key": "03-2019",
    "language": "en",
    "title": "Azərbaycanın inflyasiyasını və məcmu buraxılışının faktorla gücləndirilmiş vektor avtoreqressiv (FAVAR) model ilə modelləşdirilməsi",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 119,
    "number": 2,
    "year": 2019,
    "code": "02/2019",
    "key": "02-2019",
    "language": "en",
    "title": "Azərbaycanın real effektiv məzənnəsinin tarazlıq səviyyəsinin davranış modeli əsasında qiymətləndirilməsi",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 120,
    "number": 1,
    "year": 2019,
    "code": "01/2019",
    "key": "01-2019",
    "language": "en",
    "title": "Neft ixrac edən ölkələrdə pul və fiskal siyasətlərinin arasında qarşılıqlı əlaqə varmı? Azərbaycan təcrübəsi",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 121,
    "number": 2,
    "year": 2018,
    "code": "02/2018",
    "key": "02-2018",
    "language": "az",
    "title": "Xarici şokların Azərbaycan iqtisadiyyatına təsiri",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 122,
    "number": 1,
    "year": 2018,
    "code": "01/2018",
    "key": "01-2018",
    "language": "en",
    "title": "Neft qiymətləri və inflyasiya: Neft ixracatçıları üçün kanalların müəyyənləşdirilməsi",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 123,
    "number": 5,
    "year": 2017,
    "code": "05/2017",
    "key": "05-2017",
    "language": "en",
    "title": "Maliyyə əmsalları və müflis olmanın proqnozu",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflyasiya",
      "proqnozlaşdırma"
    ]
  },
  {
    "id": 124,
    "number": 4,
    "year": 2017,
    "code": "04/2017",
    "key": "04-2017",
    "language": "en",
    "title": "Neftlə zəngin ölkələrdə struktur büdcə balansı: Azərbaycan, Qazaxıstan və Rusiya nümunəsi",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": []
  }
]

export const workingPapersEn: WorkingPaperListItemDto[] = [
  {
    "id": 102,
    "number": 2,
    "year": 2025,
    "code": "02/2025",
    "key": "02-2025",
    "language": "en",
    "title": "Overnight Interbank Rate Volatility Across Liquidity States: Key Drivers and Policy Implications",
    "authors": [
      "Elmir Mukhtarov",
      "Ali Hajili",
      "Aygün Qarayeva",
      "Vüqar Əhmədov"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 103,
    "number": 1,
    "year": 2025,
    "code": "01/2025",
    "key": "01-2025",
    "language": "en",
    "title": "Estimating Potential Non-Oil GDP in Azerbaijan",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": []
  },
  {
    "id": 104,
    "number": 4,
    "year": 2024,
    "code": "04/2024",
    "key": "04-2024",
    "language": "en",
    "title": "Development of Short-term Forecasting Models for Non-oil GDP",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 105,
    "number": 3,
    "year": 2024,
    "code": "03/2024",
    "key": "03-2024",
    "language": "az",
    "title": "Forecasting of Global Food Prices Adjusted for Import Weights",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 106,
    "number": 2,
    "year": 2024,
    "code": "02/2024",
    "key": "02-2024",
    "language": "en",
    "title": "Decomposition of inflation in Azerbaijan into supply and demand components based on supermarket data",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 107,
    "number": 1,
    "year": 2024,
    "code": "01/2024",
    "key": "01-2024",
    "language": "en",
    "title": "Quarterly Projection Model of Azerbaijan (AzIM 1.0)",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 108,
    "number": 4,
    "year": 2023,
    "code": "04/2023",
    "key": "04-2023",
    "language": "en",
    "title": "Short-term inflation forecasting models with Bayesian VAR: Evidence from Azerbaijan",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 109,
    "number": 3,
    "year": 2023,
    "code": "03/2023",
    "key": "03-2023",
    "language": "az",
    "title": "The relationship between financial inclusion and economic growth: the case of Azerbaijan",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 110,
    "number": 2,
    "year": 2023,
    "code": "02/2023",
    "key": "02-2023",
    "language": "en",
    "title": "Estimating Natural Rate of Interest. The Case for Azerbaijan",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": []
  },
  {
    "id": 111,
    "number": 1,
    "year": 2023,
    "code": "01/2023",
    "key": "01-2023",
    "language": "en",
    "title": "The impact of real effective exchange rate on non-oil exports in Azerbaijan",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 112,
    "number": 2,
    "year": 2022,
    "code": "02/2022",
    "key": "02-2022",
    "language": "en",
    "title": "Response of Inflation to the Climate Stress: Evidence from Azerbaijan",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 113,
    "number": 1,
    "year": 2022,
    "code": "01/2022",
    "key": "01-2022",
    "language": "az",
    "title": "Using National Payment System Data to Nowcast Economic Activity in Azerbaijan",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 115,
    "number": 1,
    "year": 2021,
    "code": "01/2021",
    "key": "01-2021",
    "language": "en",
    "title": "Nowcasting Household Consumption in Azerbaijan",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 116,
    "number": 2,
    "year": 2020,
    "code": "02/2020",
    "key": "02-2020",
    "language": "en",
    "title": "Estimation and forecast of the current account balance components in Azerbaijan",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 117,
    "number": 1,
    "year": 2020,
    "code": "01/2020",
    "key": "01-2020",
    "language": "az",
    "title": "Forecasting Models for Components of the Consumer Price Index in Azerbaijan",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": []
  },
  {
    "id": 118,
    "number": 3,
    "year": 2019,
    "code": "03/2019",
    "key": "03-2019",
    "language": "en",
    "title": "Modeling Azerbaijan’s Inflation and Output Using a Factor-Augmented Vector Autoregressive (FAVAR) Model",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 119,
    "number": 2,
    "year": 2019,
    "code": "02/2019",
    "key": "02-2019",
    "language": "en",
    "title": "Estimation of Equilibrium Level of Real Effective Exchange Rate of Azerbaijan Using Behavioral Effective Exchange Rate Model",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 120,
    "number": 1,
    "year": 2019,
    "code": "01/2019",
    "key": "01-2019",
    "language": "en",
    "title": "Do monetary and fiscal policies interact in oil-exporting countries? Evidence from Azerbaijan",
    "authors": [
      "Rauf Muradzadə",
      "Orxan Hüseynov"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 121,
    "number": 2,
    "year": 2018,
    "code": "02/2018",
    "key": "02-2018",
    "language": "az",
    "title": "The effects of external shocks on Azerbaijan economy",
    "authors": [
      "Leyla Əliyeva",
      "Nigar Qasımova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 122,
    "number": 1,
    "year": 2018,
    "code": "01/2018",
    "key": "01-2018",
    "language": "en",
    "title": "Oil Prices and Inflation: Identifying Channels for Oil Exporters",
    "authors": [
      "Orxan Hüseynov",
      "Səbinə İsmayılova"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 123,
    "number": 5,
    "year": 2017,
    "code": "05/2017",
    "key": "05-2017",
    "language": "en",
    "title": "Financial ratios and the prediction of bankruptcy",
    "authors": [
      "Nigar Qasımova",
      "Rauf Muradzadə"
    ],
    "keywords": [
      "inflation",
      "forecasting"
    ]
  },
  {
    "id": 124,
    "number": 4,
    "year": 2017,
    "code": "04/2017",
    "key": "04-2017",
    "language": "en",
    "title": "Structural Budget Balances in Oil-rich Countries: The Cases of Azerbaijan, Kazakhstan, and Russia",
    "authors": [
      "Səbinə İsmayılova",
      "Leyla Əliyeva"
    ],
    "keywords": []
  }
]

const base = workingPapersAz.find((p) => p.key === '02-2025')!

export const workingPaperDetailAz: WorkingPaperDetailDto = {
  ...base,
  abstract:
    'Effektiv pul siyasətinin həyata keçirilməsi üçün qısamüddətli banklararası faiz dərəcəsinin siyasət faiz dərəcəsinə yaxın səviyyədə idarə olunması vacibdir.\nTədqiqat nəticəsində kumulyativ rezerv mövqeyinin öz trendindən kənarlaşması banklararası faiz dərəcələrinin dəyişkənliyinə əhəmiyyətli təsir göstərir.',
  jelCodes: ['C22', 'E53', 'E58', 'G21'],
  file: { mediaId: 2210, originalName: 'c404c319f12b7d12586dae457.pdf', mimeType: 'application/pdf', sizeBytes: 2_002_780, url: '/media/2210' },
}

/** A paper with no keywords, no JEL codes, no abstract and no file: every optional block drops. */
export const workingPaperBareAz: WorkingPaperDetailDto = {
  ...workingPapersAz.find((p) => p.keywords.length === 0)!,
  abstract: null,
  jelCodes: [],
  file: null,
}
