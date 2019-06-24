/* eslint-disable no-unused-vars */
const { create_theme_settings_window } = require("@app_settings/window.js")
const { create_about_window } = require("@app_about")

const create_tray_menu = (args) => {
    const tray = new args.Tray(args.CONSTANTS.IMAGES.TRAY_NORMAL)
    let child = null
    let about = null

    const contextMenu = args.Menu.buildFromTemplate([
        {
            label: "Show",
            click: () => {
                args.win.hide()
                args.win.show()
            }
        },
        {
            label: "Settings",
            submenu: [
                {
                    label: "Desktop notifications",
                    type: "checkbox",
                    checked: args.store.get("desktopNotifications"),
                    click: () => {
                        const current = args.store.get("desktopNotifications")
                        args.store.set("desktopNotifications", !current)
                    }
                },
                {
                    label: "Save size of window",
                    type: "checkbox",
                    checked: args.store.get("mainWindowSizeSave"),
                    click: () => {
                        const current = args.store.get("mainWindowSizeSave")
                        args.store.set("mainWindowSizeSave", !current)
                    }
                },
                {
                    label: "Minimize instead of exit",
                    type: "checkbox",
                    checked: args.store.get("minimizeOnExitButton"),
                    click: () => {
                        const current = args.store.get("minimizeOnExitButton")
                        args.store.set("minimizeOnExitButton", !current)
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Theme",
                    click: () => {
                        for (const window of args.BrowserWindow.getAllWindows()) {
                            if (window.getTitle() === "Theme Settings") {
                                window.focus()
                                return
                            }
                        }
                        child = create_theme_settings_window(args)
                    }
                }
            ]
        },
        {
            label: "Developer",
            submenu: [
                {
                    label: "Toggle developer tools",
                    click: () => {
                        if (args.win.isDevToolsOpened()) {
                            args.win.closeDevTools()
                        } else { 
                            args.win.openDevTools({
                                mode: "bottom"
                            })
                        }
                    }
                },
                {
                    label: "Reload page",
                    click: () => args.win.reload()
                },
                {
                    type: "separator"
                },
                {
                    label: "Clear cache",
                    click: () => {
                        args.win.webContents.session.clearStorageData()
                        args.win.reload()
                    }
                }
            ]
        },
        {
            label: "About",
            click: () => {
                args.win.show()
                about = create_about_window(args)
            }
        },
        {
            type: "separator"
        },
        {
            label: "Quit",
            click: () => {
                for (const window of args.BrowserWindow.getAllWindows()) {
                    window.destroy()
                }
            }
        }
    ])
    tray.setToolTip("WhatsApp")
    tray.setContextMenu(contextMenu)
    return tray
}

module.exports = {
    create_tray_menu
}