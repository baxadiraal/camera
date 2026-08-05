import type { CollectionConfig } from 'payload'
import { anyone, editorsOnly } from '../access'

/**
 * Медиатека. Все изображения сайта — включая логотипы партнёров — хранятся
 * здесь: внешний хотлинк запрещён.
 *
 * alt локализован и обязателен: пустой alt допустим только для декоративных
 * картинок, для них есть отдельный флаг isDecorative.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: { ru: 'Файл медиатеки', en: 'Media file' },
    plural: { ru: 'Медиатека', en: 'Media' },
  },
  admin: { group: { ru: 'Контент', en: 'Content' }, useAsTitle: 'filename' },
  access: { read: anyone, create: editorsOnly, update: editorsOnly, delete: editorsOnly },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Считаем крошечную base64-заглушку прямо при загрузке файла:
        // она уходит в placeholder="blur" и убирает скачок layout (CLS).
        const buffer = req.file?.data
        if (!buffer) return data
        try {
          const sharp = (await import('sharp')).default
          const tiny = await sharp(buffer)
            .resize(12, 12, { fit: 'inside' })
            .webp({ quality: 40 })
            .toBuffer()
          return { ...data, blurDataURL: `data:image/webp;base64,${tiny.toString('base64')}` }
        } catch {
          // Заглушка не критична — без неё просто не будет blur-эффекта
          return data
        }
      },
    ],
  },
  upload: {
    staticDir: process.env.PAYLOAD_MEDIA_DIR || 'public/media',
    mimeTypes: ['image/*'],
    // Ровно те размеры, что запрашивает next/image в вёрстке
    imageSizes: [
      { name: 'thumb', width: 384, height: 256, position: 'centre' },
      { name: 'card', width: 768, height: 512, position: 'centre' },
      { name: 'wide', width: 1280, height: 720, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
      { name: 'logo', width: 320, withoutEnlargement: true },
    ],
    formatOptions: { format: 'webp', options: { quality: 82 } },
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: { ru: 'Альтернативный текст', en: 'Alt text' },
      admin: {
        description: {
          ru: 'Опишите, что изображено, на языке страницы. Обязателен для всех смысловых картинок.',
          en: 'Describe the image in the page language. Required for all meaningful images.',
        },
        condition: (_, siblingData) => !siblingData?.isDecorative,
      },
      validate: (
        value: string | null | undefined,
        { siblingData }: { siblingData: Partial<{ isDecorative: boolean }> },
      ) => {
        if (siblingData?.isDecorative) return true
        if (typeof value === 'string' && value.trim().length >= 3) return true
        return 'Укажите осмысленный alt (или отметьте изображение декоративным)'
      },
    },
    {
      name: 'isDecorative',
      type: 'checkbox',
      defaultValue: false,
      label: { ru: 'Декоративное изображение (alt пустой)', en: 'Decorative image' },
    },
    {
      name: 'caption',
      type: 'text',
      localized: true,
      label: { ru: 'Подпись', en: 'Caption' },
    },
    {
      name: 'credit',
      type: 'text',
      label: { ru: 'Автор / источник', en: 'Credit' },
    },
    {
      name: 'blurDataURL',
      type: 'text',
      admin: { readOnly: true, hidden: true },
      label: { ru: 'Blur-заглушка', en: 'Blur placeholder' },
    },
  ],
}
