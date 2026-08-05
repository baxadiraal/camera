# Сайт Нукусского филиала УзГИИК

Многоязычный сайт государственного вуза на Next.js 15 (App Router) + TypeScript
+ Tailwind + Payload CMS. Заменяет прежний сайт на WordPress + Elementor.

Локали: **qq** (каракалпакская латиница, по умолчанию), **uz**, **ru**, **en**.
Маршруты `/qq`, `/uz`, `/ru`, `/en`; hreflang и `x-default` собираются в
`generateMetadata`.

---

## Быстрый старт

```bash
cp .env.example .env          # заполнить PAYLOAD_SECRET и DATABASE_URI
npm install
npm run dev                   # http://localhost:3000, админка — /admin
```

Без `DATABASE_URI` сайт тоже запускается: контент берётся из
`src/lib/fallback-content.ts`. Это же демо-содержимое заливается в базу:

```bash
npm run payload run scripts/seed.ts   # меню, страницы, услуги, новости, этапы приёма
npm run generate:types                # обновить src/payload-types.ts
```

Продакшн:

```bash
docker compose up -d --build          # web:3000 за системным nginx/Caddy + TLS
```

---

## Структура

```
├── Dockerfile / docker-compose.yml    Сборка и развёртывание (Next + Postgres)
├── tailwind.config.ts                 Токены дизайн-системы
├── next.config.ts                     next-intl + Payload, заголовки, картинки
├── scripts/
│   ├── generate-placeholders.mjs      Локальные картинки-заглушки и blur
│   ├── prepare-og-fonts.py            woff2 → ttf для динамических og:image
│   └── seed.ts                        Первичное наполнение CMS
├── public/
│   ├── fonts/                         Inter, self-hosted woff2 (4 подмножества)
│   │   └── og/                        Статические ttf для og:image
│   └── media/                         Изображения; uploads/ — том медиатеки
└── src/
    ├── app/
    │   ├── (frontend)/
    │   │   ├── globals.css            Шрифты, семантические токены, режимы a11y
    │   │   ├── api/og/route.tsx       Динамическая картинка для соцсетей
    │   │   └── [locale]/
    │   │       ├── layout.tsx         html/lang, шапка, подвал, согласие
    │   │       ├── page.tsx           ★ Главная страница
    │   │       ├── [...slug]/         Страницы разделов (2 уровня)
    │   │       ├── news/              Лента и карточка новости
    │   │       ├── search/            Результаты поиска
    │   │       ├── sitemap/           Карта сайта для людей
    │   │       ├── privacy/           Политика конфиденциальности
    │   │       └── not-found.tsx
    │   ├── (payload)/                 Админка и REST/GraphQL API Payload
    │   ├── sitemap.ts  robots.ts      Генерируются автоматически
    ├── components/
    │   ├── layout/    Header, MegaMenu, MobileMenu, LangSwitcher, SearchDialog,
    │   │              A11yToolbar, Footer, ConsentAnalytics
    │   ├── home/      Hero, QuickActions, AdmissionTimeline, StatsCounter,
    │   │              StatsSection, ServiceGrid, PartnerLogos
    │   ├── news/      NewsCard, NewsGrid
    │   ├── ui/        Picture, Section, ActionLink, ServiceIcon, Breadcrumbs,
    │   │              Pagination, YouTubeFacade, RichText
    │   └── seo/       JsonLd (EducationalOrganization, NewsArticle, BreadcrumbList)
    ├── i18n/          routing.ts, request.ts, navigation.ts
    ├── messages/      qq.json, uz.json, ru.json, en.json (по 105 ключей)
    ├── lib/           cms.ts (единственная точка доступа к Payload), seo.ts,
    │                  format.ts, admission.ts, slugify.ts, fallback-content.ts
    ├── payload/       collections/ (13), globals/ (2), fields/, access.ts
    ├── payload.config.ts
    └── middleware.ts
```

---

## Дизайн-система

Токены — в `tailwind.config.ts`, значения режимов — в `globals.css`.

| Назначение | Токен | Значение |
|---|---|---|
| Основной | `indigo` | `#1B2A5B` |
| Акцент | `accent` | `#C6522F` |
| Акцент под белым текстом | `accent-deep` / `action` | `#B0471F` |
| Терракотовый текст | `accent-text` / `ink-accent` | `#A8421F` |
| Фон секций | `sand` | `#F5F1E8` |
| Текст | `graphite` | `#1A1A1A` |
| Вторичный текст | `muted` | `#6B7280` |

Шкала 14/16/18/24/32/48/64 (`text-sm … text-h1`), межстрочный 1.5 для текста и
1.2 для заголовков, отступы кратны 4px, контейнер `max-w-[1280px]`, скругление
8px, ровно две тени (`shadow-soft`, `shadow-lifted`).

**Про контраст.** Базовая терракота `#C6522F` даёт с белым 4.49:1 — на волосок
ниже порога AA. Поэтому для заливок под белым текстом используется затемнённый
`#B0471F` (5.58:1), а для терракотового текста на светлом фоне — `#A8421F`
(6.0:1). Исходный оттенок остался декоративным: рамки, точки таймлайна, бейдж.

