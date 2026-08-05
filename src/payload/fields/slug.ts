import type { Field } from 'payload'
import { toSlug } from '@/lib/slugify'

/**
 * Поле slug с автоматической транслитерацией.
 *
 * Slug намеренно НЕ локализуется: один и тот же путь во всех языковых версиях
 * (/qq/institut, /ru/institut) — так проще держать корректные hreflang-связи
 * и не плодить редиректы при смене языка.
 */
export const slugField = (sourceField = 'title'): Field => ({
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  label: { ru: 'Адрес (slug)', en: 'Slug' },
  admin: {
    position: 'sidebar',
    description: {
      ru: 'Только латиница. Заполняется автоматически из заголовка, можно поправить вручную.',
      en: 'Latin characters only. Generated from the title, can be edited.',
    },
  },
  hooks: {
    beforeValidate: [
      ({ value, data, siblingData }) => {
        const raw =
          (typeof value === 'string' && value.length > 0 ? value : undefined) ??
          (siblingData as Record<string, unknown> | undefined)?.[sourceField] ??
          (data as Record<string, unknown> | undefined)?.[sourceField]

        return typeof raw === 'string' ? toSlug(raw) : value
      },
    ],
  },
})
