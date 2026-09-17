import sys
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

path = "/Users/beedurrah/Documents/Shadow Mission Control Scripting and Materials/assets/high_res_template_pngs/05_background_only_portrait_2550x3300.png"
c = canvas.Canvas("test.pdf", pagesize=letter)
try:
    c.drawImage(path, 0, 0)
    print("Success")
except Exception as e:
    print(f"Failed: {e}")
