// Ana səhifə birinci ekranının miqyası — `src/widgets/hero-scale/hero-scale-script.tsx`.
//
// Birinci ekran (slayder + sağ panel) Figma piksellərində 744px hündürlükdədir və desktop-da
// `zoom: var(--hero-scale)` ilə header-dən sonra qalan ekran hündürlüyünə miqyaslanır. Brauzer
// zoom-u da `resize` atır, ona görə dəyər hər dəfə yenidən hesablanır. Fayl hero-dan əvvəl
// sinxron yüklənir ki, ilk boyamada dəyər artıq olsun. JS-siz `var(--hero-scale, 1)` — Figma ölçüsü.
;(function () {
  var FIGMA_HEIGHT = 744
  // Sağ panel (424) + aralıq (24) ekran eninin 40%-indən enli olmasın — slayder çox daralmasın.
  var PANEL_WIDTH = 448
  var PANEL_SHARE = 0.4
  var MIN_SCALE = 0.5

  function update() {
    var header = document.querySelector('[data-slot="site-header"]')
    var headerHeight = header ? header.getBoundingClientRect().height : 0
    var byHeight = (window.innerHeight - headerHeight) / FIGMA_HEIGHT
    var byWidth = (PANEL_SHARE * window.innerWidth) / PANEL_WIDTH
    var scale = Math.max(MIN_SCALE, Math.min(byHeight, byWidth))
    document.documentElement.style.setProperty('--hero-scale', scale.toFixed(4))
  }

  update()
  window.addEventListener('resize', update)
})()
