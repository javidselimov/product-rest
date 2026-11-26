/** Working papers: the real contract (spec 054, `contracts/public-api.md`). A test of another state overrides it with `server.use`. */
import { HttpResponse, http } from 'msw'

import { API } from '../api-base'
import { workingPaperBareAz, workingPaperDetailAz, workingPapersAz, workingPapersEn } from '../fixtures/working-papers'

const NOT_FOUND = 404

export const workingPaperHandlers = [
  http.get(`${API}/api/v1/working-papers`, ({ request }) =>
    HttpResponse.json({ items: new URL(request.url).searchParams.get('locale') === 'en' ? workingPapersEn : workingPapersAz }),
  ),
  http.get(`${API}/api/v1/working-papers/:key`, ({ params, request }) => {
    const locale = new URL(request.url).searchParams.get('locale') ?? 'az'
    const list = locale === 'en' ? workingPapersEn : workingPapersAz
    const item = list.find((paper) => paper.key === params.key)
    if (!item) return HttpResponse.json({ title: 'Not Found', status: NOT_FOUND }, { status: NOT_FOUND })
    if (locale === 'az' && item.key === workingPaperDetailAz.key) return HttpResponse.json(workingPaperDetailAz)
    if (locale === 'az' && item.key === workingPaperBareAz.key) return HttpResponse.json(workingPaperBareAz)
    return HttpResponse.json({ ...item, abstract: null, jelCodes: [], file: null })
  }),
]
