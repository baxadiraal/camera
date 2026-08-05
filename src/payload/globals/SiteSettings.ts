import type { GlobalConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/** Общие данные сайта: контакты, карта, соцсети, реквизиты подвала. */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: { ru: 'Настройки сайта', en: 'Site settings' },
  admin: { group: { ru: 'Настройки', en: 'Settings' } },
  access: { read: anyone, update: editorsOnly },
  fields: [
    {
      name: 'organizationName',
      type: 'text',
      required: true,
      localized: true,
      label: { ru: 'Полное название организации', en: 'Organisation name' },
    },
    {
      name: 'address',
      type: 'textarea',
      required: true,
      localized: true,
      label: { ru: 'Адрес', en: 'Address' },
    },
    {
      name: 'transport',
      type: 'textarea',
      localized: true,
      label: { ru: 'Маршруты транспорта', en: 'Public transport' },
    },
    {
      name: 'workingHours',
      type: 'text',
      localized: true,
      label: { ru: 'Часы работы', en: 'Opening hours' },
    },
    {
      name: 'phones',
      type: 'array',
      label: { ru: 'Телефоны', en: 'Phones' },
      fields: [
        { name: 'value', type: 'text', required: true, label: { ru: 'Номер', en: 'Number' } },
        { name: 'note', type: 'text', localized: true, label: { ru: 'Пояснение', en: 'Note' } },
      ],
    },
    {
      name: 'emails',
      type: 'array',
      label: { ru: 'Адреса электронной почты', en: 'Emails' },
      fields: [{ name: 'value', type: 'email', required: true, label: { ru: 'E-mail', en: 'Email' } }],
    },
    {
      name: 'map',
      type: 'group',
      label: { ru: 'Карта', en: 'Map' },
      admin: {
        description: {
          ru: 'Вместо тяжёлого iframe используется статичная картинка со ссылкой на карты.',
          en: 'A static image with a link to the maps service replaces the heavy iframe.',
        },
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: { ru: 'Статичная карта', en: 'Static map image' },
        },
        { name: 'yandexUrl', type: 'text', label: { ru: 'Ссылка на Яндекс Карты', en: 'Yandex Maps URL' } },
        { name: 'googleUrl', type: 'text', label: { ru: 'Ссылка на Google Карты', en: 'Google Maps URL' } },
        { name: 'latitude', type: 'number', label: { ru: 'Широта', en: 'Latitude' } },
        { name: 'longitude', type: 'number', label: { ru: 'Долгота', en: 'Longitude' } },
      ],
    },
    {
      name: 'socials',
      type: 'array',
      label: { ru: 'Социальные сети', en: 'Social networks' },
      fields: [
        { name: 'label', type: 'text', required: true, label: { ru: 'Название', en: 'Name' } },
        { name: 'href', type: 'text', required: true, label: { ru: 'Ссылка', en: 'URL' } },
      ],
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: { ru: 'Логотип', en: 'Logo' },
    },
    {
      name: 'analytics',
      type: 'group',
      label: { ru: 'Аналитика', en: 'Analytics' },
      admin: {
        description: {
          ru: 'Только self-hosted Umami/Plausible. Скрипт грузится с defer и после согласия.',
          en: 'Self-hosted Umami/Plausible only, loaded deferred and after consent.',
        },
      },
      fields: [
        {
          name: 'provider',
          type: 'select',
          defaultValue: 'none',
          options: [
            { value: 'none', label: { ru: 'Отключена', en: 'Disabled' } },
            { value: 'umami', label: 'Umami' },
            { value: 'plausible', label: 'Plausible' },
          ],
          label: { ru: 'Система', en: 'Provider' },
        },
        { name: 'scriptUrl', type: 'text', label: { ru: 'Адрес скрипта', en: 'Script URL' } },
        { name: 'websiteId', type: 'text', label: { ru: 'Идентификатор сайта', en: 'Website ID' } },
      ],
    },
  ],
}
