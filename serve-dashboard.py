#!/usr/bin/env python3
"""
Simple HTTP server for the TanziTech Autoresponder Dashboard
"""
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080
DASHBOARD_FILE = "dashboard.html"

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = f'/{DASHBOARD_FILE}'
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

def main():
    # Change to the directory containing the dashboard
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Check if dashboard file exists
    if not os.path.exists(DASHBOARD_FILE):
        print(f"❌ Error: {DASHBOARD_FILE} not found in {script_dir}")
        sys.exit(1)
    
    # Try to find an available port
    for port in range(PORT, PORT + 10):
        try:
            with socketserver.TCPServer(("", port), DashboardHandler) as httpd:
                print(f"🚀 TanziTech Autoresponder Dashboard")
                print(f"📂 Serving from: {script_dir}")
                print(f"🌐 Dashboard URL: http://localhost:{port}")
                print(f"📊 Dashboard file: {DASHBOARD_FILE}")
                print(f"⚡ Server running on port {port}")
                print(f"🔥 Press Ctrl+C to stop the server\n")
                
                # Try to open the browser automatically
                try:
                    webbrowser.open(f'http://localhost:{port}')
                    print("🌐 Opening dashboard in your default browser...")
                except:
                    print("💡 Please manually open http://localhost:{port} in your browser")
                
                # Start the server
                httpd.serve_forever()
                
        except OSError as e:
            if e.errno == 48:  # Address already in use
                print(f"⚠️  Port {port} is busy, trying {port + 1}...")
                continue
            else:
                print(f"❌ Error starting server: {e}")
                sys.exit(1)
    
    print(f"❌ Could not find an available port in range {PORT}-{PORT + 10}")
    sys.exit(1)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
        sys.exit(0)
