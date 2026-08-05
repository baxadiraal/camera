import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/**
 * Этапы приёмной кампании для таймлайна на главной.
 * Статус (прошло / идёт сейчас / впереди) НЕ хранится в базе — он вычисляется
 * из дат на сервере при рендере, иначе редактору пришлось бы обновлять его руками.
 */
export const AdmissionStages: CollectionConfig = {
  slug: 'admission-stages',
  labels: {
    singular: { ru: 'Этап приёма', en: 'Admission stage' },
    plural: { ru: 'Этапы приёмной кампании', en: 'Admission stages' },
  },
  admin: {
    group: { ru: 'Поступление', en: 'Admissions' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'admissionYear', 'order'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: 'startDate',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Название этапа', en: 'Stage title' } },
    {
      name: 'description',
      type: 'text',
      localized: true,
      maxLength: 160,
      label: { ru: 'Пояснение', en: 'Description' },
    },
    {
      name: 'startDate',
      type: 'date',
      required: true,
      index: true,
      label: { ru: 'Начало', en: 'Start date' },
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'endDate',
      type: 'date',
      label: { ru: 'Окончание', en: 'End date' },
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description: {
          ru: 'Оставьте пустым для одномоментного события (например, публикация результатов).',
          en: 'Leave empty for a single-day event (e.g. results publication).',
        },
      },
    },
    {
      name: 'admissionYear',
      type: 'number',
      required: true,
      defaultValue: 2026,
      index: true,
      label: { ru: 'Год приёма', en: 'Admission year' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'link',
      type: 'text',
      label: { ru: 'Ссылка на подробности', en: 'Details link' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { ru: 'Порядок', en: 'Sort order' },
      admin: { position: 'sidebar' },
    },
  ],
}
