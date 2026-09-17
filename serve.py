from http.server import SimpleHTTPRequestHandler, HTTPServer
import sys

class NoCacheHTTPRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = 8080
    server_address = ('', port)
    httpd = HTTPServer(server_address, NoCacheHTTPRequestHandler)
    print(f"Serving on port {port} with Cache-Control: no-cache...")
    httpd.serve_forever()
