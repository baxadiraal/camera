import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'
import { slugField } from '../fields/slug'

/** Сотрудники: руководство, преподаватели, авторы научных статей. */
export const Persons: CollectionConfig = {
  slug: 'persons',
  labels: {
    singular: { ru: 'Сотрудник', en: 'Person' },
    plural: { ru: 'Сотрудники', en: 'People' },
  },
  admin: {
    group: { ru: 'Структура', en: 'Structure' },
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'position', 'department', 'isLeadership'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: 'order',
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
      localized: true,
      label: { ru: 'Ф. И. О.', en: 'Full name' },
      admin: {
        description: {
          ru: 'Имя пишется в национальной орфографии соответствующего языка.',
          en: 'Use the spelling of the corresponding language.',
        },
      },
    },
    slugField('fullName'),
    { name: 'position', type: 'text', required: true, localized: true, label: { ru: 'Должность', en: 'Position' } },
    { name: 'degree', type: 'text', localized: true, label: { ru: 'Учёная степень, звание', en: 'Academic degree' } },
    {
      name: 'department',
      type: 'relationship',
      relationTo: 'departments',
      label: { ru: 'Подразделение', en: 'Department' },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: { ru: 'Фотография', en: 'Photo' },
    },
    { name: 'bio', type: 'richText', localized: true, label: { ru: 'Биография', en: 'Biography' } },
    {
      name: 'contacts',
      type: 'group',
      label: { ru: 'Контакты', en: 'Contacts' },
      fields: [
        { name: 'email', type: 'email', label: { ru: 'E-mail', en: 'Email' } },
        { name: 'phone', type: 'text', label: { ru: 'Телефон', en: 'Phone' } },
        {
          name: 'receptionHours',
          type: 'text',
          localized: true,
          label: { ru: 'Приёмные часы', en: 'Office hours' },
        },
      ],
    },
    {
      name: 'isLeadership',
      type: 'checkbox',
      defaultValue: false,
      label: { ru: 'Входит в руководство', en: 'Member of leadership' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 100,
      label: { ru: 'Порядок', en: 'Sort order' },
      admin: { position: 'sidebar' },
    },
  ],
}
