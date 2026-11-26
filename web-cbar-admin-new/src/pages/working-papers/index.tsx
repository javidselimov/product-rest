/** "İşçi məqalələri" pages (spec 054): the CRUD list and form of the working papers module, nothing hand-written. */

import { CrudFormPage } from '@/features/crud/components/crud-form-page'
import { CrudListPage } from '@/features/crud/components/crud-list-page'
import { workingPapersModule } from '@/features/working-papers/model/module'

export function WorkingPapersPage() {
  return <CrudListPage config={workingPapersModule} />
}

export function WorkingPapersFormPage() {
  return <CrudFormPage config={workingPapersModule} />
}
