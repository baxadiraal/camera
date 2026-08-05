import type { CollectionConfig } from 'payload'
import { editorsOnly, publishedOrEditor } from '../access'
import { slugField } from '../fields/slug'
import { publishFields, seoField } from '../fields/seo'

/**
 * Страницы сайта: хабы разделов («Институт», «Поступление», …) и их дети.
 * Глубина ровно два уровня — поле parent принимает только страницы без parent,
 * это проверяется валидацией ниже.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: { ru: 'Страница', en: 'Page' },
    plural: { ru: 'Страницы', en: 'Pages' },
  },
  admin: {
    group: { ru: 'Контент', en: 'Content' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'parent', 'status', 'updatedAt'],
  },
  access: { read: publishedOrEditor, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  versions: { drafts: false },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
      label: { ru: 'Заголовок', en: 'Title' },
    },
    slugField('title'),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'pages',
      label: { ru: 'Родительский раздел', en: 'Parent section' },
      admin: {
        position: 'sidebar',
        description: {
          ru: 'Пусто — это страница-хаб верхнего уровня. Глубже двух уровней вложенность запрещена.',
          en: 'Empty means a top-level hub page. Nesting deeper than two levels is not allowed.',
        },
      },
      filterOptions: () => ({ parent: { exists: false } }),
    },
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      label: { ru: 'Краткое описание', en: 'Summary' },
    },
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
      label: { ru: 'Изображение раздела', en: 'Section image' },
    },
    {
      name: 'content',
      type: 'richText',
      localized: true,
      label: { ru: 'Содержимое', en: 'Content' },
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      label: { ru: 'Прикреплённые документы', en: 'Attached documents' },
    },
    {
      name: 'showChildrenIndex',
      type: 'checkbox',
      defaultValue: true,
      label: { ru: 'Показывать список подстраниц', en: 'Show child page index' },
      admin: {
        description: {
          ru: 'Для страниц-хабов: под текстом выводится карточный список дочерних страниц.',
          en: 'Hub pages render a card list of their child pages below the content.',
        },
      },
    },
    seoField,
    ...publishFields,
  ],
}
