import os
import json
from PIL import Image

def analyze_directory(directory_path):
    assets_data = []

    for filename in os.listdir(directory_path):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue

        filepath = os.path.join(directory_path, filename)
        
        try:
            with Image.open(filepath) as img:
                w, h = img.size
                aspect_ratio = round(w / h, 3) if h != 0 else 0
                
                # Convert to RGBA to properly find bounding box of non-transparent areas
                img_rgba = img.convert("RGBA")
                bbox = img_rgba.getbbox()
                
                if bbox is None:
                    bbox = (0, 0, 0, 0)
                    
                bbox_w = bbox[2] - bbox[0]
                bbox_h = bbox[3] - bbox[1]
                bbox_area = bbox_w * bbox_h
                img_area = w * h
                
                fill_ratio = round(bbox_area / img_area, 3) if img_area > 0 else 0

                # Classification rules (ignoring filenames completely)
                classification = "Unclassified"
                
                # High fill ratio and large image typical of full backgrounds or room renders
                if w >= 800 and fill_ratio > 0.95:
                    classification = "Background / Scene"
                # Spritesheets are usually wide, high resolution, with distinct fill ratios or aspect ratios
                elif w > 1500 and aspect_ratio > 2.0:
                    classification = "Spritesheet"
                # Props / UI elements - smaller bounding boxes relative to a larger canvas
                elif fill_ratio < 0.35 and img_area > 200000:
                    classification = "Prop / Scene Element"
                # Character frames - moderate sizes, often squared off or slightly taller than wide
                elif 500 <= w <= 1500 and 0.35 <= fill_ratio <= 0.95:
                    classification = "Character Frame / Large Sprite"
                # Small icons or miniature sprites
                elif w < 500:
                    classification = "Mini-Sprite / Icon"
                else:
                    classification = "Miscellaneous Model / Asset"

                assets_data.append({
                    "original_path": filepath,
                    "filename": filename,
                    "w": w,
                    "h": h,
                    "aspect_ratio": aspect_ratio,
                    "bbox": bbox,
                    "bbox_w": bbox_w,
                    "bbox_h": bbox_h,
                    "fill_ratio": fill_ratio,
                    "classification": classification
                })
        except Exception as e:
            pass # ignore non-images or corrupted files

    # Grouping
    mapping = {}
    for item in assets_data:
        cls = item["classification"]
        if cls not in mapping:
            mapping[cls] = []
        mapping[cls].append(item)

    print(json.dumps(mapping, indent=2))

if __name__ == "__main__":
    analyze_directory('/Users/beedurrah/Developer/bee-mission-control-cockpit/public/assets')
