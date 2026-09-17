from PIL import Image
path = "/Users/beedurrah/Documents/Shadow Mission Control Scripting and Materials/assets/high_res_template_pngs/05_background_only_portrait_2550x3300.png"
try:
    img = Image.open(path)
    img.load()
    print("PIL load success")
except Exception as e:
    print(f"PIL fail: {e}")
