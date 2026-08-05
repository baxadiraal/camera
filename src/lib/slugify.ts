/**
 * Транслитерация в латиницу для slug'ов.
 * Требование: адреса страниц только латиницей и без процент-кодировки,
 * поэтому кириллица и каракалпакская/узбекская диакритика раскладываются
 * в ASCII ещё в админке, до сохранения документа.
 */

const MAP: Record<string, string> = {
  // Кириллица (ru/uz/kaa)
  а: 'a', б: 'b', в: 'v', г: 'g', ғ: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j',
  з: 'z', и: 'i', й: 'y', к: 'k', қ: 'q', л: 'l', м: 'm', н: 'n', ң: 'n',
  о: 'o', ө: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ў: 'u', ұ: 'u',
  ү: 'u', ф: 'f', х: 'h', ҳ: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya',
  // Каракалпакская и узбекская латиница с диакритикой
  á: 'a', ǎ: 'a', ä: 'a', ǵ: 'g', ğ: 'g', ı: 'i', í: 'i', ń: 'n', ñ: 'n',
  ó: 'o', ö: 'o', ú: 'u', ü: 'u', ş: 'sh', ç: 'ch', ʻ: '', ʼ: '', '‘': '',
  '’': '', '`': '',
}

/**
 * Приводит произвольную строку к безопасному slug'у: латиница, цифры, дефис.
 * @example toSlug('Илмий кеңес') // 'ilmiy-kenes'
 */
export function toSlug(input: string): string {
  const lowered = input.toLowerCase().trim()

  let out = ''
  for (const char of lowered) {
    const mapped = MAP[char]
    if (mapped !== undefined) {
      out += mapped
      continue
    }
    if (/[a-z0-9]/.test(char)) {
      out += char
      continue
    }
    // Диакритика, не описанная в карте, снимается через NFD
    const stripped = char.normalize('NFD').replace(/[̀-ͯ]/g, '')
    out += /^[a-z0-9]+$/.test(stripped) ? stripped : '-'
  }

  return out
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 96)
}
