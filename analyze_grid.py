"""Analyzes the grid of a sprite sheet to find the bounds of the sprites."""
from PIL import Image


ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(f"{ASSETS_DIR}/crew_animation_sheet.png")
pixels = img.load()
width, height = img.size

# Find non-transparent pixel bounds to guess the grid
row_has_pixels = []
for y in range(height):
    has_p = False
    for x in range(width):
        if pixels[x, y][3] > 0:  # Alpha > 0
            has_p = True
            break
    row_has_pixels.append(has_p)

col_has_pixels = []
for x in range(width):
    has_p = False
    for y in range(height):
        if pixels[x, y][3] > 0:
            has_p = True
            break
    col_has_pixels.append(has_p)

def find_segments(has_pixels):
    """Finds contiguous segments of pixels in a row or column."""

    segments = []
    start = -1
    for i, p in enumerate(has_pixels):
        if p and start == -1:
            start = i
        elif not p and start != -1:
            segments.append((start, i))
            start = -1
    if start != -1:
        segments.append((start, len(has_pixels)))
    return segments

print("Row segments:", find_segments(row_has_pixels))
print("Col segments:", find_segments(col_has_pixels))
