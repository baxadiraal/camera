import type { CollectionConfig } from 'payload'
import { adminsOnly, editorsOnly } from '../access'

/** Сотрудники, работающие с админкой. Публичного доступа к коллекции нет. */
export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  labels: {
    singular: { ru: 'Пользователь', en: 'User' },
    plural: { ru: 'Пользователи', en: 'Users' },
  },
  admin: { useAsTitle: 'name', group: { ru: 'Система', en: 'System' } },
  access: {
    read: editorsOnly,
    create: adminsOnly,
    update: adminsOnly,
    delete: adminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: { ru: 'Имя', en: 'Name' } },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { value: 'admin', label: { ru: 'Администратор', en: 'Administrator' } },
        { value: 'editor', label: { ru: 'Редактор', en: 'Editor' } },
      ],
      label: { ru: 'Роль', en: 'Role' },
    },
  ],
}
