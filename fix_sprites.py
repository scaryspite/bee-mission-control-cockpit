"""Overwrites specific character animation states with their base idle frames."""
import os

import shutil

ASSET_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets"
members = ["alloy", "nebs", "rivet", "doublestuff", "oreo"]

states_to_overwrite = [
    "cheer", "coffee", "dangle", "game", "sit",
    "sleep", "thinking", "wave", "work", "idle"
]

for member in members:
    idle_a = os.path.join(ASSET_DIR, f"pet-frame-{member}-idle-a.png")
    idle_b = os.path.join(ASSET_DIR, f"pet-frame-{member}-idle-b.png")

    if not os.path.exists(idle_a):
        print(f"Missing {idle_a}")
        continue

    # We will iterate through all files in the directory for this member
    for filename in os.listdir(ASSET_DIR):
        if filename.startswith(f"pet-frame-{member}-") and filename.endswith(".png"):
            # skip the properly clipped idles and walks
            if "-idle-a" in filename or "-idle-b" in filename or "-walk-" in filename:
                continue

            filepath = os.path.join(ASSET_DIR, filename)

            # If the file is larger than 100KB, it's unclipped. Overwrite it!
            size = os.path.getsize(filepath)
            if size > 150000:  # 150KB
                # determine if it ends with -b.png, if so use idle-b, otherwise idle-a
                if filename.endswith("-b.png") and os.path.exists(idle_b):
                    shutil.copy2(idle_b, filepath)
                    print(f"Overwrote {filename} with idle-b")
                else:
                    shutil.copy2(idle_a, filepath)
                    print(f"Overwrote {filename} with idle-a")

print("Done fixing sprites.")
