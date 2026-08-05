import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'
import { slugField } from '../fields/slug'

/** Структура института: факультеты, кафедры, отделы, центры. */
export const Departments: CollectionConfig = {
  slug: 'departments',
  labels: {
    singular: { ru: 'Подразделение', en: 'Department' },
    plural: { ru: 'Подразделения', en: 'Departments' },
  },
  admin: {
    group: { ru: 'Структура', en: 'Structure' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'head', 'order'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Название', en: 'Name' } },
    slugField('title'),
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'faculty',
      index: true,
      options: [
        { value: 'faculty', label: { ru: 'Факультет', en: 'Faculty' } },
        { value: 'chair', label: { ru: 'Кафедра', en: 'Chair' } },
        { value: 'office', label: { ru: 'Отдел', en: 'Office' } },
        { value: 'center', label: { ru: 'Центр', en: 'Centre' } },
      ],
      label: { ru: 'Тип', en: 'Kind' },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'departments',
      label: { ru: 'В составе', en: 'Part of' },
      admin: { position: 'sidebar' },
    },
    {
      name: 'head',
      type: 'relationship',
      relationTo: 'persons',
      label: { ru: 'Руководитель', en: 'Head' },
    },
    { name: 'description', type: 'richText', localized: true, label: { ru: 'Описание', en: 'Description' } },
    {
      name: 'contacts',
      type: 'group',
      label: { ru: 'Контакты', en: 'Contacts' },
      fields: [
        { name: 'phone', type: 'text', label: { ru: 'Телефон', en: 'Phone' } },
        { name: 'email', type: 'email', label: { ru: 'E-mail', en: 'Email' } },
        { name: 'room', type: 'text', localized: true, label: { ru: 'Кабинет', en: 'Room' } },
      ],
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
