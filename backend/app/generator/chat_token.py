import secrets
from app.generator.base import HoneytokenGenerator


class SlackTokenGenerator(HoneytokenGenerator):
    token_type = "slack"

    def generate(self, context=None, extra=None):
        token = "xoxb-" + "-".join([secrets.token_hex(8).upper(), secrets.token_hex(12).upper()])
        value = {"token": token, "workspace": "honey-workspace"}
        meta = self._base_meta(token, context, extra)
        return {**meta, "value": value}


class DiscordTokenGenerator(HoneytokenGenerator):
    token_type = "discord"

    def generate(self, context=None, extra=None):
        token = secrets.token_urlsafe(24) + "." + secrets.token_urlsafe(6) + "." + secrets.token_urlsafe(27)
        value = {"token": token, "bot_name": "HoneyBot"}
        meta = self._base_meta(token, context, extra)
        return {**meta, "value": value}
