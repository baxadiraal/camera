/* Все экраны админки Payload обслуживает один catch-all маршрут. */
import type { Metadata } from 'next'
import config from '@payload-config'
import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { importMap } from '../importMap'

// Админка всегда рендерится на запрос: пререндер потребовал бы соединения
// с базой во время сборки образа.
export const dynamic = 'force-dynamic'

type Args = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = ({ params, searchParams }: Args): Promise<Metadata> =>
  generatePageMetadata({ config, params, searchParams })

const Page = ({ params, searchParams }: Args) =>
  RootPage({ config, importMap, params, searchParams })

export default Page
