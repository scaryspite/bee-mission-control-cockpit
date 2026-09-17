
import sys
from material_generator import MaterialGenerator

if __name__ == "__main__":
    if len(sys.argv) != 5:
        print("Usage: python create_material.py <client> <program> <template> <output_file>")
        sys.exit(1)

    client_name = sys.argv[1]
    program_name = sys.argv[2]
    template_name = sys.argv[3]
    output_filename = sys.argv[4]

    background_directory = "/Users/beedurrah/Documents/Shadow Mission Control Scripting and Materials/assets/high_res_template_pngs"
    font_path = "/Users/beedurrah/Downloads/Atkinson Hyperlegible Mono/For Professional Use Only/Web Fonts/TFF/AtkinsonHyperlegibleMono-Regular.ttf"

    generator = MaterialGenerator(background_directory, font_path)
    generator.create_material(client_name, program_name, template_name, output_filename)

    print(f"Material created successfully: {output_filename}")
