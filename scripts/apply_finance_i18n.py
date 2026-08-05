# -*- coding: utf-8 -*-
"""Apply Phase 14.1 finance i18n patches into messages/*.json."""
from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
PATCHES = ROOT / "scripts" / "finance_i18n"
LOCALES = ["en", "ru", "de", "fr", "es", "it", "pt", "pl", "cs", "uk"]


def deep_merge(base: dict, patch: dict) -> dict:
    out = deepcopy(base)
    for key, value in patch.items():
        if isinstance(value, dict) and isinstance(out.get(key), dict):
            out[key] = deep_merge(out[key], value)
        else:
            out[key] = value
    return out


def load_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, data: dict) -> None:
    path.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    en_additions = load_json(PATCHES / "en_additions.json")
    common_ux = load_json(PATCHES / "common_ux.json")
    creator_finance = load_json(PATCHES / "creator_finance.json")

    for loc in LOCALES:
        path = MESSAGES / f"{loc}.json"
        data = load_json(path)

        if loc == "en":
            data["admin"]["finance"] = deep_merge(
                data["admin"]["finance"], en_additions
            )
        else:
            patch_path = PATCHES / f"admin_finance_{loc}.json"
            if patch_path.exists():
                # Ensure new EN keys exist first, then overlay locale strings.
                data["admin"]["finance"] = deep_merge(
                    data["admin"]["finance"], en_additions
                )
                data["admin"]["finance"] = deep_merge(
                    data["admin"]["finance"], load_json(patch_path)
                )
            if loc in common_ux:
                data.setdefault("common", {})["ux"] = deep_merge(
                    data.get("common", {}).get("ux", {}), common_ux[loc]
                )
            if loc in creator_finance:
                data.setdefault("creator", {})["finance"] = deep_merge(
                    data.get("creator", {}).get("finance", {}),
                    creator_finance[loc],
                )

        write_json(path, data)
        print("ok", loc)


if __name__ == "__main__":
    main()
