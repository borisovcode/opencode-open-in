import { createSignal, For, Show } from "solid-js"
import { Dynamic } from "solid-js/web"
import { Schema } from "effect"
import { Command, Plugin, SettingsPage, Slot, Store } from "@opencode/plugin/gui"
import type { MountedSession, OS, SessionScreen } from "@opencode/plugin/gui"
import { OpenInApp } from "@opencode/plugin/gui/file"
import { appsFor, fileManagerKey, type AppEntry } from "./apps"
import { en, ru } from "./i18n"

/**
 * Puts the "Open in" control back in the session header and adds the same actions to the
 * project menu and the command palette.
 */
export default Plugin.define({
  stores: {
    prefs: Store.global(
      Schema.Struct({
        header: Schema.optional(Schema.Boolean),
        menu: Schema.optional(Schema.Boolean),
      }),
      {},
    ),
  },
  i18n: { en, ru },
  setup(ctx) {
    const os = (): OS => ctx.desktop?.os ?? "linux"
    const apps = appsFor(os())
    const prefs = ctx.stores.prefs

    const showHeader = () => prefs.value.header ?? true
    const showMenu = () => prefs.value.menu ?? true

    // The desktop tells us which editors it can launch. Until that answers, offer every known app.
    const [installed, setInstalled] = createSignal<ReadonlySet<string>>(new Set())
    const desktop = ctx.desktop
    if (desktop) {
      void Promise.all(
        apps.map(async (app) => [app.id, await desktop.installed(app.app).catch(() => false)] as const),
      )
        .then((entries) => setInstalled(new Set(entries.filter(([, ok]) => ok).map(([id]) => id))))
        .catch(() => {})
    }

    const installedApps = () => apps.filter((app) => installed().has(app.id))
    const availableApps = () => (installedApps().length ? installedApps() : apps)
    const manager = () => ctx.t(fileManagerKey(os()))

    const failed = (cause: unknown) =>
      ctx.toast.show({
        variant: "error",
        title: ctx.t("toast.failed"),
        description: cause instanceof Error ? cause.message : String(cause),
      })

    const launch = (app: AppEntry, path: string) => {
      if (!desktop) return
      desktop.launch(path, app.app).catch(failed)
    }

    const reveal = (path: string) => {
      if (!desktop) return
      desktop
        .reveal(path)
        .then((ok) => {
          if (!ok) ctx.toast.show({ variant: "error", title: ctx.t("toast.revealFailed"), description: path })
        })
        .catch(failed)
    }

    const copy = (path: string) => {
      ctx.system
        .copy(path)
        .then(() => ctx.toast.show({ variant: "success", title: ctx.t("toast.copied"), description: path }))
        .catch(failed)
    }

    // A single installed editor opens without a dialog; several ask which one.
    const pick = async (path: string) => {
      const options = availableApps()
      if (options.length === 0) return
      if (options.length === 1) return launch(options[0]!, path)

      const id = await ctx.dialogs.select({
        title: ctx.t("choose.title"),
        options: options.map((app) => ({ title: app.label, value: app.id })),
      })
      const app = options.find((item) => item.id === id)
      if (app) launch(app, path)
    }

    const session = () => ctx.sessions.current()

    // The built-in split button, rendered in the session header instead of inside the review panel.
    const openIn = ctx.use(OpenInApp)
    function HeaderOpenIn(props: { session: MountedSession; screen: SessionScreen }) {
      const Button = () => {
        const live = openIn()
        return live.status === "active" ? live.value.Button : undefined
      }

      return (
        <Show when={showHeader()}>
          <Dynamic component={Button()} session={props.session} screen={props.screen} />
        </Show>
      )
    }

    function ProjectMenu(props: { session: MountedSession }) {
      return (
        <Show when={showMenu()}>
          <ctx.ui.MenuSeparator />
          <ctx.ui.MenuSub label={ctx.t("menu.openIn")} icon="outline-share">
            <For each={availableApps()}>
              {(app) => (
                <ctx.ui.MenuItem
                  label={app.label}
                  icon="code"
                  onSelect={() => launch(app, props.session.directory)}
                />
              )}
            </For>
            <ctx.ui.MenuSeparator />
            <ctx.ui.MenuItem
              label={ctx.t("menu.reveal", { manager: manager() })}
              icon="folder"
              onSelect={() => reveal(props.session.directory)}
            />
          </ctx.ui.MenuSub>
          <ctx.ui.MenuItem
            label={ctx.t("command.copyPath")}
            icon="outline-copy"
            keys={ctx.keybinds.keybind(`${ctx.id}.copy-path`)}
            onSelect={() => copy(props.session.directory)}
          />
        </Show>
      )
    }

    function Settings() {
      return (
        <ctx.ui.SettingsSection title={ctx.t("settings.section")}>
          <ctx.ui.SettingsRow
            id="open-in-header"
            title={ctx.t("settings.header")}
            description={ctx.t("settings.header.description")}
          >
            <ctx.ui.Switch
              label={ctx.t("settings.header")}
              hideLabel
              checked={showHeader()}
              onChange={(checked) =>
                prefs.update((draft) => {
                  draft.header = checked
                })
              }
            />
          </ctx.ui.SettingsRow>
          <ctx.ui.SettingsRow
            id="open-in-menu"
            title={ctx.t("settings.menu")}
            description={ctx.t("settings.menu.description")}
          >
            <ctx.ui.Switch
              label={ctx.t("settings.menu")}
              hideLabel
              checked={showMenu()}
              onChange={(checked) =>
                prefs.update((draft) => {
                  draft.menu = checked
                })
              }
            />
          </ctx.ui.SettingsRow>
        </ctx.ui.SettingsSection>
      )
    }

    ctx.add(Command, (): Command => {
      const current = session()
      return {
        id: "open",
        title: ctx.t("command.open"),
        description: ctx.t("command.open.description"),
        group: ctx.t("title"),
        section: "navigation",
        bind: "mod+shift+e",
        enabled: !!current && !!desktop,
        run: () => {
          const target = session()
          if (target) void pick(target.directory)
        },
      }
    })

    ctx.add(Command, (): Command => {
      const current = session()
      return {
        id: "reveal",
        title: ctx.t("command.reveal", { manager: manager() }),
        description: ctx.t("command.reveal.description"),
        group: ctx.t("title"),
        section: "navigation",
        enabled: !!current && !!desktop,
        run: () => {
          const target = session()
          if (target) reveal(target.directory)
        },
      }
    })

    ctx.add(Command, (): Command => {
      const current = session()
      return {
        id: "copy-path",
        title: ctx.t("command.copyPath"),
        description: ctx.t("command.copyPath.description"),
        group: ctx.t("title"),
        section: "navigation",
        enabled: !!current,
        run: () => {
          const target = session()
          if (target) copy(target.directory)
        },
      }
    })

    ctx.add(Slot, {
      at: "session.header",
      order: 10,
      render: (input) => <HeaderOpenIn session={input.session} screen={input.screen} />,
    })

    ctx.add(Slot, {
      at: "session.location.menu",
      render: (input) => <ProjectMenu session={input.session} />,
    })

    ctx.add(SettingsPage, {
      id: "open-in",
      page: "general",
      get title() {
        return ctx.t("settings.section")
      },
      get entries() {
        return [
          {
            id: "open-in-header",
            title: ctx.t("settings.header"),
            description: ctx.t("settings.header.description"),
            keywords: "open in header vscode editor",
          },
          {
            id: "open-in-menu",
            title: ctx.t("settings.menu"),
            description: ctx.t("settings.menu.description"),
            keywords: "open in project menu",
          },
        ]
      },
      render: () => <Settings />,
    })
  },
})