Поверх палитры лежит слой семантических токенов (`surface`, `ink`, `edge`,
`brand`, `action`) на CSS-переменных. Режим высокой контрастности меняет только
переменные — компоненты о нём не знают.

Шрифт — Inter Variable, self-hosted, четыре подмножества woff2 с
`font-display: swap` и предзагрузкой латиницы. Покрытие каракалпакской
диакритики проверено по cmap: `ǵ ń ǎ` в latin-ext, `ó ú á ı ʻ` в latin,
кириллица в cyrillic + cyrillic-ext. Обращений к Google Fonts нет.

---

## Информационная архитектура

Пять разделов, максимум два уровня, каждый родительский пункт — реальная
страница-хаб со списком дочерних страниц (ссылок на `#` в проекте нет):

1. **Институт** — история, устав, структура, руководство, факультеты, отделы, вакансии
2. **Поступление** — таймлайн 2026/2027, квоты, творческие экзамены, результаты,
   апелляция, магистратура, иностранным абитуриентам, техникум
3. **Обучение** — учебные планы, мобильность, гранты, аттестация, HEMIS
4. **Наука** — учёный совет, направления, журнал, международное сотрудничество, проекты
5. **Студенту** — стипендии, кружки, спорт, психолог, справки, оплата контракта

Меню целиком редактируется в админке (коллекция `menus`); в коде не захардкожен
ни один пункт. Пункт типа «список интерактивных услуг» разворачивается из
коллекции `services` — тот же источник, что и у блока услуг на главной.

---

## Контент-модель

Коллекции (все текстовые поля локализованы): `pages`, `news`, `announcements`,
`articles`, `departments`, `persons`, `services`, `documents`, `partners`,
`admission-stages`, `menus`, `media`, `users`.
Глобальные: `homepage` (первый экран и цифры), `site-settings` (контакты, карта,
соцсети, аналитика).

Особенности:

- **slug не локализуется** — один адрес на все языки, чтобы hreflang связывал
  страницы без редиректов; кириллица транслитерируется в латиницу до сохранения
  (`src/lib/slugify.ts`), процент-кодировки в URL не возникает;
- **alt обязателен** для каждого изображения и локализован; пустой alt возможен
  только у явно помеченных декоративных картинок;
- **blurDataURL** считается при загрузке файла в медиатеку (sharp, 12×12 webp);
- **статус этапа приёма** не хранится, а вычисляется из дат при рендере.

---

## Обязательные требования и как они выполнены

**Доступность (WCAG 2.1 AA).** Skip-link, видимое кольцо фокуса, `aria-expanded`
на всех раскрывающихся элементах, `aria-current` в меню и хлебных крошках,
мобильная панель с кольцевым обходом фокуса и Escape, у изображений осмысленный
alt на языке страницы. Тулбар «Версия для слабовидящих»: три шага размера
шрифта, высокий контраст, отключение изображений (вместо картинки показывается
её alt); состояние в `localStorage` и применяется инлайновым скриптом до первой
отрисовки.

**SEO.** `generateMetadata` на каждом маршруте, title ≤ 60 и description ≤ 155
символов (обрезка по границе слова), canonical + hreflang на четыре локали +
`x-default`. Каракалпакская версия помечена кодом `kaa`: код `qq` из URL лежит в
частном диапазоне BCP-47 и в hreflang не годится. Schema.org
`EducationalOrganization` на главной, `NewsArticle` в новостях, `BreadcrumbList`
на внутренних страницах. `sitemap.xml` и `robots.txt` генерируются
автоматически. Open Graph и Twitter Card с динамическим `og:image` (`/api/og`).

**Производительность.** Статическая генерация всех локалей с ISR
`revalidate = 300`. Главная тянет ~127 кБ JS в gzip (плюс отдельный
`nomodule`-бандл полифилов на 38 кБ, который современные браузеры не
исполняют) — в бюджете 150 кБ. YouTube только через фасад: до клика ни одного
запроса к youtube.com. Карта в подвале — статичная картинка со ссылкой на
Яндекс и Google Карты вместо iframe. Аналитика — self-hosted Umami или
Plausible, скрипт с `defer` и только после согласия; по умолчанию выключена.
Логотипы партнёров лежат в медиатеке, хотлинка на внешние домены нет.

---

## Замечания к содержимому

Тексты, цифры и фотографии в `src/lib/fallback-content.ts` — демонстрационные
заготовки для сборки и превью, а не официальные сведения института. Реальные
данные редакция вносит через админку; изображения в `public/media` —
сгенерированные градиенты-заглушки (`scripts/generate-placeholders.mjs`),
их нужно заменить настоящими фотографиями.

## Проверка

```bash
npm run typecheck    # строгий TypeScript, без ошибок
npm run build        # прод-сборка, 42 статические страницы
```
