# opencode-open-in

> OpenCode Desktop GUI plugin that puts the native **Open in** button back into the session header, right next to the **Toggle review** button.

## Why

In OpenCode Desktop V2 the "Open in" split button lives inside the right side panel (the Review tab strip), so it is only visible while that panel is open. This plugin reuses the app's own `file.openInApp` contract and renders the same button in `session.header`, so it is always one click away again:

- opens the project folder in **VS Code**, **Cursor**, **Zed**, **Sublime Text**, or whatever editors the app detects;
- opens the folder in the system **file manager**;
- copies the project path.

The button and its dropdown are the app's built-in control, so it looks and behaves like the native one. Only the placement changes.

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

A local directory must contain the prebuilt `dist/gui-experimental.cjs`; run a build first (see below).

## How it works

The plugin contributes a slot at `session.header` and follows the built-in `file.openInApp` contract:

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
    ctx.add(Slot, {
      at: "session.header",
      order: 10,
      render: (input) => <HeaderOpenIn session={input.session} screen={input.screen} />,
    })
  },
})
```

Because the button comes from the built-in file plugin, it keeps whatever editor list, icons, and launch behavior the running app has.

## Build from source

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

## Compatibility

- The GUI plugin API is experimental. After a major OpenCode Desktop update, rebuild the bundle; if contract or slot names change, the plugin may need a small update.
- The plugin declares no server part. It only adds a desktop UI contribution.

## License

[MIT](LICENSE)
