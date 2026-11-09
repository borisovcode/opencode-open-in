import { Dynamic } from "solid-js/web"
import { Plugin, Slot, usePlugin } from "@opencode/plugin/gui"
import type { MountedSession, SessionScreen } from "@opencode/plugin/gui"
import { OpenInApp } from "@opencode/plugin/gui/file"

/**
 * The desktop "Open in" split button (VS Code, Cursor, Zed, file manager, Copy path),
 * rendered in the session header right before the review toggle instead of inside
 * the side panel's tab strip.
 */
function HeaderOpenIn(props: { session: MountedSession; screen: SessionScreen }) {
  const ctx = usePlugin()
  const openIn = ctx.use(OpenInApp)

  // The built-in file plugin provides the button; stay empty while it is pending or inactive.
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
