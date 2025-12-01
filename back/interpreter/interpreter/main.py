#!/usr/bin/env python3
"""
Minimal HTTP server for the summarization service.
Uses only Python standard library http.server module.
"""

import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from dotenv import load_dotenv

# Load environment variables before importing config
load_dotenv()

from . import config
from .handlers import handle_summarize
from .summarizer import get_summarizer


class RequestHandler(BaseHTTPRequestHandler):
    """HTTP request handler for the summarization service."""

    def _send_json_response(self, status: int, data: dict) -> None:
        """Send a JSON response."""
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def _read_json_body(self) -> dict | None:
        """Read and parse JSON request body."""
        content_length = self.headers.get("Content-Length")
        if not content_length:
            return None

        try:
            body = self.rfile.read(int(content_length))
            return json.loads(body.decode("utf-8"))
        except (json.JSONDecodeError, ValueError):
            return None

    def do_GET(self) -> None:
        """Handle GET requests."""
        if self.path == "/health":
            self._send_json_response(200, {"status": "ok"})
        else:
            self._send_json_response(404, {"error": "Not found"})

    def do_POST(self) -> None:
        """Handle POST requests."""
        if self.path == "/api/summarize":
            body = self._read_json_body()

            if not body or "buildingId" not in body:
                self._send_json_response(400, {"error": "buildingId is required"})
                return

            building_id = body["buildingId"]
            print(f"Summarizing building: {building_id}")

            result = handle_summarize(building_id)
            status = result.pop("status", 200)
            self._send_json_response(status, result)
        else:
            self._send_json_response(404, {"error": "Not found"})

    def log_message(self, format: str, *args) -> None:
        """Custom log format."""
        print(f"[{self.log_date_time_string()}] {args[0]}")


def main() -> None:
    """Start the HTTP server."""
    # Load the model at startup
    print("Initializing summarizer...")
    summarizer = get_summarizer()
    summarizer.load()

    # Start the server
    server_address = ("0.0.0.0", config.PORT)
    httpd = HTTPServer(server_address, RequestHandler)
    print(f"Server running on port {config.PORT}")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()


if __name__ == "__main__":
    main()
