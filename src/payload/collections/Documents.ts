import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/** Документы (PDF, DOCX, XLSX): уставы, приказы, учебные планы, положения. */
export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: {
    singular: { ru: 'Документ', en: 'Document' },
    plural: { ru: 'Документы', en: 'Documents' },
  },
  admin: {
    group: { ru: 'Контент', en: 'Content' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'documentDate'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  upload: {
    staticDir: process.env.PAYLOAD_DOCS_DIR || 'public/documents',
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { ru: 'Название документа', en: 'Document title' },
      admin: {
        description: {
          ru: 'Название читается в ссылке вслух — «Устав института (PDF, 1,2 МБ)».',
          en: 'The title is read out in the link — “Statute (PDF, 1.2 MB)”.',
        },
      },
    },
    {
      name: 'category',
      type: 'select',
      defaultValue: 'other',
      index: true,
      options: [
        { value: 'statutory', label: { ru: 'Учредительные документы', en: 'Statutory' } },
        { value: 'admission', label: { ru: 'Приём', en: 'Admissions' } },
        { value: 'education', label: { ru: 'Учебный процесс', en: 'Education' } },
        { value: 'science', label: { ru: 'Наука', en: 'Research' } },
        { value: 'student', label: { ru: 'Студенту', en: 'Students' } },
        { value: 'other', label: { ru: 'Прочее', en: 'Other' } },
      ],
      label: { ru: 'Категория', en: 'Category' },
    },
    {
      name: 'documentDate',
      type: 'date',
      label: { ru: 'Дата документа', en: 'Document date' },
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'documentNumber',
      type: 'text',
      label: { ru: 'Номер документа', en: 'Document number' },
    },
  ],
}
