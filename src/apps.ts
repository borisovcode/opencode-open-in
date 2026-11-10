import type { OS } from "@opencode/plugin/gui"

/** One editor the plugin can open a project in. */
export interface AppEntry {
  readonly id: string
  /** The name shown in menus and commands. */
  readonly label: string
  /** What the desktop app launches: an app bundle name on macOS, a command elsewhere. */
  readonly app: string
}

const MACOS: readonly AppEntry[] = [
  { id: "vscode", label: "Visual Studio Code", app: "Visual Studio Code" },
  { id: "cursor", label: "Cursor", app: "Cursor" },
  { id: "zed", label: "Zed", app: "Zed" },
  { id: "windsurf", label: "Windsurf", app: "Windsurf" },
  { id: "sublime", label: "Sublime Text", app: "Sublime Text" },
  { id: "phpstorm", label: "PhpStorm", app: "PhpStorm" },
  { id: "webstorm", label: "WebStorm", app: "WebStorm" },
  { id: "idea", label: "IntelliJ IDEA", app: "IntelliJ IDEA" },
  { id: "pycharm", label: "PyCharm", app: "PyCharm" },
  { id: "goland", label: "GoLand", app: "GoLand" },
  { id: "xcode", label: "Xcode", app: "Xcode" },
  { id: "android-studio", label: "Android Studio", app: "Android Studio" },
]

const LINUX: readonly AppEntry[] = [
  { id: "vscode", label: "Visual Studio Code", app: "code" },
  { id: "vscodium", label: "VSCodium", app: "codium" },
  { id: "cursor", label: "Cursor", app: "cursor" },
  { id: "windsurf", label: "Windsurf", app: "windsurf" },
  { id: "zed", label: "Zed", app: "zed" },
  { id: "phpstorm", label: "PhpStorm", app: "phpstorm" },
  { id: "webstorm", label: "WebStorm", app: "webstorm" },
  { id: "idea", label: "IntelliJ IDEA", app: "idea" },
  { id: "pycharm", label: "PyCharm", app: "pycharm" },
  { id: "goland", label: "GoLand", app: "goland" },
  { id: "sublime", label: "Sublime Text", app: "subl" },
]

const WINDOWS: readonly AppEntry[] = [
  { id: "vscode", label: "Visual Studio Code", app: "code" },
  { id: "cursor", label: "Cursor", app: "cursor" },
  { id: "windsurf", label: "Windsurf", app: "windsurf" },
  { id: "zed", label: "Zed", app: "zed" },
  { id: "sublime", label: "Sublime Text", app: "subl" },
  { id: "phpstorm", label: "PhpStorm", app: "phpstorm" },
  { id: "webstorm", label: "WebStorm", app: "webstorm" },
  { id: "idea", label: "IntelliJ IDEA", app: "idea" },
]

/** The editors the plugin offers on a platform, in menu order. */
export function appsFor(os: OS): readonly AppEntry[] {
  if (os === "macos") return MACOS
  if (os === "windows") return WINDOWS
  return LINUX
}

/** The i18n key of the platform's file manager. */
export function fileManagerKey(os: OS): "label.finder" | "label.fileExplorer" | "label.fileManager" {
  if (os === "macos") return "label.finder"
  if (os === "windows") return "label.fileExplorer"
  return "label.fileManager"
}
