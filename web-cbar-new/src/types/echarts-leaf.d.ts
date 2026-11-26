/**
 * `echarts/lib/…` leaf modulları üçün tip bəyanları (spec 003 FR-014).
 *
 * ECharts tipləri yalnız barrel giriş nöqtələri üçün gəlir — paket kökündə
 * `core.d.ts`, `charts.d.ts`, `components.d.ts`, `renderers.d.ts` var, `lib/`
 * altındakı leaf modullar üçün heç bir `.d.ts` yoxdur. `src/widgets/chart-card/chart.tsx`
 * məhz leaf modulları import edir, çünki barrel dinamik `import()`-də tree-shake
 * olunmur və bütün chart tiplərini (xəritə, dataZoom, toolbox) bundle-a gətirir.
 *
 * Chart və komponent modulları **yan təsirlidir**: heç bir dəyər ixrac etmirlər, öz
 * sonlarında `use(install)` çağırırlar. Ona görə boş modul bəyanı düzgün təsvirdir.
 *
 * Renderer istisnadır — `install` funksiyası ixrac edir və qeydiyyatı özü etmir.
 * Tipi barrel-dən götürülür (`import type` build-də silinir, runtime-a təsir etmir),
 * beləliklə `core.use(...)` gözlədiyi tiplə birə-bir uyğun gəlir.
 */

declare module 'echarts/lib/chart/line' {}
declare module 'echarts/lib/chart/bar' {}
declare module 'echarts/lib/component/grid' {}
declare module 'echarts/lib/component/tooltip' {}
declare module 'echarts/lib/component/legend' {}

declare module 'echarts/lib/renderer/installCanvasRenderer' {
  export const install: typeof import('echarts/renderers').CanvasRenderer
}
