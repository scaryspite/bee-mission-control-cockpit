"""Slices a sprite sheet into individual character animation frames."""
import os

from PIL import Image

SHEET_PATH = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets/crew_animation_sheet.png"
OUT_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(SHEET_PATH).convert("RGBA")
pixels = img.load()
width, height = img.size

# Make background color (10, 16, 26, 255) transparent
# Adding a small tolerance
bg = (10, 16, 26, 255)
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        if abs(r - bg[0]) < 15 and abs(g - bg[1]) < 15 and abs(b - bg[2]) < 15:
            pixels[x, y] = (r, g, b, 0)

# Layout:
characters = [
    {"name": "nebs", "y_start": 65, "y_end": 291},
    {"name": "alloy", "y_start": 345, "y_end": 571},
    {"name": "rivet", "y_start": 625, "y_end": 851},
    {"name": "oreo", "y_start": 905, "y_end": 1131}
]

# Columns:
# (40, 261), (285, 506), (530, 751), (775, 996), (1020, 1241), (1265, 1486)
# IDLE 1, IDLE 2, WALK 1, WALK 2, WALK 3, WALK 4
columns = [
    {"label": "idle-a", "x_start": 40, "x_end": 261},
    {"label": "idle-b", "x_start": 285, "x_end": 506},
    {"label": "walk-a", "x_start": 530, "x_end": 751},
    {"label": "walk-b", "x_start": 775, "x_end": 996},
    {"label": "walk-c", "x_start": 1020, "x_end": 1241},
    {"label": "walk-d", "x_start": 1265, "x_end": 1486}
]

def save_frame(f, cn, l, suffix=""):
    """Saves a frame to a file, flipping it if necessary."""
    if "walk" in l:
        path = os.path.join(OUT_DIR, f"pet-frame-{cn}-walk-r-{suffix}.png")
        f.save(path)
        frame_l = f.transpose(Image.FLIP_LEFT_RIGHT)  # pylint: disable=no-member
        path_l = os.path.join(OUT_DIR, f"pet-frame-{cn}-walk-l-{suffix}.png")
        frame_l.save(path_l)
        print(f"Saved {path} and {path_l}")
    else:
        path = os.path.join(OUT_DIR, f"pet-frame-{cn}-{l}.png")
        f.save(path)
        print(f"Saved {path}")

for char in characters:
    cname = char["name"]
    for col in columns:
        label = col["label"]
        box = (col["x_start"], char["y_start"], col["x_end"], char["y_end"])
        frame = img.crop(box)
        if label.startswith("walk"):
            save_frame(frame, cname, label, suffix=label[-1])
        else:
            save_frame(frame, cname, label)
