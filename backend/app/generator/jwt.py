import base64
import json
import secrets
from app.generator.base import HoneytokenGenerator


class JWTHoneytokenGenerator(HoneytokenGenerator):
    token_type = "jwt"

    def generate(self, context=None, extra=None):
        header = {"alg": "HS256", "typ": "JWT", "kid": f"honey-{secrets.token_hex(8)}"}
        payload = {
            "sub": "honey-user",
            "role": "admin",
            "iat": 1700000000,
            "iss": "honeytoken-engine",
        }
        signature = secrets.token_urlsafe(32)
        token = (
            base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
            + "."
            + base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
            + "."
            + base64.urlsafe_b64encode(signature.encode()).decode().rstrip("=")
        )
        value = {"token": token, "decoded_header": header, "decoded_payload": payload}
        meta = self._base_meta(token, context, extra)
        return {**meta, "value": value}
