import type { Locale } from '@/i18n/routing'
import type {
  AdmissionStage,
  ContactBlock,
  HeroContent,
  ImageAsset,
  NavItem,
  NewsItem,
  PartnerItem,
  QuickAction,
  ServiceItem,
  StatItem,
} from '@/types/content'
import { BLUR_INDIGO, BLUR_SAND } from './blur'

/**
 * Демонстрационный контент.
 *
 * Он решает две задачи:
 *   1) сайт собирается и открывается, даже когда база ещё не поднята
 *      (первый запуск, CI, превью вёрстки);
 *   2) служит сидом для CMS — scripts/seed.ts заливает ровно эти данные.
 *
 * Реальные тексты, цифры и фотографии редактор заменяет в админке;
 * цифры и даты ниже — заготовка, а не официальные сведения.
 */

/** Строка на четырёх языках. */
type L10n = Readonly<Record<Locale, string>>

export const pick = (value: L10n, locale: Locale): string => value[locale]

const image = (
  url: string,
  alt: L10n,
  width: number,
  height: number,
  blurDataURL: string,
) => ({ url, alt, width, height, blurDataURL })

type L10nImage = ReturnType<typeof image>

const resolveImage = (source: L10nImage, locale: Locale): ImageAsset => ({
  url: source.url,
  alt: source.alt[locale],
  width: source.width,
  height: source.height,
  blurDataURL: source.blurDataURL,
})

/* ──────────────────────────── Навигация ──────────────────────────── */

interface NavSeedChild {
  readonly label: L10n
  readonly href: string
}
interface NavSeedItem extends NavSeedChild {
  readonly children: readonly NavSeedChild[]
}

