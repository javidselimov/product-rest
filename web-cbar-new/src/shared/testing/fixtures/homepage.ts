import type { Homepage } from '@/features/homepage/model/schemas'

export const homepageFixture: Homepage = {
  banners: [
    {
      title: 'Yubiley sikkələri',
      description: 'Yeni buraxılış — 2026',
      link: 'https://www.e-cbar.az/coins',
      imageUrl: null,
    },
    {
      title: 'Maliyyə savadlılığı',
      description: null,
      link: 'https://savadli.az',
      imageUrl: null,
    },
    {
      title: 'Kredit bürosu',
      description: null,
      link: 'https://acb.az',
      imageUrl: null,
    },
  ],
  newsSlider: [
    {
      title: 'Uçot dərəcəsi dəyişməz saxlanılıb',
      description: 'İdarə Heyətinin qərarı',
      link: '/press-releases/ucot-derecesi',
      imageUrl: '/media/501',
      newsDate: '2026-09-10',
    },
    {
      title: 'Yeni əskinaslar dövriyyəyə buraxılır',
      description: null,
      link: null,
      imageUrl: null,
      newsDate: '2026-09-08',
    },
    {
      title: 'Beynəlxalq konfrans',
      description: 'Bakı, 2026',
      link: 'https://conference.example.az',
      imageUrl: '/media/503',
      newsDate: '2026-09-01',
    },
  ],
  runningLines: ['USD 1.7000', 'EUR 1.9850'],
  links: [
    { title: 'Məzənnə kalkulyatoru', url: '/currencies' },
    { title: 'E-CBAR', url: 'https://www.e-cbar.az/' },
  ],
  publications: [
    {
      title: 'İllik hesabat 2025',
      url: '/media/601',
      imageUrl: '/media/602',
      publishedAt: '2026-06-01',
    },
    {
      title: 'Pul siyasəti icmalı',
      url: 'https://cbar.az/pub',
      imageUrl: null,
      publishedAt: '2026-07-15',
    },
  ],
  // Spec 057: by sort order; the site shows the first three. A site path has no locale prefix.
  strategyDocs: [
    {
      id: 1,
      title: '2024-2026-cı illərdə maliyyə sektorunun inkişaf Strategiyası',
      summary: null,
      coverUrl: '/media/701',
      href: '/maliyye-sektorunun-inkisaf-strategiyasi',
    },
    {
      id: 2,
      title: 'Risk əsaslı nəzarət üzrə Siyasət Konsepsiyası',
      summary: 'Qısa mətn',
      coverUrl: null,
      href: 'https://www.cbar.az/strategy.pdf',
    },
    {
      id: 3,
      title: 'Mikromaliyyə Modeli üzrə Strateji Çərçivə',
      summary: null,
      coverUrl: null,
      href: '/mikromaliyye-modeli-uzre-strateji-cercive',
    },
    { id: 4, title: 'Dördüncü sənəd', summary: null, coverUrl: null, href: '/dorduncu-sened' },
  ],
  infoLines: [
    {
      alias: 'corridor_min',
      items: [{ title: 'Aşağı hədd', value: '6,25%', year: 2026, updatedAt: '2026-09-20T08:00:00Z' }],
    },
    {
      alias: 'corridor_max',
      items: [{ title: 'Yuxarı hədd', value: '8,25%', year: 2026, updatedAt: '2026-09-20T08:00:00Z' }],
    },
    {
      alias: 'corridor_percent',
      items: [{ title: 'Uçot dərəcəsi', value: '7,25%', year: 2026, updatedAt: '2026-09-25T08:00:00Z' }],
    },
    {
      alias: 'money_reserve_usd',
      items: [
        { title: 'Valyuta ehtiyatları', value: '12,3 mlrd USD', year: 2026, updatedAt: '2026-09-01T08:00:00Z' },
      ],
    },
    {
      alias: 'money_base',
      items: [{ title: 'Pul bazası', value: '25,1 mlrd AZN', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    {
      alias: 'nots_volume',
      items: [{ title: 'Notların həcmi', value: '3,4 mlrd AZN', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    {
      alias: 'nots_levels_28',
      items: [{ title: '28 gün', value: '7,10%', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    {
      alias: 'nots_levels_84',
      items: [{ title: '84 gün', value: '7,20%', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    {
      alias: 'bank_credit',
      items: [{ title: 'Kredit portfeli', value: '30,2 mlrd AZN', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    {
      alias: 'bank_nation',
      items: [{ title: 'Bankların sayı', value: '23', year: 2026, updatedAt: '2026-09-01T08:00:00Z' }],
    },
    { alias: 'empty_group', items: [] },
  ],
}
