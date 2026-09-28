"""Bounded public download to OSS multipart upload; never stages a large file on disk."""
import http.client
import socket
import ssl
import time
from urllib.parse import urlsplit, urljoin
from api.security import public_address

LIMIT = 2 * 1024 * 1024 * 1024
PART = 8 * 1024 * 1024


def chunks(url):
    deadline = time.monotonic() + 210
    for _ in range(5):
        u = urlsplit(url)
        if u.scheme not in ('http', 'https') or not u.hostname or u.username or u.password or u.port not in (None, 80, 443):
            raise ValueError('Unsupported media URL')
        address = public_address(u.hostname)
        port = u.port or (443 if u.scheme == 'https' else 80)
        conn = http.client.HTTPConnection(u.hostname, port, timeout=30)
        sock = socket.create_connection((address, port), timeout=30)
        if u.scheme == 'https':
            sock = ssl.create_default_context().wrap_socket(sock, server_hostname=u.hostname)
        conn.sock = sock
        try:
            conn.request('GET', (u.path or '/') + ('?' + u.query if u.query else ''), headers={'User-Agent': 'Mozilla/5.0'})
            r = conn.getresponse()
            if r.status in (301, 302, 303, 307, 308):
                location = r.getheader('Location')
                if not location:
                    raise ValueError('Missing redirect')
                url = urljoin(url, location)
                continue
            if r.status != 200:
                raise ValueError('Media download failed')
            if int(r.getheader('Content-Length') or 0) > LIMIT:
                raise ValueError('Video exceeds 2 GB')
            total = 0
            while True:
                if time.monotonic() > deadline:
                    raise TimeoutError('Video transfer timed out')
                data = r.read(PART)
                if not data:
                    if not total:
                        raise ValueError('Empty video')
                    return
                total += len(data)
                if total > LIMIT:
                    raise ValueError('Video exceeds 2 GB')
                yield data
        finally:
            conn.close()
    raise ValueError('Too many redirects')


def upload_video(api, url):
    import alibabacloud_oss_v2 as oss
    from sdk.storage.oss import resolve_oss_region, normalize_oss_endpoint
    policy = api.getStorageStrategy()
    c = policy['credentials']
    cfg = oss.config.load_default()
    cfg.credentials_provider = oss.credentials.StaticCredentialsProvider(c['access_key'], c['secret_key'], c.get('session_token'))
    cfg.region = resolve_oss_region(policy, api.oss_region)
    cfg.endpoint = normalize_oss_endpoint(policy['url'])
    client = oss.Client(cfg)
    bucket, key = policy['bucket'], policy['key']
    source = chunks(url)
    upload_id = None
    try:
        first = next(source)
        started = client.initiate_multipart_upload(oss.InitiateMultipartUploadRequest(bucket=bucket, key=key))
        upload_id = started.upload_id
        parts = []
        import itertools
        for number, data in enumerate(itertools.chain([first], source), 1):
            part = client.upload_part(oss.UploadPartRequest(bucket=bucket, key=key, upload_id=upload_id, part_number=number, body=data, content_length=len(data)))
            parts.append(oss.UploadPart(part_number=number, etag=part.etag))
        result = client.complete_multipart_upload(oss.CompleteMultipartUploadRequest(bucket=bucket, key=key, upload_id=upload_id, complete_multipart_upload=oss.CompleteMultipartUpload(parts=parts)))
        if result.status_code != 200:
            raise RuntimeError('VMake media upload failed')
        upload_id = None
        return policy['data']
    finally:
        source.close()
        if upload_id:
            try:
                client.abort_multipart_upload(oss.AbortMultipartUploadRequest(bucket=bucket, key=key, upload_id=upload_id))
            except Exception:
                pass
