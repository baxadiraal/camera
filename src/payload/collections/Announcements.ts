import type { CollectionConfig } from 'payload'
import { editorsOnly, publishedOrEditor } from '../access'
import { slugField } from '../fields/slug'
import { publishFields } from '../fields/seo'

/**
 * Объявления — короткие сообщения со сроком жизни (конкурсы, вакансии, режим работы).
 * Отличаются от новостей полем activeUntil: после этой даты объявление уходит из ленты.
 */
export const Announcements: CollectionConfig = {
  slug: 'announcements',
  labels: {
    singular: { ru: 'Объявление', en: 'Announcement' },
    plural: { ru: 'Объявления', en: 'Announcements' },
  },
  admin: {
    group: { ru: 'Контент', en: 'Content' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'importance', 'activeUntil', 'status'],
  },
  access: { read: publishedOrEditor, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Заголовок', en: 'Title' } },
    slugField('title'),
    { name: 'body', type: 'richText', localized: true, label: { ru: 'Текст', en: 'Body' } },
    {
      name: 'importance',
      type: 'select',
      defaultValue: 'normal',
      options: [
        { value: 'normal', label: { ru: 'Обычное', en: 'Normal' } },
        { value: 'important', label: { ru: 'Важное', en: 'Important' } },
      ],
      label: { ru: 'Важность', en: 'Importance' },
    },
    {
      name: 'activeUntil',
      type: 'date',
      index: true,
      label: { ru: 'Показывать до', en: 'Show until' },
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'link',
      type: 'group',
      label: { ru: 'Ссылка', en: 'Link' },
      fields: [
        { name: 'label', type: 'text', localized: true, label: { ru: 'Подпись', en: 'Label' } },
        { name: 'href', type: 'text', label: { ru: 'Адрес', en: 'URL' } },
      ],
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      label: { ru: 'Документы', en: 'Documents' },
    },
    ...publishFields,
  ],
}
