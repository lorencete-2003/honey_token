import secrets
from app.generator.base import HoneytokenGenerator


class DatabaseURLGenerator(HoneytokenGenerator):
    token_type = "database_url"

    def generate(self, context=None, extra=None):
        token_marker = secrets.token_hex(6)
        host = f"honey-{token_marker}.example.com"
        value = {
            "url": f"postgres://honey:{secrets.token_urlsafe(16)}@{host}:5432/prod",
            "host": host,
            "token_marker": token_marker,
        }
        meta = self._base_meta(value["url"], context, extra)
        return {**meta, "value": value}
