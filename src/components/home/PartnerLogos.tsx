import { getTranslations } from 'next-intl/server'
import { Picture } from '@/components/ui/Picture'
import type { PartnerItem } from '@/types/content'

/**
 * Полезные ресурсы: логотипы партнёров.
 *
 * Каждый файл лежит в нашей медиатеке — хотлинка на чужие сайты нет:
 * это и скорость, и отсутствие утечки IP посетителей на сторонние домены.
 * Alt логотипа — название организации, потому что ссылка ведёт именно туда.
 */
export async function PartnerLogos({ partners }: { readonly partners: readonly PartnerItem[] }) {
  const t = await getTranslations('partners')
  if (partners.length === 0) return null

  return (
    <section aria-labelledby="partners-title" className="bg-surface py-12 md:py-18">
      <div className="container-page">
        <h2 id="partners-title" className="text-h4 text-ink-brand md:text-h3">
          {t('title')}
        </h2>
        <p className="mt-2 text-base text-ink-muted">{t('subtitle')}</p>

        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => (
            <li key={partner.id}>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-24 items-center justify-center rounded border border-edge bg-surface p-4 transition-colors hover:border-brand"
              >
                <Picture
                  image={partner.logo}
                  sizes="(max-width: 640px) 45vw, 180px"
                  className="block"
                  imageClassName="h-auto max-h-14 w-auto object-contain"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
