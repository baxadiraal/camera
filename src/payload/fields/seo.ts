import type { Field } from 'payload'

/**
 * SEO-группа. Длины ограничены прямо в админке, чтобы редактор видел лимит
 * до публикации: title ≤ 60 символов, description ≤ 155.
 * Если поля пустые — generateMetadata соберёт значения из заголовка и анонса.
 */
export const seoField: Field = {
  name: 'seo',
  type: 'group',
  label: { ru: 'SEO', en: 'SEO' },
  admin: {
    description: {
      ru: 'Необязательно: если не заполнить, метатеги соберутся из заголовка и анонса.',
      en: 'Optional: metadata falls back to the title and excerpt.',
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      maxLength: 60,
      label: { ru: 'Title (до 60 символов)', en: 'Title (max 60 chars)' },
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      maxLength: 155,
      label: { ru: 'Description (до 155 символов)', en: 'Description (max 155 chars)' },
    },
    {
      name: 'ogImage',
      type: 'upload',
      relationTo: 'media',
      label: { ru: 'Картинка для соцсетей', en: 'Open Graph image' },
      admin: {
        description: {
          ru: 'Если не задана — og:image генерируется автоматически из заголовка.',
          en: 'When empty, og:image is generated dynamically from the title.',
        },
      },
    },
    {
      name: 'noIndex',
      type: 'checkbox',
      defaultValue: false,
      label: { ru: 'Закрыть от индексации', en: 'Hide from search engines' },
    },
  ],
}

/** Статус публикации: черновики не отдаются публичному API. */
export const publishFields: Field[] = [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    index: true,
    options: [
      { value: 'draft', label: { ru: 'Черновик', en: 'Draft' } },
      { value: 'published', label: { ru: 'Опубликовано', en: 'Published' } },
    ],
    admin: { position: 'sidebar' },
    label: { ru: 'Статус', en: 'Status' },
  },
  {
    name: 'publishedAt',
    type: 'date',
    index: true,
    admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    label: { ru: 'Дата публикации', en: 'Published at' },
    hooks: {
      beforeChange: [
        ({ value, siblingData }) => {
          const status = (siblingData as { status?: string } | undefined)?.status
          // Проставляем дату в момент первой публикации
          if (status === 'published' && !value) return new Date().toISOString()
          return value
        },
      ],
    },
  },
]
