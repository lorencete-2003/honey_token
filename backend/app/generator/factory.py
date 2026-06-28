from app.generator.base import HoneytokenGenerator
from app.generator.aws import AWSHoneytokenGenerator
from app.generator.github import GitHubPATGenerator
from app.generator.jwt import JWTHoneytokenGenerator
from app.generator.canary_file import CanaryFileGenerator
from app.generator.database_url import DatabaseURLGenerator
from app.generator.cookie import SessionCookieGenerator
from app.generator.chat_token import SlackTokenGenerator, DiscordTokenGenerator
from app.generator.password import PasswordInCodeGenerator


REGISTRY: dict[str, type[HoneytokenGenerator]] = {
    "aws": AWSHoneytokenGenerator,
    "github": GitHubPATGenerator,
    "jwt": JWTHoneytokenGenerator,
    "canary_file": CanaryFileGenerator,
    "database_url": DatabaseURLGenerator,
    "cookie": SessionCookieGenerator,
    "slack": SlackTokenGenerator,
    "discord": DiscordTokenGenerator,
    "password": PasswordInCodeGenerator,
}


def list_types() -> list[str]:
    return list(REGISTRY.keys())


def generate_token(token_type: str, context: str | None = None, extra: dict | None = None) -> dict:
    if token_type not in REGISTRY:
        raise ValueError(f"Unknown token type: {token_type}. Available: {list_types()}")
    return REGISTRY[token_type]().generate(context=context, extra=extra)
