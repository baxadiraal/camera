import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { Picture } from '@/components/ui/Picture'
import { ExternalIcon } from '@/components/ui/ServiceIcon'
import type { ContactBlock, NavItem } from '@/types/content'

interface FooterProps {
  readonly nav: readonly NavItem[]
  readonly contacts: ContactBlock
}

/**
 * Подвал: адрес, карта, транспорт, контакты, соцсети и служебные ссылки.
 *
 * Карта — статичная картинка со ссылкой на Яндекс и Google Карты.
 * Интерактивный iframe весит несколько сотен килобайт, ставит куки третьей
 * стороны и портит CLS, а задача «посмотреть, где мы находимся» решается
 * картинкой и переходом в карты одним кликом.
 */
export async function Footer({ nav, contacts }: FooterProps) {
  const t = await getTranslations('footer')
  const tSite = await getTranslations('site')
  const tNews = await getTranslations('news')
  const year = new Date().getFullYear()

  return (
    <footer className="border-t-4 border-accent bg-surface-inverse text-ink-inverse">
      <div className="container-page py-12 md:py-18">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr_1.2fr]">
          {/* Контакты */}
          <div>
            <p className="text-lg font-semibold text-ink-inverse">{tSite('fullName')}</p>

            <dl className="mt-6 space-y-4 text-base">
              <div>
                <dt className="text-sm text-ink-inverse">{t('address')}</dt>
                <dd className="mt-1 font-medium">{contacts.address}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-inverse">{t('phone')}</dt>
                <dd className="mt-1 flex flex-col gap-1">
                  {contacts.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/[^+\d]/g, '')}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {phone}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-inverse">{t('email')}</dt>
                <dd className="mt-1 flex flex-col gap-1">
                  {contacts.emails.map((email) => (
                    <a
                      key={email}
                      href={`mailto:${email}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {email}
                    </a>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-ink-inverse">{t('workingHours')}</dt>
                <dd className="mt-1 font-medium">{contacts.workingHours}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-inverse">{t('transport')}</dt>
                <dd className="mt-1">{contacts.transport}</dd>
              </div>
            </dl>
          </div>

          {/* Разделы сайта */}
          <nav aria-label={t('sections')}>
            <h2 className="text-lg font-semibold text-ink-inverse">{t('sections')}</h2>
            <ul className="mt-6 space-y-2">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-base underline-offset-4 hover:underline">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/news" className="text-base underline-offset-4 hover:underline">
                  {tNews('title')}
                </Link>
              </li>
            </ul>
          </nav>

          {/* Карта */}
          <div>
            <h2 className="text-lg font-semibold text-ink-inverse">{t('address')}</h2>
            <a
              href={contacts.mapYandexUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 block overflow-hidden rounded border border-white/20"
            >
              <Picture
                image={contacts.mapImage}
                sizes="(max-width: 1024px) 100vw, 400px"
                className="block"
                imageClassName="h-auto w-full object-cover"
              />
            </a>
            <div className="mt-3 flex flex-wrap gap-4 text-base">
              <a
                href={contacts.mapYandexUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline underline-offset-4"
              >
                {t('openMap')}
                <ExternalIcon className="h-4 w-4" />
              </a>
              <a
                href={contacts.mapGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 underline underline-offset-4"
              >
                {t('openMapGoogle')}
                <ExternalIcon className="h-4 w-4" />
              </a>
            </div>

            <h2 className="mt-8 text-lg font-semibold text-ink-inverse">{t('social')}</h2>
            <ul className="mt-4 flex flex-wrap gap-3">
              {contacts.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded border border-white/30 px-3 py-2 text-base transition-colors hover:border-white"
                  >
                    {social.label}
                    <ExternalIcon className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="container-page flex flex-col gap-3 py-6 text-sm md:flex-row md:items-center md:justify-between">
          <p>{t('rights', { year })}</p>
          <ul className="flex flex-wrap gap-4">
            <li>
              <Link href="/sitemap" className="underline underline-offset-4">
                {t('sitemap')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="underline underline-offset-4">
                {t('privacy')}
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
