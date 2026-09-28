import json
import os
import sys
from urllib.parse import urlparse, parse_qs, quote

os.environ["HOME"] = "/tmp"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from http.server import BaseHTTPRequestHandler
from api.security import authorised, download_public


def _status(task_id: str):
    """One status check, no sleeping. Returns done/processing/failed dict."""
    from sdk.core.client import SkillClient
    from sdk.core import api as vapi

    client = SkillClient(ak=os.environ["MT_AK"], sk=os.environ["MT_SK"])
    policy = client.api.getAiStrategy()
    uri = policy["url"] + "/" + policy["status_query"]["path"] + "?task_id=" + quote(task_id, safe="")
    result = client.api.queryStatus(uri, policy)
    raw = result.get("result") or {}
    data = raw.get("data") or {} if isinstance(raw, dict) else {}
    payload = data.get("result") or {} if isinstance(data, dict) else {}
    nested = payload.get("data") or {} if isinstance(payload, dict) else {}
    # Status 2 can contain a terminal provider error rather than a video.
    for part in (raw, payload, nested):
        if isinstance(part, dict) and part.get("error_code") not in (None, 0, "0", ""):
            message = part.get("error_msg") or part.get("message") or part.get("msg") or "VMake task failed"
            return {"failed": True, "resubmit_required": True, "message": str(message)[:500]}
    if result.get("is_finished"):
        if result.get("is_failure"):
            raw = result.get("result")
            msg = ""
            if isinstance(raw, dict):
                msg = (raw.get("meta") or {}).get("msg", "") or json.dumps(raw)[:300]
            return {"failed": True, "message": str(msg)[:500]}
        out = vapi._with_output_urls(result["result"], task_id=task_id)
        urls = out.get("output_urls") or []
        if urls:
            return {"done": True, "output_urls": urls}
        # A terminal provider flag alone does not confirm a usable video.
        # Re-poll this task; the caller bounds waiting and never resubmits it.
        raw = result.get("result") or {}
        data = raw.get("data") or {} if isinstance(raw, dict) else {}
        payload = data.get("result") if isinstance(data, dict) else None
        return {"done": False, "awaiting_output": True,
                "provider_status": data.get("status") if isinstance(data, dict) else None,
                "result_keys": list(payload.keys()) if isinstance(payload, dict) else [],
                "message": "VMake has not returned a downloadable video yet"}
    return {"done": False}


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if not authorised(self.headers):
            self.send_response(401)
            self.end_headers()
            return
        try:
            q = parse_qs(urlparse(self.path).query)
            task_id = (q.get("task_id") or [""])[0].strip()
            if not task_id:
                raise ValueError("task_id required")
            if task_id == "capabilities":
                from sdk.core.client import SkillClient
                from sdk.core.config import INVOKE
                client = SkillClient(ak=os.environ["MT_AK"], sk=os.environ["MT_SK"])
                result = {"presets": {k: {"task": v.get("task"), "params": v.get("params")} for k, v in INVOKE.items() if any(t in k.lower() for t in ["clear", "eras", "remov", "smart", "hdvideo", "enhanc", "upscale"])}}
            else:
                result = _status(task_id)
            code = 200
        except Exception as e:  # noqa: BLE001
            result = {"error": str(e)[:500]}
            code = 500
        body = json.dumps(result).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(body)
