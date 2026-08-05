import Image from 'next/image'
import type { ImageAsset } from '@/types/content'

interface PictureProps {
  readonly image: ImageAsset
  /** Обязателен: без него браузер скачает картинку максимального размера */
  readonly sizes: string
  readonly priority?: boolean
  /** Класс обёртки (позиционирование, соотношение сторон) */
  readonly className?: string
  readonly imageClassName?: string
  /** fill растягивает картинку по обёртке — обёртка должна быть position: relative */
  readonly fill?: boolean
  /**
   * Декоративная картинка: alt пустой, из дерева доступности убирается.
   * В режиме высокой контрастности такие изображения скрываются целиком.
   */
  readonly decorative?: boolean
}

/**
 * Изображение сайта.
 *
 * Три вещи, ради которых существует эта обёртка:
 *   • AVIF/WebP + srcset + lazy + blur-заглушка задаются в одном месте;
 *   • рядом рендерится текстовая замена, которая появляется, когда
 *     пользователь отключил изображения в тулбаре доступности;
 *   • alt нельзя забыть — он часть типа ImageAsset.
 */
export function Picture({
  image,
  sizes,
  priority = false,
  className,
  imageClassName,
  fill = false,
  decorative = false,
}: PictureProps) {
  const alt = decorative ? '' : image.alt

  return (
    <span className={className}>
      <Image
        src={image.url}
        alt={alt}
        {...(fill
          ? { fill: true }
          : { width: image.width, height: image.height })}
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : 'lazy'}
        placeholder={image.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={image.blurDataURL}
        className={imageClassName}
        data-a11y-image=""
        {...(decorative ? { 'data-decorative-photo': '', 'aria-hidden': true } : {})}
      />
      {!decorative && <span className="img-alt-note">{image.alt}</span>}
    </span>
  )
}
