#!/usr/bin/env python3
"""
Takirin La Chimenea - Servidor Local con API de Archivo Local JSON
Guarda y consulta directamente en el archivo local 'data/contracts.json'
"""

import http.server
import socketserver
import os
import json

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'contracts.json')
FALLBACK_FILE = os.path.join(BASE_DIR, 'data', 'default-contracts.json')

# Ensure data directory exists
os.makedirs(os.path.join(BASE_DIR, 'data'), exist_ok=True)

# Ensure contracts.json exists
if not os.path.exists(DATA_FILE):
    if os.path.exists(FALLBACK_FILE):
        with open(FALLBACK_FILE, 'r', encoding='utf-8') as f:
            data = f.read()
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            f.write(data)
    else:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump([], f, indent=2, ensure_ascii=False)

class LocalFileRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin and disable caching so file updates reflect immediately
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # API Endpoint to read local file
        if self.path.startswith('/api/contracts') or self.path == '/data/contracts.json':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            
            target = DATA_FILE if os.path.exists(DATA_FILE) else FALLBACK_FILE
            with open(target, 'r', encoding='utf-8') as f:
                self.wfile.write(f.read().encode('utf-8'))
            return

        # Default static file handler
        return super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/contracts'):
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length)
            
            try:
                data = json.loads(body.decode('utf-8'))
                # Save directly into data/contracts.json on disk
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                # Also mirror to default-contracts.json so git has it
                with open(FALLBACK_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                response = json.dumps({'success': True, 'message': 'Guardado en archivo local data/contracts.json'})
                self.wfile.write(response.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

if __name__ == '__main__':
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), LocalFileRequestHandler) as httpd:
        print(f"==================================================")
        print(f"🌮 SERVIDOR TAKIRIN LA CHIMENEA ACTIVO")
        print(f"📂 Archivo de Base de Datos: {DATA_FILE}")
        print(f"🌐 Abre en tu navegador: http://localhost:{PORT}")
        print(f"==================================================")
        httpd.serve_forever()
