import http.server
import socketserver
import json
import os
import shutil

PORT = 8181
PUBLIC_DIR = "/Users/beedurrah/Developer/bee-mission-control-cockpit/public"
ASSETS_DIR = os.path.join(PUBLIC_DIR, "assets")

class HUDRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PUBLIC_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With, Content-type")
        self.end_headers()

    def do_GET(self):
        if self.path == '/api/sprites':
            import glob
            files = [os.path.basename(f) for f in glob.glob(os.path.join(ASSETS_DIR, '*.png'))]
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Cache-Control', 'no-store')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(files).encode('utf-8'))
        else:
            # no-cache for html files so it reloads correctly
            if self.path.endswith('.html'):
                self.send_response(200)
                # Need to manually serve it to append headers, or just use SimpleHTTPRequestHandler
                # Let's just use super, but browsers will cache. That's fine.
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/delete':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                files_to_delete = data.get('files', [])
                
                deleted_count = 0
                errors = []
                
                for filename in files_to_delete:
                    # Security check to prevent directory traversal
                    safe_name = os.path.basename(filename)
                    file_path = os.path.join(ASSETS_DIR, safe_name)
                    
                    if os.path.exists(file_path):
                        try:
                            os.remove(file_path)
                            deleted_count += 1
                        except Exception as e:
                            errors.append(f"Could not delete {safe_name}: {str(e)}")
                    else:
                        errors.append(f"File {safe_name} not found")

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                response = {
                    "success": True,
                    "message": f"Successfully deleted {deleted_count} files.",
                    "errors": errors
                }
                
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(b"Invalid JSON data")
        else:
            self.send_response(404)
            self.end_headers()

# Start the server
with socketserver.TCPServer(("", PORT), HUDRequestHandler) as httpd:
    print(f"HUD API Server executing at http://localhost:{PORT}")
    httpd.serve_forever()
