import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Section, SectionHeader } from '@/components/ui/Section'
import { NewsCard } from './NewsCard'
import type { NewsItem } from '@/types/content'
import type { Locale } from '@/i18n/routing'

interface NewsGridProps {
  readonly items: readonly NewsItem[]
  readonly locale: Locale
}

/**
 * Блок новостей на главной: одна крупная карточка и три обычных.
 * Если новостей меньше — сетка просто схлопывается, «пустых» плиток нет.
 */
export async function NewsGrid({ items, locale }: NewsGridProps) {
  const t = await getTranslations('news')

  if (items.length === 0) {
    return (
      <Section labelledBy="news-title">
        <SectionHeader id="news-title" title={t('title')} subtitle={t('subtitle')} />
        <p className="text-base text-ink-muted">{t('empty')}</p>
      </Section>
    )
  }

  const [featured, ...rest] = items
  const secondary = rest.slice(0, 3)

  return (
    <Section labelledBy="news-title">
      <SectionHeader
        id="news-title"
        title={t('title')}
        subtitle={t('subtitle')}
        action={
          <Link
            href="/news"
            className="text-base font-medium text-ink-accent underline underline-offset-4"
          >
            {t('all')}
          </Link>
        }
      />

      <div className="grid gap-6">
        {featured && <NewsCard item={featured} locale={locale} variant="feature" />}

        {secondary.length > 0 && (
          <ul className="grid gap-6 md:grid-cols-3">
            {secondary.map((item) => (
              <li key={item.id} className="h-full">
                <NewsCard item={item} locale={locale} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  )
}
