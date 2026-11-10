# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.1] - 2026-11-09

### Added

- Command palette entries:
  - `Open project in…` — pick the editor (`Ctrl+Shift+E` by default);
  - `Reveal project in <file manager>`;
  - `Copy project path`.
- Project menu rows: an **Open in** submenu with the installed editors, **Reveal in Finder / File Explorer / File Manager**, and **Copy path**.
- Settings → General section with switches for the session header button and the project menu rows.
- English and Russian copy for the new commands, menu rows, settings and toasts.
- Editor detection for VS Code, VSCodium, Cursor, Windsurf, Zed, Sublime Text and JetBrains IDEs (PhpStorm, WebStorm, IntelliJ IDEA, PyCharm, GoLand).
- `CHANGELOG.md`, `.editorconfig` and `.gitattributes`.

### Changed

- Renamed the package from `opencode-open-in-header` to `opencode-open-in`.
- Repository moved to `https://github.com/borisovcode/opencode-open-in`.

## [0.1.0] - 2026-11-08

### Added

- The native **Open in** split button in the session header, next to the review toggle.
- Support for opening the project folder in the detected editors and the system file manager, and for copying its path.
- Packaging as a standalone OpenCode Desktop GUI plugin.
