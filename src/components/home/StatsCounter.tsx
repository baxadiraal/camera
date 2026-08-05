'use client'

import { useEffect, useRef, useState } from 'react'
import type { StatItem } from '@/types/content'

interface StatsCounterProps {
  readonly stats: readonly StatItem[]
  /** Готовые отформатированные значения — форматирование делает сервер */
  readonly formatted: readonly string[]
}

/**
 * Счётчики «Институт в цифрах».
 *
 * Итоговое число присутствует в серверной разметке — без JS и в поиске
 * пользователь видит финальные цифры. Анимация лишь оживляет уже готовое
 * значение при первом появлении блока в вьюпорте и полностью отключается
 * при prefers-reduced-motion.
 *
 * Число помечено aria-hidden, а рядом лежит визуально скрытая текстовая
 * версия: иначе скринридер зачитывал бы промежуточные значения анимации.
 */
export function StatsCounter({ stats, formatted }: StatsCounterProps) {
  const [progress, setProgress] = useState(0)
  const [animate, setAnimate] = useState(false)
  const ref = useRef<HTMLDListElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!animate) return

    const duration = 1200
    const start = performance.now()
    let frame = 0

    const tick = (time: number) => {
      const elapsed = Math.min(1, (time - start) / duration)
      // easeOutCubic: быстрый старт, мягкая остановка
      setProgress(1 - Math.pow(1 - elapsed, 3))
      if (elapsed < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [animate])

  return (
    <dl ref={ref} className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const finalText = `${formatted[index] ?? stat.value}${stat.suffix ?? ''}`
        const shown = animate
          ? `${Math.round(stat.value * progress)}${progress === 1 ? (stat.suffix ?? '') : ''}`
          : finalText

        return (
          // flex-col + order: цифра рисуется первой, но в разметке dt идёт до dd
          <div key={stat.id} className="flex flex-col border-t-2 border-accent pt-4">
            <dt className="order-2 mt-2 text-base text-ink-inverse">{stat.label}</dt>
            <dd className="order-1 text-h3 font-semibold text-ink-inverse md:text-h2">
              <span aria-hidden="true">{shown}</span>
              <span className="visually-hidden">{finalText}</span>
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
