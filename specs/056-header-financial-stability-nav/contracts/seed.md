# Seed contract: `0042-financial-stability-nav-seed.sql` (spec 056)

`api-cbar-admin/db/migrations/`, bir `DO $seed$ … $seed$` bloku. Nümunə `0041-publications-tree-seed.sql`-dır. Məlumat
[data-model.md](../data-model.md)-dədir.

## Qaydalar

1. **İmtiyaz**: `pages`, `page_translations`, `page_details` üzrə `INSERT`/`UPDATE` yoxdursa `RAISE WARNING` və çıxış. Startup
   bloklanmır.
2. **Tapma**: səhifə yalnız az slug + `deleted_at IS NULL` ilə tapılır, id ilə yox. Kök `pul-siyaseti` yoxdursa (köhnə ağac
   yüklənməyib) seed `NOTICE` ilə çıxır.
3. **Mərhələ A** ("Maliyyə sabitliyi"):
   - kök az slug `maliyye-sabitliyi` ilə yoxdursa yaradılır: `parent_id NULL`, `path = text2ltree(id)`, `status 'published'`, az/en
     tərcümə, boş `content`;
   - köçürmə yalnız kökü yaradan icrada olur: 64 və 65 yalnız valideyni hələ `nesrler-ve-tedqiqatlar`-dırsa, 113 yalnız hələ
     kökdürsə köçür. `path` alt ağacla yenilənir:
     `new_path || subpath(path, nlevel(old_path))`;
   - 64/65 `page_details.show_in_side_nav = true` alır (`ON CONFLICT DO UPDATE`), yalnız köçdükləri icrada. 459
     (`dayaniqli-maliyye-copy`) `false` alır (`ON CONFLICT DO NOTHING`).
4. **Mərhələ B** ("Rəqəmsal maliyyə ekosistemi"): kök yoxdursa 8 uşağı ilə yaradılır. Uşaq sırası `10…80`-dir. Dildə tutulmuş
   slug `-2` alır.
5. **Mərhələ C**: yalnız A və ya B bu icrada kök yaradıbsa işləyir.
   - Köklərin `sort_order`-i data-model-dəki siyahı ilə `(n) * 10` olur. Siyahıda olmayan köklər `(N + rn) * 10` alır, öz
     sıraları ilə.
   - 4 kök (`maliyye-sektorunun-inkisaf-strategiyasi`, `melumatlarin-yayimlanmasi-qrafiki`, `sual-cavab`, `istinadlar`)
     `page_details.show_in_side_nav = false` alır (`ON CONFLICT DO UPDATE`).
6. **Hesabat**: hər mərhələ `RAISE NOTICE 'spec 056: …'` ilə yaradılan, köçən və dəyişən sayı yazır.
7. **Toxunulmaz**: mövcud səhifələrin başlığı, mətni, slug-ı, faylları. Heç nə silinmir. Cədvəl strukturu dəyişmir.

## Təkrar icra

İkinci icrada A və B heç nə yaratmır, C işləmir: 0 sətir dəyişir. Redaktorun sonradan dəyişdiyi sıra və bayraqlar qalır.

## Yoxlama (PGlite, quickstart §1)

- Boş baza (yalnız `seed.sql`): kök `pul-siyaseti` yoxdur, seed `NOTICE 'spec 056: no legacy page tree, seed skipped'` ilə heç nə
  yaratmadan çıxır (0041 nümunəsi). Xəta olmamalıdır.
- Test API ağacının surəti: gözlənən ağac və sıra (data-model), 4 bayraq, 64/65/113 yeni valideyndə.
- İkinci icra: 0 dəyişiklik.
- Redaktor bayrağı "Hər yerdə"yə qaytarandan sonra yenidən icra: bayraq qalır.
