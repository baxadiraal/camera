import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/**
 * Партнёры и полезные ресурсы.
 * Логотип — обязательная связь с медиатекой: файл лежит на нашем сервере,
 * хотлинк на чужие домены запрещён (и по скорости, и по приватности).
 */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: {
    singular: { ru: 'Партнёр', en: 'Partner' },
    plural: { ru: 'Партнёры и ресурсы', en: 'Partners' },
  },
  admin: {
    group: { ru: 'Сервисы', en: 'Services' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'url', 'order'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: 'order',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, label: { ru: 'Название', en: 'Name' } },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: { ru: 'Логотип (загрузить в медиатеку)', en: 'Logo (upload to media library)' },
    },
    { name: 'url', type: 'text', required: true, label: { ru: 'Сайт', en: 'Website' } },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { ru: 'Порядок', en: 'Sort order' },
      admin: { position: 'sidebar' },
    },
  ],
}
