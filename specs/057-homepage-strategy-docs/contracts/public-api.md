# Public API kontraktı — `api-cbar` (spec 057)

Yeni endpoint yoxdur. Mövcud `GET /api/v1/homepage?locale=az|en` cavabına bir sahə əlavə olunur. Qalan sahələr dəyişmir (Konstitusiya VII.3).
OpenAPI: `api-cbar/openapi/paths/homepage.yaml` (təsvir) və `components/schemas/homepage.yaml#/Homepage`, `#/StrategyDoc` (yeni).

## `GET /api/v1/homepage?locale=`

```jsonc
{
  "banners": [ … ],
  "newsSlider": [ … ],
  "runningLines": [ … ],
  "links": [ … ],
  "publications": [ … ],
  "infoLines": [ … ],
  "strategyDocs": [                       // NEW. Always present, may be []
    {
      "id": 1,
      "title": "2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası",
      "summary": null,                    // string | null
      "coverUrl": "/media/812",           // string | null: this locale's cover, else the other locale's
      "href": "/maliyye-sektorunun-inkisaf-strategiyasi"   // "/…" site path without the locale, or "http(s)://…"
    }
  ]
}
```

### `StrategyDoc`

| Sahə | Tip | Qayda |
|---|---|---|
| `id` | integer | sabit açar. Sayt `key` kimi işlədir |
| `title` | string | həmin dildəki başlıq, boş olmur |
| `summary` | string \| null | həmin dildəki qısa mətn |
| `coverUrl` | string \| null | `"/media/{id}"`. Dil fallback-i serverdədir (data-model "Görünürlük qaydası") |
| `href` | string | həmişə dolu. Daxili ünvan dilsiz `/…`-dir (sayt prefiks verir), xarici ünvan `http(s)://…` |

### Filtr və sıra

`data-model.md` → "Görünürlük qaydası": dərc olunub, silinməyib, dildə tərcüməsi var, `href` həll olunur. Sıra `sort_order`, sonra `id`. **Say
məhdudlaşdırılmır**: sayt ilk 3-ü götürür (research R6).

### Səhifə görünürlüyü

`href` səhifədən qurulanda səhifə `PagesController.GetBySlug`-ın açacağı səhifə olmalıdır: `Status = Published`, `Active`, dilə görə
`ShowAz`/`ShowEn`, həmin dildə slug. Belə olmayan səhifəyə link verən sənəd (dildə `url` də yoxdursa) cavaba düşmür. Saytda işləməyən kart olmur
(SC-005).

### Uyğunluq

- Köhnə sayt versiyası sahəni görmür (`passthrough`). Yeni sayt versiyası sahə olmayan köhnə API ilə işləyir (`default([])` → blok gizlənir).
- Yeni sorğu yoxdur. Cavab saytda `cachedJson` ilə 10 s keşlənir (tag `homepage`), bu, digər ana səhifə blokları ilə eynidir.