export const NAV_SEED: readonly NavSeedItem[] = [
  {
    label: { qq: 'Institut', uz: 'Institut', ru: 'Институт', en: 'Institute' },
    href: '/institute',
    children: [
      {
        label: { qq: 'Tariyx', uz: 'Tarix', ru: 'История', en: 'History' },
        href: '/institute/history',
      },
      {
        label: { qq: 'Ustav', uz: 'Ustav', ru: 'Устав', en: 'Statute' },
        href: '/institute/statute',
      },
      {
        label: { qq: 'Dúzilis', uz: 'Tuzilma', ru: 'Структура', en: 'Structure' },
        href: '/institute/structure',
      },
      {
        label: { qq: 'Basshılıq', uz: 'Rahbariyat', ru: 'Руководство', en: 'Leadership' },
        href: '/institute/leadership',
      },
      {
        label: { qq: 'Fakultetler', uz: 'Fakultetlar', ru: 'Факультеты', en: 'Faculties' },
        href: '/institute/faculties',
      },
      {
        label: { qq: 'Bólimler', uz: 'Boʻlimlar', ru: 'Отделы', en: 'Offices' },
        href: '/institute/offices',
      },
      {
        label: { qq: 'Boslıqlar', uz: 'Boʻsh ish oʻrinlari', ru: 'Вакансии', en: 'Vacancies' },
        href: '/institute/vacancies',
      },
    ],
  },
  {
    label: { qq: 'Qabıllaw', uz: 'Qabul', ru: 'Поступление', en: 'Admission' },
    href: '/admission',
    children: [
      {
        label: {
          qq: '2026/2027 qabıllaw kestesi',
          uz: '2026/2027 qabul jadvali',
          ru: 'Таймлайн приёма 2026/2027',
          en: 'Admission timeline 2026/2027',
        },
        href: '/admission/timeline',
      },
      {
        label: { qq: 'Kvotalar', uz: 'Kvotalar', ru: 'Квоты', en: 'Quotas' },
        href: '/admission/quotas',
      },
      {
        label: {
          qq: 'Dóretiwshilik imtixanları',
          uz: 'Ijodiy imtihonlar',
          ru: 'Творческие экзамены',
          en: 'Creative entrance exams',
        },
        href: '/admission/creative-exams',
      },
      {
        label: { qq: 'Nátiyjeler', uz: 'Natijalar', ru: 'Результаты', en: 'Results' },
        href: '/admission/results',
      },
      {
        label: { qq: 'Apellyaciya', uz: 'Apellyatsiya', ru: 'Апелляция', en: 'Appeals' },
        href: '/admission/appeal',
      },
      {
        label: { qq: 'Magistratura', uz: 'Magistratura', ru: 'Магистратура', en: 'Master’s programmes' },
        href: '/admission/master',
      },
      {
        label: {
          qq: 'Shet el abituriyentlerine',
          uz: 'Xorijiy abituriyentlarga',
          ru: 'Иностранным абитуриентам',
          en: 'International applicants',
        },
        href: '/admission/international',
      },
      {
        label: { qq: 'Texnikum', uz: 'Texnikum', ru: 'Техникум', en: 'College' },
        href: '/admission/college',
      },
    ],
  },
  {
    label: { qq: 'Oqıw', uz: 'Taʼlim', ru: 'Обучение', en: 'Education' },
    href: '/education',
    children: [
      {
        label: { qq: 'Oqıw rejeleri', uz: 'Oʻquv rejalari', ru: 'Учебные планы', en: 'Curricula' },
        href: '/education/curricula',
      },
      {
        label: {
          qq: 'Akademiyalıq mobillik',
          uz: 'Akademik mobillik',
          ru: 'Академическая мобильность',
          en: 'Academic mobility',
        },
        href: '/education/mobility',
      },
      {
        label: { qq: 'Grantlar', uz: 'Grantlar', ru: 'Гранты', en: 'Grants' },
        href: '/education/grants',
      },
      {
        label: { qq: 'Attestaciya', uz: 'Attestatsiya', ru: 'Аттестация', en: 'Assessment' },
        href: '/education/assessment',
      },
      { label: { qq: 'HEMIS', uz: 'HEMIS', ru: 'HEMIS', en: 'HEMIS' }, href: '/education/hemis' },
    ],
  },
  {
    label: { qq: 'Ilim', uz: 'Ilm-fan', ru: 'Наука', en: 'Research' },
    href: '/research',
    children: [
      {
        label: { qq: 'Ilimiy keńes', uz: 'Ilmiy kengash', ru: 'Учёный совет', en: 'Academic council' },
        href: '/research/council',
      },
      {
        label: {
          qq: 'Izertlew baǵdarları',
          uz: 'Tadqiqot yoʻnalishlari',
          ru: 'Направления исследований',
          en: 'Research areas',
        },
        href: '/research/areas',
      },
      {
        label: { qq: 'Jurnal', uz: 'Jurnal', ru: 'Журнал', en: 'Journal' },
        href: '/research/journal',
      },
      {
        label: {
          qq: 'Xalıqaralıq baylanıslar',
          uz: 'Xalqaro hamkorlik',
          ru: 'Международное сотрудничество',
          en: 'International cooperation',
        },
        href: '/research/international',
      },
      {
        label: { qq: 'Joybarlar', uz: 'Loyihalar', ru: 'Проекты', en: 'Projects' },
        href: '/research/projects',
      },
    ],
  },
  {
    label: { qq: 'Studentke', uz: 'Talabaga', ru: 'Студенту', en: 'Students' },
    href: '/students',
    children: [
      {
        label: { qq: 'Stipendiyalar', uz: 'Stipendiyalar', ru: 'Стипендии', en: 'Scholarships' },
        href: '/students/scholarships',
      },
      {
        label: { qq: 'Tógerekler', uz: 'Toʻgaraklar', ru: 'Кружки', en: 'Student clubs' },
        href: '/students/clubs',
      },
      {
        label: { qq: 'Sport', uz: 'Sport', ru: 'Спорт', en: 'Sports' },
        href: '/students/sport',
      },
      {
        label: { qq: 'Psixolog', uz: 'Psixolog', ru: 'Психолог', en: 'Counselling' },
        href: '/students/counselling',
      },
      {
        label: { qq: 'Anıqlamalar', uz: 'Maʼlumotnomalar', ru: 'Справки', en: 'Certificates' },
        href: '/students/certificates',
      },
      {
        label: {
          qq: 'Kontrakt tólewi',
          uz: 'Kontrakt toʻlovi',
          ru: 'Оплата контракта',
          en: 'Tuition payment',
        },
        href: '/students/tuition',
      },
    ],
  },
]

