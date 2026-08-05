import type { ServiceIcon as IconName } from '@/types/content'

/**
 * Иконки услуг — инлайновый SVG, а не картинки: текста внутри изображений нет,
 * цвет наследуется от currentColor, лишних запросов к сети не возникает.
 * Иконка всегда декоративна: смысл несёт подпись рядом.
 */
const PATHS: Record<IconName, string> = {
  application: 'M8 4h8l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm8 0v5h5M9 14h6M9 17h4',
  hemis: 'M4 8l8-4 8 4-8 4-8-4Zm0 0v6m4-2.5V16c0 1.7 1.8 3 4 3s4-1.3 4-3v-4.5',
  payment: 'M3 8h18M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2m-18 0v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8M7 14h4',
  schedule: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Zm4 8h2',
  library: 'M5 4h5v16H5zM12 4h3l3 16h-3zM4 20h16',
  dormitory: 'M4 20V9l8-5 8 5v11M10 20v-6h4v6M4 20h16',
  certificate: 'M7 3h10a1 1 0 0 1 1 1v13l-6 4-6-4V4a1 1 0 0 1 1-1Zm2 6h6M9 12h4',
  appeal: 'M4 5h16v11H9l-5 4V5Zm4 4h8M8 12h5',
  scholarship: 'M12 3l9 5-9 5-9-5 9-5Zm-5 8v4c0 1.7 2.2 3 5 3s5-1.3 5-3v-4M20 9v6',
  support: 'M12 3a7 7 0 0 0-7 7v4a3 3 0 0 0 3 3h1v-6H6m12 6h-1v-6h2m0 0v-1a7 7 0 0 0-7-7m7 13a4 4 0 0 1-4 4h-3',
}

interface ServiceIconProps {
  readonly name: IconName
  readonly className?: string
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}

/** Стрелка «вовне» для внешних ссылок. */
export function ExternalIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
    </svg>
  )
}
