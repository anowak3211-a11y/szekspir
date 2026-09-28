"""Authentication and bounded, DNS-pinned public downloads for standalone functions."""
import base64
import hmac
import http.client
import ipaddress
import os
import socket
import ssl
import tempfile
import time
from urllib.parse import urlsplit, urljoin


def authorised(headers):
    expected = os.environ.get("APP_PASSWORD")
    if not expected:
        return os.environ.get("NODE_ENV") == "development"
    try:
        scheme, encoded = headers.get("Authorization", "").split(" ", 1)
        if scheme != "Basic":
            return False
        decoded = base64.b64decode(encoded, validate=True).decode()
        if ":" not in decoded:
            return False
        return hmac.compare_digest(decoded.split(":", 1)[1], expected)
    except (ValueError, UnicodeError):
        return False


def public_address(host):
    infos = socket.getaddrinfo(host, None, type=socket.SOCK_STREAM)
    addresses = [row[4][0] for row in infos]
    if not addresses or any(not ipaddress.ip_address(a).is_global for a in addresses):
        raise ValueError("Only public internet URLs are allowed")
    return addresses[0]


def download_public(url, max_bytes=200 * 1024 * 1024):
    deadline = time.monotonic() + 180
    for _ in range(5):
        u = urlsplit(url)
        if u.scheme not in ("https", "http") or not u.hostname or u.username or u.password or u.port not in (None, 80, 443):
            raise ValueError("Unsupported media URL")
        address = public_address(u.hostname)
        port = u.port or (443 if u.scheme == "https" else 80)
        conn = http.client.HTTPConnection(u.hostname, port, timeout=30)
        sock = socket.create_connection((address, port), timeout=30)
        if u.scheme == "https":
            sock = ssl.create_default_context().wrap_socket(sock, server_hostname=u.hostname)
        conn.sock = sock
        try:
            conn.request("GET", (u.path or "/") + ("?" + u.query if u.query else ""), headers={"User-Agent": "Mozilla/5.0"})
            response = conn.getresponse()
            if response.status in (301, 302, 303, 307, 308):
                location = response.getheader("Location")
                if not location:
                    raise ValueError("Missing redirect URL")
                url = urljoin(url, location)
                continue
            if response.status != 200:
                raise ValueError("Media download failed")
            if int(response.getheader("Content-Length") or 0) > max_bytes:
                raise ValueError("Video exceeds size limit")
            fd, path = tempfile.mkstemp(suffix=".mp4")
            try:
                with os.fdopen(fd, "wb") as out:
                    count = 0
                    while True:
                        if time.monotonic() > deadline:
                            raise TimeoutError("Media download timed out")
                        chunk = response.read(65536)
                        if not chunk:
                            return path
                        count += len(chunk)
                        if count > max_bytes:
                            raise ValueError("Video exceeds size limit")
                        out.write(chunk)
            except Exception:
                os.unlink(path)
                raise
        finally:
            conn.close()
    raise ValueError("Too many redirects")