export const getFallbackNavigation = (locale: Locale): readonly NavItem[] =>
  NAV_SEED.map((item) => ({
    label: item.label[locale],
    href: item.href,
    children: item.children.map((child) => ({
      label: child.label[locale],
      href: child.href,
    })),
  }))

/* ─────────────────────────── Первый экран ─────────────────────────── */

const HERO_IMAGE = image(
  '/media/hero-institute.jpg',
  {
    qq: 'Institut bas imaratınıń aldındaǵı alańda turǵan studentler',
    uz: 'Institut bosh binosi oldidagi maydonda turgan talabalar',
    ru: 'Студенты на площади перед главным корпусом института',
    en: 'Students on the square in front of the main institute building',
  },
  1920,
  1080,
  BLUR_INDIGO,
)

export const HERO_SEED = {
  title: {
    qq: 'Qaraqalpaqstannıń kórkem óneri — jańa áwladtıń qolında',
    uz: 'Qoraqalpogʻiston sanʼati — yangi avlod qoʻlida',
    ru: 'Искусство Каракалпакстана — в руках нового поколения',
    en: 'The art of Karakalpakstan in the hands of a new generation',
  } satisfies L10n,
  subtitle: {
    qq: 'Muzıka, teatr, súwretlew óneri hám mádeniyat tarawları boyınsha bakalavr hám magistr baǵdarları. 2026-jıl qabıllawı ashıq.',
    uz: 'Musiqa, teatr, tasviriy sanʼat va madaniyat yoʻnalishlari boʻyicha bakalavr va magistr dasturlari. 2026-yil qabuli ochiq.',
    ru: 'Программы бакалавриата и магистратуры по музыке, театру, изобразительному искусству и культуре. Приём 2026 года открыт.',
    en: 'Bachelor’s and master’s programmes in music, theatre, fine arts and culture. Admission for 2026 is open.',
  } satisfies L10n,
  ctaLabel: {
    qq: 'Qabıllaw shártleri',
    uz: 'Qabul shartlari',
    ru: 'Условия поступления',
    en: 'How to apply',
  } satisfies L10n,
  ctaHref: '/admission',
  image: HERO_IMAGE,
}

export const getFallbackHero = (locale: Locale): HeroContent => ({
  title: HERO_SEED.title[locale],
  subtitle: HERO_SEED.subtitle[locale],
  cta: { label: HERO_SEED.ctaLabel[locale], href: HERO_SEED.ctaHref },
  image: resolveImage(HERO_SEED.image, locale),
})

/* ───────────────────── Услуги и быстрые действия ───────────────────── */

interface ServiceSeed {
  readonly id: string
  readonly title: L10n
  readonly description?: L10n
  readonly href: string
  readonly external: boolean
  readonly icon: ServiceItem['icon']
  readonly quickAction: boolean
  readonly showOnHome: boolean
  readonly showInMenu: boolean
}

