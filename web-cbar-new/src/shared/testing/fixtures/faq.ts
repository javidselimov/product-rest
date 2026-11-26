/** FAQ fixtures (spec 051): a small slice of the seed — a topic of six questions, a table answer, one video. */
import type { FaqDto, FaqTopicLinkDto } from '@/features/faq/model/schemas'

export const faqAz: FaqDto = {
  topics: [
    {
      slug: 'pul-siyaseti',
      name: 'Pul siyasəti',
      questions: [
        { id: 101, question: 'Pul siyasəti nədir?', answer: '<p>Pul siyasəti əsasən qiymətlərin sabitliyinin təmin edilməsi məqsədilə həyata keçirilən tədbirlər sistemidir.</p>' },
        { id: 102, question: 'İnflyasiya və deflyasiya nədir?', answer: '<p>İnflyasiya qiymətlərin ümumi səviyyəsinin qalxmasıdır.</p>' },
        { id: 103, question: 'REPO və əks-REPO nədir?', answer: '<p>REPO qiymətli kağızların geri alınması şərti ilə satışıdır.</p>' },
      ],
    },
    {
      slug: 'odenis-xidmetleri-ve-odenis-sistemleri',
      name: 'Ödəniş xidmətləri və ödəniş sistemləri',
      questions: [
        {
          id: 201,
          question: 'Hansı fəaliyyət növləri lisenziya əsasında icra oluna bilər?',
          answer:
            '<table><tbody><tr><td><p><strong>Ödəniş xidmətləri</strong></p></td><td><p><strong>Təchizatçılar</strong></p></td></tr><tr><td><p>Nağd ödəniş</p></td><td><p>Banklar</p></td></tr></tbody></table>',
        },
        { id: 202, question: 'Elektron pul nədir?', answer: '<p>Elektron pul məzənnə ilə bağlı deyil; mətndə <a href="https://www.cbar.az">link</a> var.</p>' },
      ],
    },
  ],
  videos: [{ id: 1, youtubeUrl: 'https://www.youtube.com/watch?v=FZrEo1nXlgs', title: 'Sığorta hadisəsi zamanı zərərlərin birbaşa tənzimlənməsi' }],
}

export const faqEn: FaqDto = {
  topics: [
    {
      slug: 'pul-siyaseti',
      name: 'Monetary policy',
      questions: [{ id: 102, question: 'What are inflation and deflation?', answer: '<p>Inflation is a rise in the general price level.</p>' }],
    },
  ],
  videos: [],
}

export const faqTopicLinks: FaqTopicLinkDto[] = [{ slug: 'pul-siyaseti', name: 'Pul siyasəti', questionCount: 23 }]
