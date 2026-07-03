"""Throwaway static server for visual preview only. Serves templates/index.html
at / and the project's /static assets from disk. Not part of the app."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(os.environ.get("PORT", "0"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        if self.path in ("/", "/index.html"):
            self.path = "/templates/index.html"
        return super().do_GET()


if __name__ == "__main__":
    httpd = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"preview server on http://127.0.0.1:{httpd.server_address[1]}/", flush=True)
    httpd.serve_forever()
