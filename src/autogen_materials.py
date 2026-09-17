
import sys
import datetime
from maccal import Calendar
from material_generator import MaterialGenerator

def autogen_materials():
    """
    Automatically generates materials for today's client sessions.
    """
    try:
        from maccal import Calendar
    except ImportError:
        print("maccal library not found. Please install it using:")
        print("pip install maccal")
        sys.exit(1)

    # Initialize the material generator
    background_directory = "/Users/beedurrah/Documents/Shadow Mission Control Scripting and Materials/assets/high_res_template_pngs"
    font_path = "/Users/beedurrah/Downloads/Atkinson Hyperlegible Mono/For Professional Use Only/Web Fonts/TFF/AtkinsonHyperlegibleMono-Regular.ttf"
    generator = MaterialGenerator(background_directory, font_path)

    # Get today's events
    cal = Calendar()
    today = datetime.date.today()
    events = cal.get_events(start_date=today, end_date=today + datetime.timedelta(days=1))

    # Filter for client sessions and generate materials
    for event in events:
        title = event.title
        if "BeGo" in title or "MiLy" in title:
            # Extract client and program from the event title
            parts = title.split(" - ")
            if len(parts) == 2:
                client = parts[0]
                program = parts[1]

                # Generate the material
                template = "05_background_only_portrait_2550x3300.png"
                output_file = f"/Users/beedurrah/Documents/Session Materials/{client}_{program.replace(' ', '_')}.pdf"
                generator.create_material(client, program, template, output_file)
                print(f"Generated material for {client} - {program}")

if __name__ == "__main__":
    autogen_materials()