export const SERVICES_SEED: readonly ServiceSeed[] = [
  {
    id: 'apply',
    title: { qq: 'Arza beriw', uz: 'Ariza berish', ru: 'Подать заявку', en: 'Apply online' },
    description: {
      qq: 'Abituriyenttiń jeke kabineti arqalı',
      uz: 'Abituriyent shaxsiy kabineti orqali',
      ru: 'Через личный кабинет абитуриента',
      en: 'Through the applicant’s personal account',
    },
    href: '/admission/apply',
    external: false,
    icon: 'application',
    quickAction: true,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'hemis',
    title: { qq: 'HEMIS', uz: 'HEMIS', ru: 'HEMIS', en: 'HEMIS' },
    description: {
      qq: 'Bilimlendiriw procesin basqarıw sisteması',
      uz: 'Taʼlim jarayonini boshqarish tizimi',
      ru: 'Система управления учебным процессом',
      en: 'Learning management system',
    },
    href: '/education/hemis',
    external: false,
    icon: 'hemis',
    quickAction: true,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'tuition',
    title: {
      qq: 'Kontrakt bahası',
      uz: 'Kontrakt narxi',
      ru: 'Стоимость контракта',
      en: 'Tuition fees',
    },
    description: {
      qq: 'Baǵdarlar boyınsha tólem muǵdarı',
      uz: 'Yoʻnalishlar boʻyicha toʻlov miqdori',
      ru: 'Размер оплаты по направлениям',
      en: 'Fees by programme',
    },
    href: '/students/tuition',
    external: false,
    icon: 'payment',
    quickAction: true,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'exam-schedule',
    title: {
      qq: 'Imtixan kestesi',
      uz: 'Imtihon jadvali',
      ru: 'Расписание экзаменов',
      en: 'Exam schedule',
    },
    description: {
      qq: 'Dóretiwshilik imtixanları kúnleri',
      uz: 'Ijodiy imtihonlar kunlari',
      ru: 'Даты творческих экзаменов',
      en: 'Creative exam dates',
    },
    href: '/admission/exam-schedule',
    external: false,
    icon: 'schedule',
    quickAction: true,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'library',
    title: {
      qq: 'Elektron kitapxana',
      uz: 'Elektron kutubxona',
      ru: 'Электронная библиотека',
      en: 'Digital library',
    },
    href: '/students/library',
    external: false,
    icon: 'library',
    quickAction: false,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'dormitory',
    title: { qq: 'Jatakxana', uz: 'Yotoqxona', ru: 'Общежитие', en: 'Dormitory' },
    href: '/students/dormitory',
    external: false,
    icon: 'dormitory',
    quickAction: false,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'certificates',
    title: {
      qq: 'Anıqlama buyırtpası',
      uz: 'Maʼlumotnoma buyurtmasi',
      ru: 'Заказ справки',
      en: 'Request a certificate',
    },
    href: '/students/certificates',
    external: false,
    icon: 'certificate',
    quickAction: false,
    showOnHome: true,
    showInMenu: true,
  },
  {
    id: 'appeal',
    title: {
      qq: 'Elektron múrájat',
      uz: 'Elektron murojaat',
      ru: 'Электронное обращение',
      en: 'Online enquiry',
    },
    href: '/institute/enquiry',
    external: false,
    icon: 'appeal',
    quickAction: false,
    showOnHome: true,
    showInMenu: true,
  },
]

export const getFallbackServices = (locale: Locale): readonly ServiceItem[] =>
  SERVICES_SEED.filter((s) => s.showOnHome).map((s) => ({
    id: s.id,
    title: s.title[locale],
    description: s.description?.[locale],
    href: s.href,
    external: s.external,
    icon: s.icon,
  }))

export const getFallbackQuickActions = (locale: Locale): readonly QuickAction[] =>
  SERVICES_SEED.filter((s) => s.quickAction).map((s) => ({
    id: s.id,
    title: s.title[locale],
    hint: s.description?.[locale],
    href: s.href,
    external: s.external,
    icon: s.icon,
  }))

/* ────────────────────── Этапы приёмной кампании ────────────────────── */

interface StageSeed {
  readonly id: string
  readonly title: L10n
  readonly description: L10n
  readonly startDate: string
  readonly endDate?: string
  readonly href?: string
}

