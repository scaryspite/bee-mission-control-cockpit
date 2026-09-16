"""Prints the labels from the sprite sheet, with a different method."""
from PIL import Image


ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(f"{ASSETS_DIR}/crew_animation_sheet.png")
pixels = img.load()

rows = [(42, 51), (322, 331), (602, 611), (882, 891)]

for r in rows:
    print(f"Row {r}:")
    for y in range(r[0], r[1]+1):
        line = ""
        for x in range(40, 260):
            avg = sum(pixels[x,y][:3]) / 3
            if avg > 100:
                line += "#"
            else:
                line += " "
        print(line)
    print("\n")
