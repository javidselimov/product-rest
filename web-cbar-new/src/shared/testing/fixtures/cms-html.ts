/**
 * Legacy cbar.az markup fikstürü (spec 002 SC-003, research R7).
 *
 * Sayılan elementlər: accordion ×2, cədvəl ×1, media keçidi ×1, şəkil ×1,
 * YouTube ×1, ümumi iframe ×1; zərərli: `<script>` ×1, `onclick` ×1, `javascript:` ×1.
 */
export const legacyCmsHtml = `
<h2>Pul siyasəti</h2>
<p>Mərkəzi Bankın əsas məqsədi <a href="/media/12">qiymət sabitliyi</a>dir.</p>
<img src="/media/34" alt="Diaqram">
<details data-accordion="true">
  <summary>Faiz dəhlizi</summary>
  <div data-type="details-content"><p>Aşağı və yuxarı hədd.</p></div>
</details>
<details data-accordion="true">
  <summary>Açıq bazar əməliyyatları</summary>
  <div data-type="details-content"><p>Notlar və depozit hərracları.</p></div>
</details>
<div class="tableWrapper"><table><tbody><tr><th>Göstərici</th><th>Dəyər</th></tr><tr><td>Uçot dərəcəsi</td><td>7,25%</td></tr></tbody></table></div>
<div data-youtube-video="true"><iframe src="https://www.youtube.com/embed/abc123" allowfullscreen></iframe></div>
<iframe src="https://maps.example.az/embed" title="Xəritə"></iframe>
<script>alert('xss')</script>
<p onclick="alert(1)" style="color: inherit">Klik</p>
<a href="javascript:alert(2)">Zərərli keçid</a>
<a href="JaVaScRiPt&#58;alert(3)">Gizli zərərli keçid</a>
`

export const legacyCounts = {
  accordions: 2,
  tables: 1,
  mediaLinks: 1,
  images: 1,
  youtube: 1,
  iframes: 2,
} as const
