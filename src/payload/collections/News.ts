import type { CollectionConfig } from 'payload'
import { editorsOnly, publishedOrEditor } from '../access'
import { slugField } from '../fields/slug'
import { publishFields, seoField } from '../fields/seo'

/** Новости института. Выводятся на главной (1 крупная + 3 карточки) и в разделе /news. */
export const News: CollectionConfig = {
  slug: 'news',
  labels: {
    singular: { ru: 'Новость', en: 'News item' },
    plural: { ru: 'Новости', en: 'News' },
  },
  admin: {
    group: { ru: 'Контент', en: 'Content' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', 'status'],
  },
  access: { read: publishedOrEditor, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: '-publishedAt',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Заголовок', en: 'Title' } },
    slugField('title'),
    {
      name: 'excerpt',
      type: 'textarea',
      localized: true,
      maxLength: 300,
      label: { ru: 'Анонс', en: 'Excerpt' },
      admin: {
        description: {
          ru: 'На карточках обрезается до 140 символов по границе слова.',
          en: 'Trimmed to 140 characters on word boundary in cards.',
        },
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: { ru: 'Обложка', en: 'Cover image' },
    },
    {
      name: 'category',
      type: 'select',
      localized: false,
      defaultValue: 'institute',
      index: true,
      options: [
        { value: 'institute', label: { ru: 'Жизнь института', en: 'Institute life' } },
        { value: 'admission', label: { ru: 'Приём', en: 'Admissions' } },
        { value: 'science', label: { ru: 'Наука', en: 'Research' } },
        { value: 'culture', label: { ru: 'Культура и искусство', en: 'Arts and culture' } },
        { value: 'international', label: { ru: 'Международные связи', en: 'International' } },
      ],
      label: { ru: 'Рубрика', en: 'Category' },
    },
    { name: 'content', type: 'richText', localized: true, label: { ru: 'Текст', en: 'Body' } },
    {
      name: 'gallery',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      label: { ru: 'Галерея', en: 'Gallery' },
    },
    {
      name: 'youtubeId',
      type: 'text',
      label: { ru: 'ID видео на YouTube', en: 'YouTube video ID' },
      admin: {
        description: {
          ru: 'Только идентификатор. Плеер загружается по клику, превью хранится локально.',
          en: 'ID only. The player loads on click; the preview is stored locally.',
        },
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: { ru: 'Крупная карточка на главной', en: 'Featured on the home page' },
      admin: { position: 'sidebar' },
    },
    seoField,
    ...publishFields,
  ],
}
