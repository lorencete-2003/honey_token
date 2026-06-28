import secrets
from app.generator.base import HoneytokenGenerator


class CanaryFileGenerator(HoneytokenGenerator):
    token_type = "canary_file"

    def generate(self, context=None, extra=None):
        filename = extra.get("filename", ".env.honey") if extra else ".env.honey"
        webhook_url = extra.get("webhook_url", "https://honey.example.com/canary-webhook")
        admin_email = extra.get("admin_email", "admin-canary@example.com")
        password = "HoneyP@ssw0rd!" + secrets.token_hex(4)
        db_url = f"postgres://honey:{secrets.token_urlsafe(12)}@honey-db.example.com:5432/prod"
        value = {
            "filename": filename,
            "content": (
                f"# Internal staging config - DO NOT SHARE\n"
                f"DATABASE_URL={db_url}\n"
                f"ADMIN_PASSWORD={password}\n"
                f"WEBHOOK_URL={webhook_url}\n"
                f"SECURITY_EMAIL={admin_email}\n"
            ),
        }
        meta = self._base_meta(value["content"], context, extra)
        return {**meta, "value": value}
