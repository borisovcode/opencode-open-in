# opencode-open-in

> OpenCode Desktop GUI plugin that puts the native **Open in** button back into the session header, and adds editor, file manager and copy-path actions to the project menu and the command palette.

[Features](#features) · [Requirements](#requirements) · [Install](#install) · [Usage](#usage) · [Settings](#settings) · [Development](#development) · [Roadmap](#roadmap) · [License](#license)

## Why

In OpenCode Desktop V2 the "Open in" split button lives inside the right side panel (the Review tab strip), so it is only visible while that panel is open. This plugin reuses the app's own `file.openInApp` contract and renders the same button in `session.header`, so it is one click away again.

The button and its dropdown are the app's built-in control, so it looks and behaves exactly like the native one. Only the placement changes.

## Features

- **Session header** — the native Open in split button, next to the review toggle.
- **Project menu** — an **Open in** submenu with the installed editors, **Reveal in Finder / File Explorer / File Manager**, and **Copy path**.
- **Command palette** (`Ctrl+K` / `Cmd+K`):
  - `Open project in…` — picks the editor (`Ctrl+Shift+E` / `Cmd+Shift+E` by default);
  - `Reveal project in <file manager>`;
  - `Copy project path`.
- **Settings → General** — switches for the header button and the project menu rows.
- **Automatic editor detection** — VS Code, VSCodium, Cursor, Windsurf, Zed, Sublime Text, and JetBrains IDEs (PhpStorm, WebStorm, IntelliJ IDEA, PyCharm, GoLand).
- **English and Russian** copy.

## Requirements

- OpenCode Desktop **2.2.x**. The GUI plugin API is experimental and may change between releases.
- A **local** server. The button renders nothing for remote servers or in the web UI, because the app cannot launch programs there.

## Install

```sh
opencode plugin add opencode-open-in
```

Then open **Settings → Extensions → Plugins** and make sure the plugin is enabled. If the button does not appear immediately, reload the window (`Ctrl+R` / `Cmd+R`) or restart OpenCode Desktop.

### From configuration

```jsonc title="~/.config/opencode/opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-open-in"]
}
```

### From a local build

```jsonc title="~/.config/opencode/opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["/home/me/Projects/opencode-open-in"]
}
```

A local directory must contain the prebuilt `dist/gui-experimental.cjs`; run a build first (see [Development](#development)).

## Usage

| Where | What |
| --- | --- |
| Session header | The native split button: opens the project in the last chosen editor. The chevron lists the detected editors, the file manager and Copy path. |
| Project menu | Click the project path/name in the session header. **Open in** lists the editors, **Reveal** opens the file manager, **Copy path** copies the project folder. |
| Command palette | `Ctrl+K` / `Cmd+K`, then `Open project in…`, `Reveal project…` or `Copy project path`. |

With a single installed editor, `Open project in…` opens it immediately; with several, it shows a picker.

## Settings

**Settings → General → Open in**:

| Row | Default | Effect |
| --- | --- | --- |
| Show in session header | on | Renders the Open in split button next to the review toggle. |
| Show in project menu | on | Adds Open in, Reveal and Copy path to the project menu. |

Settings are stored per user in the plugin's `plugin.opencode-open-in.prefs` store.

## Development

```sh
bun install
bun run build        # writes dist/gui-experimental.cjs
bun run watch        # rebuild and hot-reload the plugin in every window
bun run typecheck
bun run check        # typecheck + build
```

The bundle is produced with the official preset:

```ts
import { defineConfig } from "vite"
import { gui } from "@opencode/plugin/gui/vite"

export default defineConfig({ plugins: [gui()] })
```

### Project layout

```text
.
├── src/
│   ├── apps.ts      # editor catalog per platform
│   ├── gui.tsx      # plugin definition, commands, slots, settings
│   └── i18n.ts      # English and Russian copy
├── vite.config.ts
├── tsconfig.json
├── CHANGELOG.md
├── LICENSE
└── README.md
```

### How it works

The plugin contributes two slots and follows the built-in contract:

```tsx
import { Dynamic } from "solid-js/web"
import { Plugin, Slot, usePlugin } from "@opencode/plugin/gui"
import { OpenInApp } from "@opencode/plugin/gui/file"

function HeaderOpenIn(props) {
  const ctx = usePlugin()
  const openIn = ctx.use(OpenInApp)
  const Button = () => {
    const live = openIn()
    return live.status === "active" ? live.value.Button : undefined
  }
  return <Dynamic component={Button()} session={props.session} screen={props.screen} />
}

export default Plugin.define({
  setup(ctx) {
    ctx.add(Slot, { at: "session.header", order: 10, render: (input) => <HeaderOpenIn {...input} /> })
  },
})
```

Commands and the project menu drive the same actions through `ctx.desktop.launch`, `ctx.desktop.reveal` and `ctx.system.copy`.

## Publishing

```sh
npm login
npm publish
```

`prepublishOnly` runs `typecheck` and `build`, so the tarball always ships a fresh bundle.

## Roadmap

- Custom editors with arguments (`--goto {file}:{line}`) for PhpStorm, Neovim, Helix and others.
- Open a terminal in the project or the file's folder.
- Open the active review file at its selected line; reveal or copy `file:line`.
- Git hosting links (GitHub / GitLab) for the current file and line.
- Remote-SSH support for projects on remote servers.

## Compatibility

- The GUI plugin API is experimental. After a major OpenCode Desktop update, rebuild the bundle; if contract or slot names change, the plugin may need a small update.
- The plugin declares no server part. It only adds desktop UI contributions.

## License

[MIT](LICENSE)
