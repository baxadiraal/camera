"""
Готовит шрифты для динамических og:image.

Satori (движок next/og) не умеет woff2 и вариативные шрифты, поэтому из
подмножеств Inter вырезается статическое начертание 600 и сохраняется в TTF.
Файлы кладутся в public/fonts/og — оттуда их читает маршрут /api/og,
и они попадают в standalone-сборку Docker вместе с остальной статикой.

Запуск (нужны пакеты fonttools и brotli):
    python3 scripts/prepare-og-fonts.py
"""

import os

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SOURCES = {
    "inter-og-latin.ttf": "public/fonts/inter-latin-wght-normal.woff2",
    "inter-og-latinext.ttf": "public/fonts/inter-latin-ext-wght-normal.woff2",
    "inter-og-cyrillic.ttf": "public/fonts/inter-cyrillic-wght-normal.woff2",
}

OUTPUT_DIR = "public/fonts/og"


def main() -> None:
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for name, source in SOURCES.items():
        font = TTFont(source)
        instancer.instantiateVariableFont(font, {"wght": 600}, inplace=True)
        font.flavor = None
        path = os.path.join(OUTPUT_DIR, name)
        font.save(path)
        print(f"{name}: {os.path.getsize(path)} байт")


if __name__ == "__main__":
    main()
