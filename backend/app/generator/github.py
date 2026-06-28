import secrets
from app.generator.base import HoneytokenGenerator


class GitHubPATGenerator(HoneytokenGenerator):
    token_type = "github"

    def generate(self, context=None, extra=None):
        pat = "ghp_" + secrets.token_urlsafe(36)
        value = {"pat": pat, "scope": "repo,read:user"}
        meta = self._base_meta(pat, context, extra)
        return {**meta, "value": value}
