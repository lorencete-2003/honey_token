import secrets
from app.generator.base import HoneytokenGenerator


class PasswordInCodeGenerator(HoneytokenGenerator):
    token_type = "password"

    def generate(self, context=None, extra=None):
        password = "SuperSecret" + secrets.token_hex(4) + "!"
        value = {"password": password, "username": "admin"}
        meta = self._base_meta(password, context, extra)
        return {**meta, "value": value}
