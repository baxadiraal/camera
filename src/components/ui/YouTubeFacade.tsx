'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import type { ImageAsset } from '@/types/content'

interface YouTubeFacadeProps {
  readonly videoId: string
  readonly title: string
  /** Превью из нашей медиатеки: кадр с ytimg.com был бы внешним запросом */
  readonly poster: ImageAsset
}

/**
 * Фасад YouTube.
 *
 * До клика на странице нет ни одного запроса к youtube.com: только локальная
 * картинка и кнопка. Плеер (около 900 КБ скриптов и куки третьей стороны)
 * подключается лишь по явному действию пользователя, уже с autoplay,
 * поэтому второй клик не нужен.
 */
export function YouTubeFacade({ videoId, title, poster }: YouTubeFacadeProps) {
  const t = useTranslations('video')
  const [isActive, setIsActive] = useState(false)

  if (isActive) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded bg-graphite">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    )
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded bg-surface-muted">
      <Image
        src={poster.url}
        alt={poster.alt || t('coverAlt', { title })}
        fill
        sizes="(max-width: 768px) 100vw, 720px"
        placeholder={poster.blurDataURL ? 'blur' : 'empty'}
        blurDataURL={poster.blurDataURL}
        className="object-cover"
        data-a11y-image=""
      />
      <button
        type="button"
        onClick={() => setIsActive(true)}
        aria-label={t('play', { title })}
        aria-describedby={`yt-hint-${videoId}`}
        className="absolute inset-0 flex items-center justify-center bg-indigo-900/40 transition-colors hover:bg-indigo-900/55"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-accent-deep">
          <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8 fill-white" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </button>
      <p id={`yt-hint-${videoId}`} className="visually-hidden">
        {t('hint')}
      </p>
    </div>
  )
}
