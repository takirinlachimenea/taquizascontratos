#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORTS = [8080, 8888, 3000, 5000, 8000]

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True

httpd = None
chosen_port = None

for port in PORTS:
    try:
        httpd = socketserver.TCPServer(("", port), Handler)
        chosen_port = port
        break
    except OSError:
        continue

if not httpd:
    print("No available port found.")
    sys.exit(1)

print(f"Server started at http://localhost:{chosen_port}")
try:
    httpd.serve_forever()
except Exception as e:
    print(f"Server error: {e}")
    sys.exit(1)
