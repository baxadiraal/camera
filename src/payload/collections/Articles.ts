import type { CollectionConfig } from 'payload'
import { editorsOnly, publishedOrEditor } from '../access'
import { slugField } from '../fields/slug'
import { publishFields, seoField } from '../fields/seo'

/**
 * Научные статьи — материалы журнала института и публикации сотрудников.
 * Раздел «Наука» строится на этой коллекции.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: {
    singular: { ru: 'Научная статья', en: 'Article' },
    plural: { ru: 'Научные статьи', en: 'Articles' },
  },
  admin: {
    group: { ru: 'Наука', en: 'Research' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'issue', 'publishedAt', 'status'],
  },
  access: { read: publishedOrEditor, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Название', en: 'Title' } },
    slugField('title'),
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'persons',
      hasMany: true,
      label: { ru: 'Авторы (сотрудники)', en: 'Authors (staff)' },
    },
    {
      name: 'externalAuthors',
      type: 'text',
      localized: true,
      label: { ru: 'Внешние соавторы', en: 'External co-authors' },
    },
    {
      name: 'abstract',
      type: 'textarea',
      localized: true,
      maxLength: 1200,
      label: { ru: 'Аннотация', en: 'Abstract' },
    },
    {
      name: 'keywords',
      type: 'text',
      localized: true,
      label: { ru: 'Ключевые слова', en: 'Keywords' },
    },
    { name: 'issue', type: 'text', label: { ru: 'Выпуск журнала', en: 'Journal issue' } },
    { name: 'pages', type: 'text', label: { ru: 'Страницы', en: 'Pages' } },
    { name: 'doi', type: 'text', label: { ru: 'DOI', en: 'DOI' } },
    {
      name: 'pdf',
      type: 'relationship',
      relationTo: 'documents',
      label: { ru: 'PDF-версия', en: 'PDF version' },
    },
    { name: 'content', type: 'richText', localized: true, label: { ru: 'Полный текст', en: 'Full text' } },
    seoField,
    ...publishFields,
  ],
}
