import json
import os
import sys

os.environ.setdefault("HOME", "/tmp")
os.environ["HOME"] = "/tmp"  # sdk caches gid under ~/.cache; only /tmp is writable

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from http.server import BaseHTTPRequestHandler
from api.security import authorised, download_public


def _submit(video_url: str, operation: str = "remove", progress=None):
    progress = progress if progress is not None else {}
    if operation not in ("enhance", "remove"):
        raise ValueError("Unsupported VMake operation")
    """Upload → consume quota → submit videoscreenclear async job. Returns dict."""
    from sdk.core.client import SkillClient
    from sdk.core import api as vapi
    from sdk.auth.signer import Signer, HeaderHost
    from sdk.core.config import INVOKE, USER_AGENT
    import requests

    ak = os.environ["MT_AK"]
    sk = os.environ["MT_SK"]
    client = SkillClient(ak=ak, sk=sk)

    from api.vmake_transfer import upload_video
    oss_url = upload_video(client.api, video_url)
    if oss_url is None:
        raise RuntimeError("OSS upload failed")

    task_name = "hdvideoallinone" if operation == "enhance" else "videoscreenclear"
    if task_name not in INVOKE:
        raise RuntimeError("VMake does not expose the requested preset")
    progress["quota_started"] = True
    consume = client._consume_permission(oss_url, task_name)
    context = consume.get("context", "") if consume else ""

    spec = INVOKE[task_name]
    params = spec.get("params") or {}
    policy = client.api.getAiStrategy()
    host = policy["url"].split("://", 1)[-1]
    headers = {HeaderHost: host, "User-Agent": USER_AGENT}
    data = {
        "params": json.dumps(params),
        "context": context,
        "task": spec["task"],
        "task_type": spec.get("task_type") or "mtlab",
        "sync_timeout": 1,  # force async: we poll from a separate endpoint
        "init_images": [{"url": oss_url}],
    }
    signer = Signer(ak, sk)
    uri = policy["url"] + "/" + policy["push_path"]
    req = signer.sign(uri, "POST", headers, json.dumps(data))
    progress["submission_started"] = True
    resp = requests.Session().send(req, timeout=60)
    body = json.loads(resp.content)
    status = body.get("data", {}).get("status")
    if status == 9:
        return {"task_id": str(body["data"]["result"]["id"]).strip()}
    out = vapi._with_output_urls(body)
    if out.get("output_urls"):
        return {"done": True, "output_urls": out["output_urls"]}
    return {"error": "VMake did not return a task ID or output. Check provider task history before retrying."}


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if not authorised(self.headers):
            self.send_response(401)
            self.end_headers()
            return
        progress = {}
        try:
            n = int(self.headers.get("Content-Length") or 0)
            if n < 0 or n > 16384:
                raise ValueError("Request too large")
            payload = json.loads(self.rfile.read(n) or b"{}")
            url = (payload.get("url") or "").strip()
            if not url.startswith("http"):
                raise ValueError("url required")
            result = _submit(url, payload.get("operation", "remove"), progress)
            code = 200 if "error" not in result else 500
        except Exception as e:  # noqa: BLE001
            result = {"error": str(e)[:500], "safe_to_retry": not progress.get("quota_started", False)}
            code = 500
        body = json.dumps(result).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)
