import { Picture } from '@/components/ui/Picture'
import { ActionLink } from '@/components/ui/ActionLink'
import type { HeroContent } from '@/types/content'

/**
 * Первый экран.
 *
 * Без карусели: один статичный кадр, один заголовок, одна кнопка.
 * Заголовок и подзаголовок — настоящий текст из CMS, не картинка,
 * поэтому они переводятся, индексируются и читаются скринридером.
 *
 * Фото грузится с priority и служит LCP-элементом; поверх лежит
 * непрозрачная индиговая заливка, которая гарантирует контраст текста
 * независимо от того, какую фотографию загрузил редактор.
 */
export function Hero({ hero }: { readonly hero: HeroContent }) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-surface-inverse">
      <Picture
        image={hero.image}
        sizes="100vw"
        priority
        fill
        className="absolute inset-0 -z-10 block"
        imageClassName="object-cover"
      />
      {/* Заливка поверх фото: контраст белого текста ≥ 7:1 при любом снимке */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 opacity-[0.88]"
      />

      <div className="container-page relative py-16 md:py-26">
        <div className="max-w-[52rem]">
          <p className="mb-4 inline-flex items-center gap-2 rounded-pill bg-accent px-3 py-1.5 text-sm font-medium text-white">
            2026/2027
          </p>
          <h1 id="hero-title" className="text-h3 text-white md:text-h1 text-balance">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-prose text-lg text-white">{hero.subtitle}</p>
          <div className="mt-8">
            <ActionLink href={hero.cta.href} variant="inverse">
              {hero.cta.label}
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  )
}
