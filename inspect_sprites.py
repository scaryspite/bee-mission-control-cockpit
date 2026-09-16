"""Identifies sprite assets that are oversized."""
import os


ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
characters = ["nebs", "alloy", "rivet", "oreo"]
states = ["cheer", "coffee", "dangle", "game", "sit", "sleep", "thinking", "wave", "work"]

for char in characters:
    for state in states:
        file_a = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}-a.png")
        file_b = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}-b.png")
        file_single = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}.png")

        for f in [file_a, file_b, file_single]:
            if os.path.exists(f):
                size = os.path.getsize(f)
                if size > 150000:
                    print(f"Oversized file: {os.path.basename(f)} ({size} bytes)")