export const STAGES_SEED: readonly StageSeed[] = [
  {
    id: 'docs',
    title: {
      qq: 'Hújjetlerdi qabıllaw',
      uz: 'Hujjatlar qabuli',
      ru: 'Приём документов',
      en: 'Document submission',
    },
    description: {
      qq: 'Onlayn arza hám hújjetlerdi júklew',
      uz: 'Onlayn ariza va hujjatlarni yuklash',
      ru: 'Онлайн-заявка и загрузка документов',
      en: 'Online application and document upload',
    },
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    href: '/admission/apply',
  },
  {
    id: 'creative',
    title: {
      qq: 'Dóretiwshilik imtixanları',
      uz: 'Ijodiy imtihonlar',
      ru: 'Творческие экзамены',
      en: 'Creative entrance exams',
    },
    description: {
      qq: 'Mamanlıq boyınsha tıńlaw hám kórik',
      uz: 'Mutaxassislik boʻyicha tinglov va koʻrik',
      ru: 'Прослушивания и просмотры по специальности',
      en: 'Auditions and portfolio reviews',
    },
    startDate: '2026-07-05',
    endDate: '2026-07-20',
    href: '/admission/creative-exams',
  },
  {
    id: 'exam',
    title: {
      qq: 'Test sınaqları',
      uz: 'Test sinovlari',
      ru: 'Тестовые испытания',
      en: 'Entrance tests',
    },
    description: {
      qq: 'Mámleketlik test orayında',
      uz: 'Davlat test markazida',
      ru: 'В Государственном центре тестирования',
      en: 'At the State Testing Centre',
    },
    startDate: '2026-08-01',
    endDate: '2026-08-10',
  },
  {
    id: 'results',
    title: { qq: 'Nátiyjeler', uz: 'Natijalar', ru: 'Результаты', en: 'Results' },
    description: {
      qq: 'Qabıllanǵanlar dizimin járiyalaw',
      uz: 'Qabul qilinganlar roʻyxatini eʼlon qilish',
      ru: 'Публикация списков зачисленных',
      en: 'Publication of admitted applicants',
    },
    startDate: '2026-08-20',
    href: '/admission/results',
  },
  {
    id: 'enrollment',
    title: {
      qq: 'Oqıwǵa qabıllaw',
      uz: 'Oʻqishga qabul qilish',
      ru: 'Зачисление',
      en: 'Enrolment',
    },
    description: {
      qq: 'Buyrıqlar hám kontrakt shártnamaları',
      uz: 'Buyruqlar va kontrakt shartnomalari',
      ru: 'Приказы и договоры контракта',
      en: 'Orders and tuition contracts',
    },
    startDate: '2026-08-25',
    endDate: '2026-09-05',
  },
]

export const getFallbackStages = (locale: Locale): readonly AdmissionStage[] =>
  STAGES_SEED.map((s) => ({
    id: s.id,
    title: s.title[locale],
    description: s.description[locale],
    startDate: s.startDate,
    endDate: s.endDate,
    href: s.href,
  }))

/* ──────────────────────────── Новости ──────────────────────────── */

interface NewsSeed {
  readonly id: string
  readonly slug: string
  readonly title: L10n
  readonly excerpt: L10n
  readonly publishedAt: string
  readonly category: L10n
  readonly cover: L10nImage
}

