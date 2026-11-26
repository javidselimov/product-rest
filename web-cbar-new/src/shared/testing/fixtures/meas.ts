import type { MeasItem, MeasRef } from '@/features/meas/model/schemas'

export const measEmitents: MeasRef[] = [
  { id: 1, name: 'Kapital Bank' },
  { id: 2, name: 'Azərbaycan Sənaye Bankı' },
]

export const measInfoTypes: MeasRef[] = [
  { id: 10, name: 'İllik hesabat' },
  { id: 11, name: 'Emissiya prospekti' },
]

export const measItems: MeasItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: 700 + i,
  regDate: `2026-0${(i % 9) + 1}-10`,
  dqn: `AZ100${String(i).padStart(4, '0')}`,
  emitentName: i % 2 === 0 ? 'Kapital Bank' : 'Azərbaycan Sənaye Bankı',
  infoTypeName: i % 3 === 0 ? 'İllik hesabat' : 'Emissiya prospekti',
  fileUrl: i % 5 === 4 ? null : `/media/${1000 + i}`,
}))
