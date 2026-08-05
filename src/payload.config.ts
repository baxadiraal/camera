import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Users } from './payload/collections/Users'
import { Media } from './payload/collections/Media'
import { Pages } from './payload/collections/Pages'
import { News } from './payload/collections/News'
import { Announcements } from './payload/collections/Announcements'
import { Articles } from './payload/collections/Articles'
import { Departments } from './payload/collections/Departments'
import { Persons } from './payload/collections/Persons'
import { Services } from './payload/collections/Services'
import { Documents } from './payload/collections/Documents'
import { Partners } from './payload/collections/Partners'
import { AdmissionStages } from './payload/collections/AdmissionStages'
import { Menus } from './payload/collections/Menus'
import { SiteSettings } from './payload/globals/SiteSettings'
import { Homepage } from './payload/globals/Homepage'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname, '..') },
    meta: { titleSuffix: '· UzDSMI Nukus' },
  },
  // Локализация контента: те же четыре языка, что и на фронтенде.
  // fallback: qq — если перевод не заполнен, показывается каракалпакская версия,
  // а не пустое место.
  localization: {
    locales: [
      { code: 'qq', label: { ru: 'Каракалпакский', en: 'Karakalpak' } },
      { code: 'uz', label: { ru: 'Узбекский', en: 'Uzbek' } },
      { code: 'ru', label: { ru: 'Русский', en: 'Russian' } },
      { code: 'en', label: { ru: 'Английский', en: 'English' } },
    ],
    defaultLocale: 'qq',
    fallback: true,
  },
  collections: [
    Pages,
    News,
    Announcements,
    Articles,
    Departments,
    Persons,
    Services,
    Documents,
    Partners,
    AdmissionStages,
    Menus,
    Media,
    Users,
  ],
  globals: [Homepage, SiteSettings],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    push: process.env.NODE_ENV !== 'production',
  }),
  secret: process.env.PAYLOAD_SECRET || 'change-me-in-env',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  sharp,
  graphQL: { disable: false },
  upload: { limits: { fileSize: 20 * 1024 * 1024 } },
})
