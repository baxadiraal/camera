import type { CollectionConfig, Field } from 'payload'
import { anyone, editorsOnly } from '../access'

/**
 * Навигация редактируется из админки — в коде нет ни одного захардкоженного пункта.
 *
 * Правила, зашитые в схему:
 *   • максимум два уровня: у дочернего пункта своих детей нет;
 *   • ссылка либо на существующую страницу, либо явный внешний URL —
 *     «заглушек» на # быть не может (поле href обязательно и валидируется);
 *   • тип «Интерактивные услуги» подтягивает пункты из коллекции services
 *     (showInMenu = true), чтобы список услуг жил в одном месте.
 */

const linkFields = (withAuto: boolean): Field[] => [
  {
    name: 'label',
    type: 'text',
    required: true,
    localized: true,
    label: { ru: 'Подпись', en: 'Label' },
  },
  {
    name: 'type',
    type: 'select',
    required: true,
    defaultValue: 'page',
    options: [
      { value: 'page', label: { ru: 'Страница сайта', en: 'Site page' } },
      { value: 'news', label: { ru: 'Лента новостей', en: 'News feed' } },
      { value: 'external', label: { ru: 'Внешний адрес', en: 'External URL' } },
      ...(withAuto
        ? [
            {
              value: 'services',
              label: { ru: 'Список интерактивных услуг', en: 'Interactive services list' },
            },
          ]
        : []),
    ],
    label: { ru: 'Тип ссылки', en: 'Link type' },
  },
  {
    name: 'page',
    type: 'relationship',
    relationTo: 'pages',
    label: { ru: 'Страница', en: 'Page' },
    admin: { condition: (_, sibling) => sibling?.type === 'page' },
    required: false,
  },
  {
    name: 'url',
    type: 'text',
    label: { ru: 'Адрес', en: 'URL' },
    admin: { condition: (_, sibling) => sibling?.type === 'external' },
  },
  {
    name: 'description',
    type: 'text',
    localized: true,
    maxLength: 120,
    label: { ru: 'Пояснение в мега-меню', en: 'Mega menu description' },
  },
]

export const Menus: CollectionConfig = {
  slug: 'menus',
  labels: {
    singular: { ru: 'Меню', en: 'Menu' },
    plural: { ru: 'Меню', en: 'Menus' },
  },
  admin: {
    group: { ru: 'Навигация', en: 'Navigation' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'key'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  fields: [
    { name: 'title', type: 'text', required: true, label: { ru: 'Название меню', en: 'Menu name' } },
    {
      name: 'key',
      type: 'select',
      required: true,
      unique: true,
      index: true,
      options: [
        { value: 'main', label: { ru: 'Главное меню (5 пунктов)', en: 'Main menu (5 items)' } },
        { value: 'footer', label: { ru: 'Меню в подвале', en: 'Footer menu' } },
      ],
      label: { ru: 'Назначение', en: 'Purpose' },
    },
    {
      name: 'items',
      type: 'array',
      required: true,
      maxRows: 8,
      label: { ru: 'Пункты меню', en: 'Menu items' },
      labels: { singular: { ru: 'Пункт', en: 'Item' }, plural: { ru: 'Пункты', en: 'Items' } },
      admin: {
        description: {
          ru: 'В главном меню строго 5 пунктов. Каждый ведёт на реальную страницу-хаб.',
          en: 'The main menu holds exactly 5 items, each pointing to a real hub page.',
        },
      },
      fields: [
        ...linkFields(false),
        {
          name: 'children',
          type: 'array',
          maxRows: 12,
          label: { ru: 'Подпункты (второй уровень)', en: 'Children (second level)' },
          fields: linkFields(true),
        },
      ],
    },
  ],
}
