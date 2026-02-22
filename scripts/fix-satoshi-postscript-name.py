#!/usr/bin/env python3
"""Set PostScript name (name ID 6) to 'Satoshi-Medium' in Satoshi-Medium.woff2."""
import os
import sys

try:
    from fontTools.ttLib import TTFont
    from fontTools.ttLib.tables._n_a_m_e import table__n_a_m_e
except ImportError:
    print("Instala fonttools: pip install fonttools", file=sys.stderr)
    sys.exit(1)

FONT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "public", "lujan", "fonts", "Satoshi-Medium.woff2"
)
FONT_PATH = os.path.normpath(FONT_PATH)
POSTSCRIPT_NAME = "Satoshi-Medium"

def main():
    if not os.path.isfile(FONT_PATH):
        print(f"No se encuentra: {FONT_PATH}", file=sys.stderr)
        sys.exit(1)

    font = TTFont(FONT_PATH)
    name_table = font["name"]

    # nameID 6 = PostScript name
    # Set for Windows (platformID 3, platEncID 1) and Mac (platformID 1, platEncID 0)
    set_count = 0
    for rec in name_table.names:
        if rec.nameID == 6:
            rec.string = POSTSCRIPT_NAME
            set_count += 1

    if set_count == 0:
        # Add name ID 6 if missing (Windows Unicode BMP)
        name_table.setName(POSTSCRIPT_NAME, 6, 3, 1, 0x409)
        set_count = 1

    font.save(FONT_PATH)
    font.close()
    print(f"PostScript name (name ID 6) actualizado a '{POSTSCRIPT_NAME}' en {FONT_PATH}")

if __name__ == "__main__":
    main()
