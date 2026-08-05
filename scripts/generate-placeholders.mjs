/**
 * Генерация локальных изображений-заглушек для демо-контента.
 *
 * Реальные фотографии редактор загружает в медиатеку; этот скрипт нужен,
 * чтобы репозиторий собирался и открывался без единой внешней ссылки.
 * Запуск: node scripts/generate-placeholders.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = path.resolve(process.cwd(), 'public/media')

/** Мягкий диагональный градиент в цветах дизайн-системы. */
const gradient = (width, height, from, to) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/>
          <stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
    </svg>`,
  )

const raster = [
  { file: 'hero-institute.jpg', w: 1920, h: 1080, from: '#1B2A5B', to: '#C6522F' },
  { file: 'news-open-day.jpg', w: 1280, h: 720, from: '#1B2A5B', to: '#5C71A8' },
  { file: 'news-ensemble.jpg', w: 1280, h: 720, from: '#C6522F', to: '#F5F1E8' },
  { file: 'news-journal.jpg', w: 1280, h: 720, from: '#33487F', to: '#F5F1E8' },
  { file: 'news-exchange.jpg', w: 1280, h: 720, from: '#1B2A5B', to: '#EAE3D4' },
  { file: 'map-nukus.png', w: 1024, h: 576, from: '#EAE3D4', to: '#F5F1E8' },
  { file: 'og-default.png', w: 1200, h: 630, from: '#1B2A5B', to: '#16224A' },
]

/** Логотип-заглушка партнёра: монограмма на песочной подложке, без «текста в картинке» по смыслу. */
const partnerLogo = (abbr) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="96" viewBox="0 0 240 96" role="img">
  <rect width="240" height="96" rx="8" fill="#F5F1E8"/>
  <rect x="16" y="28" width="40" height="40" rx="8" fill="#1B2A5B"/>
  <text x="72" y="56" font-family="Inter, system-ui, sans-serif" font-size="22" font-weight="600" fill="#1B2A5B">${abbr}</text>
</svg>`

const partners = [
  ['edu.svg', 'EDU.UZ'],
  ['culture.svg', 'MADANIYAT'],
  ['hemis.svg', 'HEMIS'],
  ['mygov.svg', 'MY.GOV.UZ'],
  ['dtm.svg', 'DTM'],
  ['natlib.svg', 'NATLIB'],
]

/** Герб-заглушка института. */
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" role="img" aria-hidden="true" focusable="false">
  <rect width="48" height="48" rx="8" fill="#1B2A5B"/>
  <path d="M14 33V19l10-6 10 6v14" fill="none" stroke="#F5F1E8" stroke-width="2.5" stroke-linejoin="round"/>
  <circle cx="24" cy="25" r="3.5" fill="#C6522F"/>
</svg>`

await mkdir(path.join(root, 'partners'), { recursive: true })

const blur = {}
for (const item of raster) {
  const svg = gradient(item.w, item.h, item.from, item.to)
  const pipeline = sharp(svg)
  const out = item.file.endsWith('.png')
    ? await pipeline.png({ compressionLevel: 9 }).toBuffer()
    : await pipeline.jpeg({ quality: 78, progressive: true }).toBuffer()
  await writeFile(path.join(root, item.file), out)

  const tiny = await sharp(svg).resize(12, 12, { fit: 'fill' }).webp({ quality: 40 }).toBuffer()
  blur[item.file] = `data:image/webp;base64,${tiny.toString('base64')}`
}

for (const [file, abbr] of partners) {
  await writeFile(path.join(root, 'partners', file), partnerLogo(abbr))
}
await writeFile(path.join(root, 'logo.svg'), logoSvg)

// Blur-заглушки для двух базовых тонов кладём в модуль, чтобы вёрстка не считала их в рантайме
const blurModule = `/**
 * Base64-заглушки для placeholder="blur". Сгенерированы scripts/generate-placeholders.mjs.
 * Изображения, загруженные через CMS, приносят собственный blurDataURL.
 */
export const BLUR_INDIGO = '${blur['hero-institute.jpg']}'
export const BLUR_SAND = '${blur['map-nukus.png']}'
`
await writeFile(path.resolve(process.cwd(), 'src/lib/blur.ts'), blurModule)

console.log(`Готово: ${raster.length} растровых, ${partners.length} логотипов, blur-модуль обновлён.`)
