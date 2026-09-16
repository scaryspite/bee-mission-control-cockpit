"""Prints a single label from the sprite sheet."""
from PIL import Image


ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(f"{ASSETS_DIR}/crew_animation_sheet.png")
pixels = img.load()

# Let's print the first label (42-51, x from 40 to 200)
for y in range(42, 52):
    line = ""
    for x in range(40, 260):
        # average color
        avg = sum(pixels[x,y][:3]) / 3
        if avg > 100:
            line += "#"
        else:
            line += " "
    print(line)