export const NEWS_SEED: readonly NewsSeed[] = [
  {
    id: 'news-1',
    slug: 'open-day-2026',
    title: {
      qq: 'Institutta «Ashıq esikler kúni» ótkeriledi',
      uz: 'Institutda «Ochiq eshiklar kuni» oʻtkaziladi',
      ru: 'В институте пройдёт День открытых дверей',
      en: 'The institute will hold an Open Day',
    },
    excerpt: {
      qq: 'Abituriyentler baǵdarlar menen tanısıp, dóretiwshilik imtixanları talapları boyınsha oqıtıwshılardan tuwrıdan-tuwrı juwap ala aladı.',
      uz: 'Abituriyentlar yoʻnalishlar bilan tanishib, ijodiy imtihonlar talablari boʻyicha oʻqituvchilardan bevosita javob olishlari mumkin.',
      ru: 'Абитуриенты познакомятся с направлениями подготовки и смогут задать вопросы преподавателям о требованиях творческих экзаменов.',
      en: 'Applicants will explore the programmes and ask lecturers about the creative exam requirements.',
    },
    publishedAt: '2026-03-18T09:00:00.000Z',
    category: {
      qq: 'Qabıllaw',
      uz: 'Qabul',
      ru: 'Приём',
      en: 'Admissions',
    },
    cover: image(
      '/media/news-open-day.jpg',
      {
        qq: 'Institut zalında abituriyentler menen ushırasıw',
        uz: 'Institut zalida abituriyentlar bilan uchrashuv',
        ru: 'Встреча с абитуриентами в зале института',
        en: 'A meeting with applicants in the institute hall',
      },
      1280,
      720,
      BLUR_SAND,
    ),
  },
  {
    id: 'news-2',
    slug: 'karakalpak-folk-ensemble-award',
    title: {
      qq: 'Studentler ansambli respublika baýragında birinshi orın iyeledi',
      uz: 'Talabalar ansambli respublika koʻrigida birinchi oʻrinni egalladi',
      ru: 'Студенческий ансамбль занял первое место на республиканском смотре',
      en: 'Student ensemble takes first place at the national showcase',
    },
    excerpt: {
      qq: 'Xalıq ásbapları ansambli Tashkentte ótken kórikte joqarı bahaǵa iye boldı.',
      uz: 'Xalq cholgʻulari ansambli Toshkentda oʻtgan koʻrikda yuqori baho oldi.',
      ru: 'Ансамбль народных инструментов получил высшую оценку жюри на смотре в Ташкенте.',
      en: 'The folk instruments ensemble earned the jury’s top score at the Tashkent showcase.',
    },
    publishedAt: '2026-03-11T12:30:00.000Z',
    category: {
      qq: 'Mádeniyat',
      uz: 'Madaniyat',
      ru: 'Культура',
      en: 'Culture',
    },
    cover: image(
      '/media/news-ensemble.jpg',
      {
        qq: 'Xalıq ásbapları ansambli saxnada',
        uz: 'Xalq cholgʻulari ansambli sahnada',
        ru: 'Ансамбль народных инструментов на сцене',
        en: 'The folk instruments ensemble on stage',
      },
      1280,
      720,
      BLUR_SAND,
    ),
  },
  {
    id: 'news-3',
    slug: 'new-scientific-journal-issue',
    title: {
      qq: 'Instituttıń ilimiy jurnalınıń jańa sanı shıqtı',
      uz: 'Institut ilmiy jurnalining yangi soni chiqdi',
      ru: 'Вышел новый номер научного журнала института',
      en: 'A new issue of the institute’s research journal is out',
    },
    excerpt: {
      qq: 'Sanda Aral boyı mádeniy mıyrasın saqlaw máselelerine baǵıshlanǵan on eki maqala járiyalandı.',
      uz: 'Sonda Orol boʻyi madaniy merosini saqlash masalalariga bagʻishlangan oʻn ikki maqola eʼlon qilindi.',
      ru: 'В номере опубликованы двенадцать статей о сохранении культурного наследия Приаралья.',
      en: 'The issue features twelve papers on preserving the cultural heritage of the Aral Sea region.',
    },
    publishedAt: '2026-03-04T08:15:00.000Z',
    category: { qq: 'Ilim', uz: 'Ilm-fan', ru: 'Наука', en: 'Research' },
    cover: image(
      '/media/news-journal.jpg',
      {
        qq: 'Ilimiy jurnaldıń jańa sanı stol üstinde',
        uz: 'Ilmiy jurnalning yangi soni stol ustida',
        ru: 'Новый номер научного журнала на столе',
        en: 'The new journal issue on a desk',
      },
      1280,
      720,
      BLUR_SAND,
    ),
  },
  {
    id: 'news-4',
    slug: 'exchange-programme-with-tashkent',
    title: {
      qq: 'Tashkent institutı menen almasıw baǵdarlaması baslandı',
      uz: 'Toshkent instituti bilan almashuv dasturi boshlandi',
      ru: 'Запущена программа обмена с институтом в Ташкенте',
      en: 'Exchange programme with the Tashkent institute launched',
    },
    excerpt: {
      qq: 'Bir semestr dawamında on studentimiz Tashkentte, bes student bizde oqıydı.',
      uz: 'Bir semestr davomida oʻnta talabamiz Toshkentda, besh talaba bizda oʻqiydi.',
      ru: 'В течение семестра десять наших студентов будут учиться в Ташкенте, пятеро приедут к нам.',
      en: 'Ten of our students will study in Tashkent this semester, while five will join us.',
    },
    publishedAt: '2026-02-25T10:00:00.000Z',
    category: {
      qq: 'Xalıqaralıq',
      uz: 'Xalqaro',
      ru: 'Международное',
      en: 'International',
    },
    cover: image(
      '/media/news-exchange.jpg',
      {
        qq: 'Eki institut wákilleriniń keleisim imzalawı',
        uz: 'Ikki institut vakillarining kelishuv imzolashi',
        ru: 'Подписание соглашения представителями двух институтов',
        en: 'Representatives of the two institutes signing an agreement',
      },
      1280,
      720,
      BLUR_SAND,
    ),
  },
]

