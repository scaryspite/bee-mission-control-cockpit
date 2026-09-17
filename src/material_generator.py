
import sys
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import inch

class MaterialGenerator:
    """
    A class for generating PDF materials with background images and text.
    """

    def __init__(self, background_dir, font_path):
        """
        Initializes the MaterialGenerator.

        Args:
            background_dir (str): The path to the directory containing the background images.
            font_path (str): The path to the font file.
        """
        self.background_dir = background_dir
        self.font_path = font_path
        pdfmetrics.registerFont(TTFont('Atkinson', self.font_path))

    def create_material(self, client, program, template, output_file):
        """
        Generates a PDF material.

        Args:
            client (str): The name of the client.
            program (str): The name of the program.
            template (str): The name of the background template file.
            output_file (str): The path to save the output PDF file.
        """
        background_image_path = f"{self.background_dir}/{template}"

        c = canvas.Canvas(output_file, pagesize=letter)
        width, height = letter

        try:
            c.drawImage(background_image_path, 0, 0, width, height)
        except Exception as e:
            print(f"Warning: Could not load background image '{background_image_path}': {e}. Skipping.")

        # Title
        c.setFont("Atkinson", 36)
        c.drawCentredString(width / 2, height - inch, "Session Material")

        # Client and Program
        c.setFont("Atkinson", 24)
        c.drawString(inch, height - 2 * inch, f"Client: {client}")
        c.drawString(inch, height - 2.5 * inch, f"Program: {program}")

        # Notes / Schedule Section
        c.setFont("Atkinson", 20)
        c.drawString(inch, height - 3.5 * inch, "Session Schedule:")
        c.line(inch, height - 3.7 * inch, width - inch, height - 3.7 * inch)
        
        if "3:30" in program or "3-hour" in program.lower():
            if client == "MiLy":
                times = ["3:30 PM - 4:00 PM: Arrival & Checklists (Daily Living/Chores)",
                         "4:00 PM - 4:30 PM: DTT / NET",
                         "4:30 PM - 5:00 PM: Group / Game",
                         "5:00 PM - 5:30 PM: Meditation & Coping Skills",
                         "5:30 PM - 6:00 PM: Homework",
                         "6:00 PM - 6:30 PM: Wrap-up & Departure"]
            else:
                times = ["3:30 PM - 4:00 PM: Arrival & Pairing",
                         "4:00 PM - 4:30 PM: DTT / NET",
                         "4:30 PM - 5:00 PM: Group / Game",
                         "5:00 PM - 5:30 PM: Break / Snack",
                         "5:30 PM - 6:00 PM: Advanced Programs",
                         "6:00 PM - 6:30 PM: Wrap-up & Departure"]
            y_offset = 4.2 * inch
            for t in times:
                c.drawString(inch, height - y_offset, t)
                c.line(inch, height - (y_offset + 0.1*inch), width - inch, height - (y_offset + 0.1*inch))
                y_offset += 0.6 * inch
        else:
            c.drawString(inch, height - 4.2 * inch, "Notes:")
            c.line(inch, height - 4.3 * inch, width - inch, height - 4.3 * inch)

        c.save()
