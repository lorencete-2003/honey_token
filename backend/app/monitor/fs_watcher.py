import json
import os
import time
import requests
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent


class HoneytokenFsHandler(FileSystemEventHandler):
    """Handler que reporta lecturas/escrituras de archivos canario a la API."""

    def __init__(self, mapping: dict[str, str], api_url: str = "http://localhost:8000"):
        """
        mapping: path -> token_id
        """
        self.mapping = {os.path.abspath(k): v for k, v in mapping.items()}
        self.api_url = api_url.rstrip("/")
        self._recent = {}  # simple dedup

    def on_any_event(self, event: FileSystemEvent):
        if event.is_directory:
            return
        path = os.path.abspath(event.src_path)
        token_id = self._match(path)
        if not token_id:
            return
        now = time.time()
        last = self._recent.get(path, 0)
        if now - last < 2:
            return
        self._recent[path] = now
        self._report(token_id, path, event.event_type)

    def _match(self, path: str) -> str | None:
        if path in self.mapping:
            return self.mapping[path]
        return None

    def _report(self, token_id: str, path: str, event_type: str):
        payload = {
            "token_id": token_id,
            "event_type": "fs_open",
            "source_ip": "127.0.0.1",
            "process_info": {"pid": os.getpid(), "cwd": os.getcwd()},
            "details": {"path": path, "event": event_type},
        }
        try:
            requests.post(f"{self.api_url}/events/", json=payload, timeout=5)
            print(f"[Monitor] Reported {event_type} on {path} for token {token_id}")
        except Exception as e:
            print(f"[Monitor] Failed to report event: {e}")


class FsWatcher:
    """Monitor de filesystem cross-platform basado en watchdog."""

    def __init__(self, mapping: dict[str, str] | None = None, api_url: str = "http://localhost:8000"):
        self.mapping = mapping or {}
        self.api_url = api_url
        self.observer = Observer()
        self.handler = HoneytokenFsHandler(self.mapping, api_url=api_url)

    def add_watch(self, token_id: str, path: str):
        abs_path = os.path.abspath(path)
        self.mapping[abs_path] = token_id
        self.handler.mapping[abs_path] = token_id
        watch_dir = os.path.dirname(abs_path)
        self.observer.schedule(self.handler, watch_dir, recursive=False)
        print(f"[FsWatcher] Watching {abs_path} -> {token_id}")

    def load_mapping(self, path: str):
        p = Path(path)
        if not p.exists():
            return
        with p.open("r", encoding="utf-8") as f:
            data = json.load(f)
        for token_id, file_path in data.items():
            self.add_watch(token_id, file_path)

    def start(self):
        self.observer.start()
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            self.stop()

    def stop(self):
        self.observer.stop()
        self.observer.join()


if __name__ == "__main__":
    import sys

    mapping_path = sys.argv[1] if len(sys.argv) > 1 else None
    watcher = FsWatcher()
    if mapping_path:
        watcher.load_mapping(mapping_path)
    else:
        print("Usage: python -m app.monitor.fs_watcher <mapping.json>")
        print("mapping.json format: {\"token_id\": \"/absolute/path/to/file\"}")
        raise SystemExit(1)
    watcher.start()
