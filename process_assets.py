"""Processes game assets, converting images to a specific format."""
import os

from PIL import Image

def make_transparent(img):
    """Converts the background of an image to transparent."""
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    datas = img.getdata()
    new_data = []
    # Assume top-left pixel is background color
    bg_color = datas[0]
    for item in datas:
        # fuzzy match background
        if abs(item[0]-bg_color[0]) < 15 and abs(item[1]-bg_color[1]) < 15 and abs(item[2]-bg_color[2]) < 15:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    img.putdata(new_data)
    return img

def get_bounding_boxes(img):
    """Gets the bounding boxes of sprites in a sprite sheet."""
    # simplistic grid slice for now if it's a spritesheet
    w, h = img.size
    boxes = []
    if w == 1024 and h == 1024:
        # assume 2x2 grid
        boxes = [(0,0,512,512), (512,0,1024,512), (0,512,512,1024), (512,512,1024,1024)]
    else:
        # assume 1x1
        boxes = [(0,0,w,h)]
    return boxes

def create_sprite_canvas(sprite):
    """Creates a canvas and composites the sprite onto it."""
    canvas_w = 1024
    canvas_h = 1536
    canvas = Image.new('RGBA', (canvas_w, canvas_h), (0,0,0,0))
    sw, sh = sprite.size
    # composite at bottom center
    # to prevent stretching, just place it as is
    x = (canvas_w - sw) // 2
    y = canvas_h - sh - 20 # 20px padding from bottom
    canvas.paste(sprite, (x, y), sprite)
    return canvas

def process_crew(crew_name, src_file, dest_dir):
    """Processes a crew member's sprite sheet, generating individual frames."""
    if not os.path.exists(src_file): return
    img = Image.open(src_file)
    img = make_transparent(img)
    boxes = get_bounding_boxes(img)
    sprites = [img.crop(box) for box in boxes]

    # Required frame bases
    bases = [
        'idle-a', 'idle-b',
        'walk-l-a', 'walk-l-b', 'walk-l-c', 'walk-l-d',
        'walk-r-a', 'walk-r-b', 'walk-r-c', 'walk-r-d',
        'coffee-a', 'coffee-b', 'thinking-a', 'thinking-b',
        'cheer-a', 'cheer-b', 'dangle-a', 'dangle-b',
        'wave-a', 'wave-b', 'sit-a', 'sit-b',
        'game-a', 'game-b', 'sleep-a', 'sleep-b',
        'work-a', 'work-b'
    ]

    for i, base in enumerate(bases):
        sprite = sprites[i % len(sprites)]
        # flip if right walking
        if '-r-' in base:
            sprite = sprite.transpose(Image.FLIP_LEFT_RIGHT) # pylint: disable=no-member
        canvas = create_sprite_canvas(sprite)
        out_path = os.path.join(dest_dir, f'pet-frame-{crew_name}-{base}.png')
        canvas.save(out_path)
        print(f"Saved {out_path}")

def fix_beeps(src_dir):
    """Fixes the walk frames for the Beeps character."""

    # The prompt says standard beeps walk frames are 0 bytes
    # Use beeps-walk-left-a-v2.png, beeps-walk-left-b-v2.png
    # If they don't exist for c and d, just reuse a and b
    walk_l_a = os.path.join(src_dir, 'beeps-walk-left-a-v2.png')
    walk_l_b = os.path.join(src_dir, 'beeps-walk-left-b-v2.png')

    if os.path.exists(walk_l_a) and os.path.exists(walk_l_b):
        img_a = Image.open(walk_l_a)
        img_b = Image.open(walk_l_b)

        # Ensure they are 1024x1536
        if img_a.size != (1024, 1536):
            img_a = create_sprite_canvas(img_a)
        if img_b.size != (1024, 1536):
            img_b = create_sprite_canvas(img_b)

        img_c = img_a # fallback
        img_d = img_b # fallback

        img_a.save(os.path.join(src_dir, 'pet-frame-walk-l-a.png'))
        img_b.save(os.path.join(src_dir, 'pet-frame-walk-l-b.png'))
        img_c.save(os.path.join(src_dir, 'pet-frame-walk-l-c.png'))
        img_d.save(os.path.join(src_dir, 'pet-frame-walk-l-d.png'))

        # Right walk
        img_a.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(src_dir, 'pet-frame-walk-r-a.png')) # pylint: disable=no-member
        img_b.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(src_dir, 'pet-frame-walk-r-b.png')) # pylint: disable=no-member
        img_c.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(src_dir, 'pet-frame-walk-r-c.png')) # pylint: disable=no-member
        img_d.transpose(Image.FLIP_LEFT_RIGHT).save(os.path.join(src_dir, 'pet-frame-walk-r-d.png')) # pylint: disable=no-member
        print("Restored Beeps walk frames.")

if __name__ == "__main__":
    assets_dir = "/Users/beedurrah/Library/Application Support/BeeMissionControl/Runtime/bee-brain-navigator/public/cockpit/assets"

    # Process crew members
    process_crew("alloy", os.path.join(assets_dir, "alloy-scrapper-spritesheet.jpg"), assets_dir)
    process_crew("nebula", os.path.join(assets_dir, "officer-nebula-spritesheet.jpg"), assets_dir)
    process_crew("doublestuffiana", os.path.join(assets_dir, "doublestuffiana-full-actor.jpg"), assets_dir)

    # Process Beeps
    fix_beeps(assets_dir)
