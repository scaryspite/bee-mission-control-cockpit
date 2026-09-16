"""Checks the background color of the sprite sheet."""
from PIL import Image

ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
img = Image.open(f"{ASSETS_DIR}/crew_animation_sheet.png")
print("Top-left pixel:", img.getpixel((0,0)))
print("Bottom-right pixel:", img.getpixel((1599,1199)))
