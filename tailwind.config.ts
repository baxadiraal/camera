import type { Config } from 'tailwindcss'

/**
 * Дизайн-система Нукусского филиала УзГИИК.
 * Все значения — токены: в компонентах не должно быть «магических» цветов и размеров.
 *
 * Про контраст: базовая терракота #C6522F даёт с белым 4.49:1 — это ниже порога
 * WCAG 2.1 AA (4.5:1) для обычного текста. Поэтому для интерактивных элементов
 * с белым текстом (кнопки, бейджи) используется затемнённый оттенок
 * accent-deep #B0471F (5.58:1), а исходная терракота остаётся декоративной:
 * рамки, подчёркивания, крупные цифры.
 */
const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
  ],
  theme: {
    // Контейнер 1280px с отступами, кратными 4px
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem', // 16px
        md: '1.5rem', // 24px
        lg: '2rem', // 32px
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        // Основной — глубокий индиго
        indigo: {
          DEFAULT: '#1B2A5B',
          50: '#F2F4FA',
          100: '#E2E7F3',
          200: '#C2CBE4',
          300: '#94A3CC',
          400: '#5C71A8',
          500: '#33487F',
          600: '#1B2A5B', // базовый токен
          700: '#16224A',
          800: '#111A39',
          900: '#0B1226',
        },
        // Акцент — терракота (каракалпакское прикладное искусство)
        accent: {
          DEFAULT: '#C6522F',
          deep: '#B0471F', // для белого текста на заливке, контраст 5.58:1
          soft: '#F6E7E1', // мягкая подложка
          text: '#A8421F', // терракотовый текст на светлом фоне, 6.0:1
        },
        // Песочный фон секций
        sand: {
          DEFAULT: '#F5F1E8',
          dark: '#EAE3D4',
        },
        // Текст
        graphite: '#1A1A1A',
        muted: '#6B7280',
        line: '#E5E1D8', // разделители на песочном

        /**
         * Семантические токены поверх палитры. Их значения — CSS-переменные,
         * которые целиком переопределяются в режиме высокой контрастности
         * (см. globals.css). Поэтому фон, текст и рамки в компонентах
         * задаются именно этими токенами, а палитра выше — акценты и декор.
         */
        surface: {
          DEFAULT: 'var(--c-surface)',
          muted: 'var(--c-surface-muted)',
          inverse: 'var(--c-surface-inverse)',
        },
        ink: {
          DEFAULT: 'var(--c-ink)',
          muted: 'var(--c-ink-muted)',
          inverse: 'var(--c-ink-inverse)',
          brand: 'var(--c-ink-brand)',
          accent: 'var(--c-ink-accent)',
        },
        edge: {
          DEFAULT: 'var(--c-edge)',
          strong: 'var(--c-edge-strong)',
        },
        brand: {
          DEFAULT: 'var(--c-brand)',
          strong: 'var(--c-brand-strong)',
        },
        action: {
          DEFAULT: 'var(--c-action)',
          hover: 'var(--c-action-hover)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      // Шкала 14/16/18/24/32/48/64, line-height 1.5 для текста и 1.2 для заголовков
      fontSize: {
        sm: ['0.875rem', { lineHeight: '1.5' }], // 14
        base: ['1rem', { lineHeight: '1.5' }], // 16
        lg: ['1.125rem', { lineHeight: '1.5' }], // 18
        h4: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }], // 24
        h3: ['2rem', { lineHeight: '1.2', letterSpacing: '-0.015em' }], // 32
        h2: ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 48
        h1: ['4rem', { lineHeight: '1.2', letterSpacing: '-0.02em' }], // 64
      },
      // Отступы кратны 4px (Tailwind уже на шаге 4px, добавляем недостающие)
      spacing: {
        '18': '4.5rem', // 72
        '22': '5.5rem', // 88
        '26': '6.5rem', // 104
        '30': '7.5rem', // 120
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        card: '8px',
        pill: '999px',
      },
      // Ровно две мягкие тени — больше в системе нет
      boxShadow: {
        soft: '0 1px 2px rgba(26, 26, 26, 0.04), 0 4px 16px rgba(27, 42, 91, 0.06)',
        lifted: '0 8px 32px rgba(27, 42, 91, 0.12)',
        none: 'none',
      },
      maxWidth: {
        container: '1280px',
        prose: '72ch',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
