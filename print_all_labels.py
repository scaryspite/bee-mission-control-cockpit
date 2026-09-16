"""Prints the labels from the sprite sheet."""
from PIL import Image


ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(f"{ASSETS_DIR}/crew_animation_sheet.png")
pixels = img.load()

rows = [(42, 51), (322, 331), (602, 611), (882, 891)]

for r in rows:
    line = ""
    for x in range(40, 260):
        # average color
        avg = sum(pixels[x,r[0]][:3]) / 3
        if avg > 100:
            line += "#"
        else:
            line += " "
    print(line)
