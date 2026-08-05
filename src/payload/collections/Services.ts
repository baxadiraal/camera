import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'
import { slugField } from '../fields/slug'

/**
 * Интерактивные услуги — ЕДИНСТВЕННЫЙ источник данных для:
 *   • блока «Интерактивные услуги» на главной (showOnHome),
 *   • колонки услуг в мега-меню (showInMenu),
 *   • полосы быстрых действий (isQuickAction).
 * Никакого дублирования списка в вёрстке или отдельном меню быть не должно.
 */
export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: { ru: 'Интерактивная услуга', en: 'Service' },
    plural: { ru: 'Интерактивные услуги', en: 'Services' },
  },
  admin: {
    group: { ru: 'Сервисы', en: 'Services' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'icon', 'showOnHome', 'showInMenu', 'isQuickAction', 'order'],
  },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true, label: { ru: 'Название', en: 'Title' } },
    slugField('title'),
    {
      name: 'description',
      type: 'text',
      localized: true,
      maxLength: 120,
      label: { ru: 'Короткое пояснение', en: 'Short description' },
    },
    {
      name: 'icon',
      type: 'select',
      required: true,
      defaultValue: 'application',
      options: [
        { value: 'application', label: { ru: 'Заявка', en: 'Application' } },
        { value: 'hemis', label: { ru: 'HEMIS', en: 'HEMIS' } },
        { value: 'payment', label: { ru: 'Оплата', en: 'Payment' } },
        { value: 'schedule', label: { ru: 'Расписание', en: 'Schedule' } },
        { value: 'library', label: { ru: 'Библиотека', en: 'Library' } },
        { value: 'dormitory', label: { ru: 'Общежитие', en: 'Dormitory' } },
        { value: 'certificate', label: { ru: 'Справка', en: 'Certificate' } },
        { value: 'appeal', label: { ru: 'Обращение', en: 'Appeal' } },
        { value: 'scholarship', label: { ru: 'Стипендия', en: 'Scholarship' } },
        { value: 'support', label: { ru: 'Поддержка', en: 'Support' } },
      ],
      label: { ru: 'Иконка', en: 'Icon' },
      admin: {
        description: {
          ru: 'Иконки — inline-SVG в коде, изображения с текстом внутри не используются.',
          en: 'Icons are inline SVG in code; no text baked into images.',
        },
      },
    },
    {
      name: 'href',
      type: 'text',
      required: true,
      label: { ru: 'Ссылка', en: 'URL' },
      admin: {
        description: {
          ru: 'Внутренний путь начинается со «/» (без префикса языка), внешний — с https://',
          en: 'Internal paths start with “/” (no locale prefix); external links start with https://',
        },
      },
    },
    {
      name: 'audience',
      type: 'select',
      hasMany: true,
      defaultValue: ['student'],
      options: [
        { value: 'applicant', label: { ru: 'Абитуриент', en: 'Applicant' } },
        { value: 'student', label: { ru: 'Студент', en: 'Student' } },
        { value: 'staff', label: { ru: 'Сотрудник', en: 'Staff' } },
        { value: 'guest', label: { ru: 'Гость', en: 'Visitor' } },
      ],
      label: { ru: 'Аудитория', en: 'Audience' },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: true,
      label: { ru: 'Показывать в блоке услуг на главной', en: 'Show in the home page service grid' },
    },
    {
      name: 'showInMenu',
      type: 'checkbox',
      defaultValue: true,
      label: { ru: 'Показывать в мега-меню', en: 'Show in the mega menu' },
    },
    {
      name: 'isQuickAction',
      type: 'checkbox',
      defaultValue: false,
      label: { ru: 'Полоса быстрых действий (максимум 4)', en: 'Quick actions bar (max 4)' },
      admin: {
        description: {
          ru: 'Отмечайте не более четырёх услуг — в полосе ровно четыре плитки.',
          en: 'Mark no more than four services — the bar holds exactly four tiles.',
        },
      },
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
