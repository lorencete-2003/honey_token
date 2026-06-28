import uuid
import hashlib
from abc import ABC, abstractmethod
from datetime import datetime


class HoneytokenGenerator(ABC):
    token_type: str = "generic"

    @abstractmethod
    def generate(self, context: str | None = None, extra: dict | None = None) -> dict:
        """Return a dict with at least token_id, fingerprint, created_at and the token value(s)."""
        pass

    def _base_meta(self, value_seed: str, context: str | None = None, extra: dict | None = None) -> dict:
        token_id = str(uuid.uuid4())
        fingerprint = hashlib.sha256(f"{token_id}:{value_seed}".encode()).hexdigest()[:16]
        return {
            "token_id": token_id,
            "fingerprint": fingerprint,
            "created_at": datetime.utcnow().isoformat(),
            "context": context or "default",
            "extra": extra or {},
        }