export const getFallbackNews = (locale: Locale): readonly NewsItem[] =>
  NEWS_SEED.map((n) => ({
    id: n.id,
    slug: n.slug,
    title: n.title[locale],
    excerpt: n.excerpt[locale],
    publishedAt: n.publishedAt,
    category: n.category[locale],
    cover: resolveImage(n.cover, locale),
  }))

/* ───────────────────────── Цифры института ───────────────────────── */

interface StatSeed {
  readonly id: string
  readonly value: number
  readonly label: L10n
  readonly suffix?: string
}

export const STATS_SEED: readonly StatSeed[] = [
  {
    id: 'students',
    value: 1240,
    label: { qq: 'Student', uz: 'Talaba', ru: 'Студентов', en: 'Students' },
  },
  {
    id: 'teachers',
    value: 118,
    label: {
      qq: 'Oqıtıwshı',
      uz: 'Oʻqituvchi',
      ru: 'Преподавателей',
      en: 'Lecturers',
    },
  },
  {
    id: 'programmes',
    value: 14,
    label: {
      qq: 'Tálim baǵdarı',
      uz: 'Taʼlim yoʻnalishi',
      ru: 'Направлений',
      en: 'Programmes',
    },
  },
  {
    id: 'founded',
    value: 2019,
    label: {
      qq: 'Shólkemlestirilgen jılı',
      uz: 'Tashkil etilgan yil',
      ru: 'Год основания',
      en: 'Founded in',
    },
  },
]

export const getFallbackStats = (locale: Locale): readonly StatItem[] =>
  STATS_SEED.map((s) => ({
    id: s.id,
    value: s.value,
    label: s.label[locale],
    suffix: s.suffix,
  }))

/* ────────────────────────── Партнёры ────────────────────────── */

interface PartnerSeed {
  readonly id: string
  readonly name: L10n
  readonly url: string
  readonly logo: string
}

export const PARTNERS_SEED: readonly PartnerSeed[] = [
  {
    id: 'mininnovation',
    name: {
      qq: 'Joqarı bilimlendiriw, ilim hám innovaciyalar ministrligi',
      uz: 'Oliy taʼlim, fan va innovatsiyalar vazirligi',
      ru: 'Министерство высшего образования, науки и инноваций',
      en: 'Ministry of Higher Education, Science and Innovation',
    },
    url: 'https://edu.uz',
    logo: '/media/partners/edu.svg',
  },
  {
    id: 'minculture',
    name: {
      qq: 'Mádeniyat ministrligi',
      uz: 'Madaniyat vazirligi',
      ru: 'Министерство культуры',
      en: 'Ministry of Culture',
    },
    url: 'https://madaniyat.uz',
    logo: '/media/partners/culture.svg',
  },
  {
    id: 'hemis',
    name: {
      qq: 'HEMIS — bilimlendiriwdi basqarıw sisteması',
      uz: 'HEMIS — taʼlimni boshqarish tizimi',
      ru: 'HEMIS — система управления образованием',
      en: 'HEMIS — education management system',
    },
    url: 'https://hemis.uz',
    logo: '/media/partners/hemis.svg',
  },
  {
    id: 'mygov',
    name: {
      qq: 'Birden-bir interaktiv xızmetler portalı',
      uz: 'Yagona interaktiv xizmatlar portali',
      ru: 'Единый портал интерактивных услуг',
      en: 'Unified portal of interactive services',
    },
    url: 'https://my.gov.uz',
    logo: '/media/partners/mygov.svg',
  },
  {
    id: 'dtm',
    name: {
      qq: 'Mámleketlik test orayı',
      uz: 'Davlat test markazi',
      ru: 'Государственный центр тестирования',
      en: 'State Testing Centre',
    },
    url: 'https://dtm.uz',
    logo: '/media/partners/dtm.svg',
  },
  {
    id: 'library',
    name: {
      qq: 'Ózbekstan Milliy kitapxanası',
      uz: 'Oʻzbekiston Milliy kutubxonasi',
      ru: 'Национальная библиотека Узбекистана',
      en: 'National Library of Uzbekistan',
    },
    url: 'https://natlib.uz',
    logo: '/media/partners/natlib.svg',
  },
]

