import { getTranslations } from 'next-intl/server'
import { ActionLink } from '@/components/ui/ActionLink'

/** Страница 404 внутри локали: сохраняет язык, шапку и подвал. */
export default async function NotFound() {
  const t = await getTranslations('common')

  return (
    <div className="container-page flex flex-col items-start py-26">
      <p className="text-h3 font-semibold text-accent">404</p>
      <h1 className="mt-4 text-h4 text-ink-brand md:text-h3">{t('notFoundTitle')}</h1>
      <p className="mt-3 max-w-prose text-lg text-ink-muted">{t('notFoundText')}</p>
      <ActionLink href="/" className="mt-8">
        {t('backHome')}
      </ActionLink>
    </div>
  )
}
