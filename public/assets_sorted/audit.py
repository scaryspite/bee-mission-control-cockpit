import os

base = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets_sorted/Character_Frames"
chars = {
    "Alloy": "alloy",
    "Doublestuffiana": "doublestuffiana", # Wait, files actually have 'doublestuffiana' and 'oreo'
    "Nebula": "nebs",  # files have 'nebs' or 'nebula'
    "Oreo": "oreo",
    "Rivet": "rivet"
}

states = [
    "idle-a", "idle-b", 
    "walk-l-a", "walk-l-b", 
    "walk-r-a", "walk-r-b", 
    "cheer-a", "cheer-b", 
    "thinking-a", "thinking-b",
    "work-a", "work-b"
]

def check():
    for char, prefix in chars.items():
        print(f"\n--- {char} ---")
        char_dir = os.path.join(base, char)
        files = os.listdir(char_dir) if os.path.exists(char_dir) else []
        
        # also print what files actally exist
        print("Exists:")
        for f in [x for x in sorted(files) if '.png' in x or '.jpg' in x]:
            print(f"  {f}")
check()