export const getFallbackPartners = (locale: Locale): readonly PartnerItem[] =>
  PARTNERS_SEED.map((p) => ({
    id: p.id,
    name: p.name[locale],
    url: p.url,
    logo: {
      url: p.logo,
      // Логотип — не декорация: название организации нужно озвучить
      alt: p.name[locale],
      width: 240,
      height: 96,
    },
  }))

/* ────────────────────────── Контакты ────────────────────────── */

const MAP_IMAGE = image(
  '/media/map-nukus.png',
  {
    qq: 'Nókis qalasınıń kartası, instituttıń jaylasıw ornı belgilengen',
    uz: 'Nukus shahri xaritasi, institut joylashuvi belgilangan',
    ru: 'Карта города Нукуса с отмеченным расположением института',
    en: 'Map of Nukus with the institute location marked',
  },
  1024,
  576,
  BLUR_SAND,
)

export const CONTACTS_SEED = {
  address: {
    qq: '230100, Nókis qalası, Doslıq gúzarı, 1-jay',
    uz: '230100, Nukus shahri, Doʻstlik shoh koʻchasi, 1-uy',
    ru: '230100, город Нукус, проспект Дослык, дом 1',
    en: '1 Doslyk Avenue, Nukus 230100, Republic of Karakalpakstan',
  } satisfies L10n,
  transport: {
    qq: 'Avtobus 1, 8, 12-marshrutları hám 3-marshrutlı taksi «Mádeniyat institutı» ayaqlaması',
    uz: '1, 8, 12-avtobuslar va 3-marshrutli taksi «Madaniyat instituti» bekati',
    ru: 'Автобусы № 1, 8, 12 и маршрутное такси № 3 до остановки «Институт культуры»',
    en: 'Buses 1, 8, 12 and minibus 3 to the “Institute of Culture” stop',
  } satisfies L10n,
  workingHours: {
    qq: 'Dúysembi — juma, 9:00–18:00',
    uz: 'Dushanba — juma, 9:00–18:00',
    ru: 'Понедельник — пятница, 9:00–18:00',
    en: 'Monday to Friday, 9:00–18:00',
  } satisfies L10n,
  phones: ['+998 61 222 33 44', '+998 61 222 33 45'],
  emails: ['info@nukus-uzdsmi.uz', 'qabul@nukus-uzdsmi.uz'],
  mapImage: MAP_IMAGE,
  mapYandexUrl: 'https://yandex.uz/maps/?text=Nukus%20institute%20of%20arts%20and%20culture',
  mapGoogleUrl: 'https://www.google.com/maps/search/?api=1&query=Nukus+institute+of+arts+and+culture',
  socials: [
    { label: 'Telegram', href: 'https://t.me/' },
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Facebook', href: 'https://facebook.com/' },
    { label: 'YouTube', href: 'https://youtube.com/' },
  ],
}

export const getFallbackContacts = (locale: Locale): ContactBlock => ({
  address: CONTACTS_SEED.address[locale],
  phones: CONTACTS_SEED.phones,
  emails: CONTACTS_SEED.emails,
  workingHours: CONTACTS_SEED.workingHours[locale],
  transport: CONTACTS_SEED.transport[locale],
  mapImage: resolveImage(CONTACTS_SEED.mapImage, locale),
  mapYandexUrl: CONTACTS_SEED.mapYandexUrl,
  mapGoogleUrl: CONTACTS_SEED.mapGoogleUrl,
  socials: CONTACTS_SEED.socials,
})
