import base64
import json
import secrets
from app.generator.base import HoneytokenGenerator


class SessionCookieGenerator(HoneytokenGenerator):
    token_type = "cookie"

    def generate(self, context=None, extra=None):
        payload = {"user_id": secrets.token_hex(8), "role": "admin", "session": "honey"}
        cookie = "session=" + base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        value = {"cookie": cookie, "decoded": payload}
        meta = self._base_meta(cookie, context, extra)
        return {**meta, "value": value}
