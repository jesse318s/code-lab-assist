# Shared Playwright fixtures for all lab website tests
import threading
import http.server
import functools
from pathlib import Path
import pytest

@pytest.fixture(scope="session")
def serve():
    workspace_root = Path(__file__).parent.parent
    cache = {}
    servers = []

    def _start(directory):
        target = Path(directory)

        if not target.is_absolute(): target = workspace_root / target

        key = str(target.resolve())

        if key in cache: return cache[key]

        handler = functools.partial(
            http.server.SimpleHTTPRequestHandler,
            directory=str(target),
        )
        httpd = http.server.HTTPServer(("127.0.0.1", 0), handler)
        port = httpd.server_address[1]
        thread = threading.Thread(target=httpd.serve_forever, daemon=True)

        thread.start()

        url = f"http://127.0.0.1:{port}"
        cache[key] = url

        servers.append(httpd)
        return url

    # Here, `yield` represents each parameterization of the server start function for the session.
    # The value passed to `yield` is injected into the test as the fixture argument.
    # Code after `yield` runs once all tests using this fixture have finished.
    yield _start

    for httpd in servers:
        httpd.shutdown()
