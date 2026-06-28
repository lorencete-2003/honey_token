import json
import os
import requests
from typing import Any


class Notifier:
    def __init__(self):
        self.discord_webhook = os.environ.get("DISCORD_WEBHOOK")
        self.slack_webhook = os.environ.get("SLACK_WEBHOOK")
        self.generic_webhook = os.environ.get("GENERIC_WEBHOOK")

    def enabled_channels(self) -> list[str]:
        channels = []
        if self.discord_webhook:
            channels.append("discord")
        if self.slack_webhook:
            channels.append("slack")
        if self.generic_webhook:
            channels.append("generic")
        return channels

    def send(self, message: str, payload: dict[str, Any]) -> list[str]:
        sent: list[str] = []
        if self.discord_webhook:
            try:
                self._send_discord(message, payload)
                sent.append("discord")
            except Exception as e:
                print(f"Discord alert failed: {e}")
        if self.slack_webhook:
            try:
                self._send_slack(message, payload)
                sent.append("slack")
            except Exception as e:
                print(f"Slack alert failed: {e}")
        if self.generic_webhook:
            try:
                self._send_generic(message, payload)
                sent.append("generic")
            except Exception as e:
                print(f"Generic webhook failed: {e}")
        return sent

    def _send_discord(self, message: str, payload: dict[str, Any]):
        embed = {
            "title": "🚨 Honeytoken Triggered",
            "description": message,
            "color": 15158332,
            "fields": [
                {"name": k.replace("_", " ").title(), "value": str(v)[:1024], "inline": False}
                for k, v in payload.items()
            ],
        }
        requests.post(self.discord_webhook, json={"embeds": [embed]}, timeout=10)

    def _send_slack(self, message: str, payload: dict[str, Any]):
        text = message + "\n" + json.dumps(payload, indent=2, default=str)
        requests.post(self.slack_webhook, json={"text": text}, timeout=10)

    def _send_generic(self, message: str, payload: dict[str, Any]):
        requests.post(
            self.generic_webhook,
            json={"message": message, **payload},
            timeout=10,
        )
