"""Automated script to fix oversized sprites."""
import os
import shutil

ASSETS_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
CHARACTERS = ["nebs", "alloy", "rivet", "oreo"]
STATES = ["cheer", "coffee", "dangle", "game", "sit", "sleep", "thinking", "wave", "work"]

def fix_sprites():
    """Identifies and fixes oversized sprites."""
    for char in CHARACTERS:
        idle_a = os.path.join(ASSETS_DIR, f"pet-frame-{char}-idle-a.png")
        idle_b = os.path.join(ASSETS_DIR, f"pet-frame-{char}-idle-b.png")

        if not os.path.exists(idle_a) or not os.path.exists(idle_b):
            continue

        for state in STATES:
            file_a = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}-a.png")
            file_b = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}-b.png")
            file_single = os.path.join(ASSETS_DIR, f"pet-frame-{char}-{state}.png")

            for f, src in [(file_a, idle_a), (file_b, idle_b), (file_single, idle_a)]:
                if os.path.exists(f):
                    size = os.path.getsize(f)
                    if size > 150000: # if it's the massive unclipped canvas (>150KB)
                        shutil.copy(src, f)
                        print(f"Fixed {os.path.basename(f)}")

if __name__ == "__main__":
    fix_sprites()
