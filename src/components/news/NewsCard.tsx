import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Picture } from '@/components/ui/Picture'
import { CategoryBadge } from './CategoryBadge'
import { formatDate } from '@/lib/format'
import { truncateOnWord } from '@/lib/format'
import type { NewsItem } from '@/types/content'
import type { Locale } from '@/i18n/routing'

interface NewsCardProps {
  readonly item: NewsItem
  readonly locale: Locale
  /** feature — крупная карточка первой новости на главной */
  readonly variant?: 'feature' | 'compact'
  /** Заголовок карточки задаёт уровень: на главной это h3 внутри секции h2 */
  readonly headingLevel?: 2 | 3
}

/**
 * Карточка новости.
 *
 * Кликабелен заголовок, а не вся карточка целиком: так в списке ссылок
 * скринридера остаётся ровно один осмысленный пункт на новость.
 * Дата — обычный текст в <time>, ссылкой она не является.
 * Анонс обрезается по границе слова на 140 символах.
 */
export async function NewsCard({
  item,
  locale,
  variant = 'compact',
  headingLevel = 3,
}: NewsCardProps) {
  const t = await getTranslations('news')
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const isFeature = variant === 'feature'

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded border border-edge bg-surface transition-shadow hover:shadow-soft ${
        isFeature ? 'md:flex-row' : ''
      }`}
    >
      {item.cover && (
        <Picture
          image={item.cover}
          sizes={
            isFeature
              ? '(max-width: 768px) 100vw, 640px'
              : '(max-width: 640px) 100vw, (max-width: 1280px) 33vw, 400px'
          }
          className={`block overflow-hidden bg-surface-muted ${
            isFeature ? 'md:w-1/2 md:shrink-0' : ''
          }`}
          imageClassName={`h-full w-full object-cover ${isFeature ? 'aspect-[16/10]' : 'aspect-[16/9]'}`}
        />
      )}

      <div className={`flex flex-1 flex-col p-5 ${isFeature ? 'md:p-8' : ''}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <CategoryBadge category={item.category} />
          {/* Дата — текст, не ссылка */}
          <time dateTime={item.publishedAt} className="text-sm text-ink-muted">
            {formatDate(item.publishedAt, locale)}
          </time>
        </div>

        <Heading
          className={`font-semibold text-ink-brand ${isFeature ? 'text-h4 md:text-h3' : 'text-lg'}`}
        >
          <Link
            href={`/news/${item.slug}`}
            className="underline-offset-4 hover:underline focus-visible:underline"
          >
            {item.title}
          </Link>
        </Heading>

        {item.excerpt && (
          <p className="mt-3 text-base text-ink-muted">{truncateOnWord(item.excerpt, 140)}</p>
        )}
      </div>
    </article>
  )
}
