import type { GlobalConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/**
 * Содержимое главной страницы: hero и цифры института.
 * Остальные блоки главной собираются из коллекций (news, services,
 * admission-stages, partners) — здесь их не дублируем.
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { ru: 'Главная страница', en: 'Home page' },
  admin: { group: { ru: 'Настройки', en: 'Settings' } },
  access: { read: anyone, update: editorsOnly },
  fields: [
    {
      name: 'hero',
      type: 'group',
      label: { ru: 'Первый экран', en: 'Hero' },
      admin: {
        description: {
          ru: 'Заголовок — текст, а не картинка. Карусели нет: один экран, одна кнопка.',
          en: 'The heading is real text, not an image. No carousel: one screen, one CTA.',
        },
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          localized: true,
          maxLength: 90,
          label: { ru: 'Заголовок', en: 'Heading' },
        },
        {
          name: 'subtitle',
          type: 'textarea',
          required: true,
          localized: true,
          maxLength: 220,
          label: { ru: 'Подзаголовок', en: 'Subheading' },
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
          label: { ru: 'Фоновое фото', en: 'Background photo' },
        },
        {
          name: 'ctaLabel',
          type: 'text',
          required: true,
          localized: true,
          maxLength: 40,
          label: { ru: 'Подпись кнопки', en: 'CTA label' },
        },
        {
          name: 'ctaHref',
          type: 'text',
          required: true,
          label: { ru: 'Ссылка кнопки', en: 'CTA link' },
        },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      maxRows: 4,
      label: { ru: 'Институт в цифрах', en: 'Institute in numbers' },
      fields: [
        { name: 'value', type: 'number', required: true, label: { ru: 'Значение', en: 'Value' } },
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          maxLength: 40,
          label: { ru: 'Подпись', en: 'Label' },
        },
        { name: 'suffix', type: 'text', maxLength: 4, label: { ru: 'Суффикс (+, %)', en: 'Suffix' } },
      ],
    },
    {
      name: 'admissionYear',
      type: 'number',
      defaultValue: 2026,
      required: true,
      label: { ru: 'Год приёмной кампании на главной', en: 'Admission year shown on the home page' },
      admin: { position: 'sidebar' },
    },
  ],
}
