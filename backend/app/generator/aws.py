import os
import base64
from app.generator.base import HoneytokenGenerator


class AWSHoneytokenGenerator(HoneytokenGenerator):
    token_type = "aws"

    def generate(self, context=None, extra=None):
        access_key = "AKIA" + base64.b32encode(os.urandom(10)).decode().rstrip("=")
        secret_key = base64.b64encode(os.urandom(30)).decode()
        value = {
            "access_key_id": access_key,
            "secret_access_key": secret_key,
            "region": "us-east-1",
        }
        meta = self._base_meta(access_key, context, extra)
        return {**meta, "value": value}
