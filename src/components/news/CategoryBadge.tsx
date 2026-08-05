import { getTranslations } from 'next-intl/server'

/**
 * Бейдж рубрики новости.
 *
 * В базе рубрика хранится кодом из select-поля (institute, admission, …),
 * а переводы лежат в словарях — так рубрику не приходится переводить руками
 * в каждой новости. Незнакомое значение выводится как есть.
 */
const CATEGORY_KEYS = ['institute', 'admission', 'science', 'culture', 'international'] as const
type CategoryKey = (typeof CATEGORY_KEYS)[number]

const isCategoryKey = (value: string): value is CategoryKey =>
  (CATEGORY_KEYS as readonly string[]).includes(value)

export async function CategoryBadge({ category }: { readonly category?: string }) {
  const t = await getTranslations('news')
  if (!category) return null

  const label = isCategoryKey(category) ? t(`categories.${category}`) : category

  return (
    <span className="rounded-pill bg-sand px-3 py-1 text-sm font-medium text-ink-brand">
      <span className="visually-hidden">{t('category')}: </span>
      {label}
    </span>
  )
}
