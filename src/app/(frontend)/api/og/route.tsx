import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export const revalidate = 86400

/**
 * Динамическая картинка для соцсетей (1200×630).
 *
 * Только текст на фирменном фоне: заголовок страницы, название вуза и полоса
 * терракотового акцента. Никаких фотографий — картинка должна оставаться
 * читаемой в ленте и весить единицы килобайт.
 *
 * Шрифты подгружаются статическими TTF (см. scripts/prepare-og-fonts.py):
 * движок рендеринга не поддерживает woff2 и вариативные начертания.
 */

const FONT_FILES = [
  'inter-og-latin.ttf',
  'inter-og-latinext.ttf',
  'inter-og-cyrillic.ttf',
] as const

async function loadFonts() {
  const dir = path.join(process.cwd(), 'public', 'fonts', 'og')
  const buffers = await Promise.all(
    FONT_FILES.map((file) => readFile(path.join(dir, file))),
  )
  // Три подмножества под одним именем: движок сам выберет то,
  // в котором есть нужный символ (латиница, диакритика, кириллица)
  return buffers.map((data) => ({
    name: 'Inter',
    data: data as unknown as ArrayBuffer,
    weight: 600 as const,
    style: 'normal' as const,
  }))
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const rawTitle = searchParams.get('title') ?? ''
  const rawLocale = searchParams.get('locale') ?? routing.defaultLocale
  const locale = hasLocale(routing.locales, rawLocale) ? rawLocale : routing.defaultLocale

  const t = await getTranslations({ locale, namespace: 'site' })
  const title = rawTitle.slice(0, 120) || t('fullName')

  const fonts = await loadFonts()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#1B2A5B',
          padding: 64,
          fontFamily: 'Inter',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 8,
              backgroundColor: '#C6522F',
            }}
          />
          <div style={{ color: '#F5F1E8', fontSize: 28 }}>{t('shortName')}</div>
        </div>

        <div
          style={{
            display: 'flex',
            fontSize: title.length > 70 ? 52 : 64,
            lineHeight: 1.2,
            color: '#FFFFFF',
          }}
        >
          {title}
        </div>

        <div style={{ display: 'flex', height: 12, backgroundColor: '#C6522F', width: 240 }} />
      </div>
    ),
    { width: 1200, height: 630, fonts },
  )
}
