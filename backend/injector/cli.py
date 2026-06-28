import json
import os
import re
import sys
from pathlib import Path
from typing import Optional

import click
import libcst as cst
import requests

API_URL = os.environ.get("HONEY_API_URL", "http://localhost:8000")
WATCHER_MAP = os.environ.get("HONEY_WATCHER_MAP", "./honey_watcher_map.json")


PY_VARIABLES = {
    "aws": ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"),
    "github": ("GITHUB_TOKEN",),
    "jwt": ("JWT_TOKEN",),
    "database_url": ("DATABASE_URL",),
    "cookie": ("SESSION_COOKIE",),
    "slack": ("SLACK_BOT_TOKEN",),
    "discord": ("DISCORD_BOT_TOKEN",),
    "password": ("DEFAULT_PASSWORD",),
}


def create_token(token_type: str, context: str, name: Optional[str], location: str):
    url = f"{API_URL}/tokens/"
    payload = {
        "token_type": token_type,
        "name": name or f"{token_type}-{context}",
        "context": context,
        "location": location,
        "extra": {},
    }
    r = requests.post(url, json=payload, timeout=10)
    r.raise_for_status()
    return r.json()


def render_value(token_type: str, value: dict) -> str:
    if token_type == "aws":
        return f'{value["access_key_id"]}\n{value["secret_access_key"]}'
    if token_type == "github":
        return value["pat"]
    if token_type == "jwt":
        return value["token"]
    if token_type == "database_url":
        return value["url"]
    if token_type == "cookie":
        return value["cookie"]
    if token_type == "slack":
        return value["token"]
    if token_type == "discord":
        return value["token"]
    if token_type == "password":
        return value["password"]
    return json.dumps(value)


def inject_python(target: Path, token_type: str, value: dict, context: str, line: Optional[int]):
    variables = PY_VARIABLES[token_type]
    values = render_value(token_type, value).split("\n")
    assignments = [
        f'{var} = {repr(val)}  # Inyectado por Honeytoken-Engine [{context}]'
        for var, val in zip(variables, values)
    ]
    new_lines = [f"# Honeytoken context: {context}"] + assignments + ["# End honeytoken"]
    new_block = "\n".join(new_lines) + "\n"

    source = target.read_text(encoding="utf-8")
    lines = source.splitlines(keepends=True)

    if line is not None and 0 <= line <= len(lines):
        lines.insert(line - 1, new_block)
    else:
        lines.append("\n\n" + new_block)

    target.write_text("".join(lines), encoding="utf-8")


def inject_env(target: Path, token_type: str, value: dict, context: str):
    variables = PY_VARIABLES[token_type]
    values = render_value(token_type, value).split("\n")
    lines = [f"# Honeytoken context: {context}"]
    for var, val in zip(variables, values):
        lines.append(f"{var}={val}")
    lines.append("# End honeytoken\n")
    block = "\n".join(lines) + "\n"
    with target.open("a", encoding="utf-8") as f:
        f.write(block)


def write_canary_file(target: Path, token: dict, context: str):
    content = token["value"]["content"]
    target.write_text(content, encoding="utf-8")
    # register for watcher
    register_watcher(token["id"], str(target.resolve()))


def register_watcher(token_id: str, path: str):
    p = Path(WATCHER_MAP)
    data = {}
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
    data[token_id] = str(Path(path).resolve())
    p.write_text(json.dumps(data, indent=2), encoding="utf-8")


@click.command()
@click.option("--type", "token_type", required=True, help="Tipo de honeytoken")
@click.option("--target", required=True, type=click.Path(), help="Archivo a modificar")
@click.option("--context", default="default", help="Contexto (staging, prod, etc.)")
@click.option("--line", type=int, default=None, help="Línea donde insertar (Python)")
@click.option("--name", default=None, help="Nombre descriptivo del token")
def main(token_type: str, target: str, context: str, line: Optional[int], name: Optional[str]):
    target_path = Path(target)
    if not target_path.exists():
        target_path.parent.mkdir(parents=True, exist_ok=True)

    if token_type == "canary_file":
        token = create_token(token_type, context, name, str(target_path.resolve()))
        write_canary_file(target_path, token, context)
        click.echo(f"[+] Canary file creado: {target_path}")
        click.echo(f"    Token ID: {token['id']}")
        click.echo(f"    Fingerprint: {token['fingerprint']}")
        return

    token = create_token(token_type, context, name, str(target_path.resolve()))

    if target_path.suffix == ".py":
        inject_python(target_path, token_type, token["value"], context, line)
    elif target_path.name.endswith(".env") or target_path.suffix == ".env":
        inject_env(target_path, token_type, token["value"], context)
    else:
        click.echo("[-] Formato no soportado. Usa .py o .env")
        sys.exit(1)

    click.echo(f"[+] Token inyectado en {target_path}")
    click.echo(f"    Token ID: {token['id']}")
    click.echo(f"    Fingerprint: {token['fingerprint']}")


if __name__ == "__main__":
    main()
