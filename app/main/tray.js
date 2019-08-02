const { Tray, BrowserWindow, Menu } = require("electron")
const SettingsWindow_Create = require("./../settings/window")
const AboutWindow_Create = require("./../about/window")

module.exports = ({ mainWindow, CONSTANTS, store }) => {
    const tray = new Tray(CONSTANTS.IMAGES.TRAY_NORMAL)
    let settingsWindow = null
    let aboutWindow = null

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "Show",
            click: () => {
                mainWindow.hide()
                mainWindow.show()
            }
        },
        {
            label: "Settings",
            submenu: [
                {
                    label: "Desktop notifications",
                    type: "checkbox",
                    checked: store.get("desktopNotifications"),
                    click: () => {
                        const current = store.get("desktopNotifications")
                        store.set("desktopNotifications", !current)
                    }
                },
                {
                    label: "Save size of window",
                    type: "checkbox",
                    checked: store.get("mainWindowSizeSave"),
                    click: () => {
                        const current = store.get("mainWindowSizeSave")
                        store.set("mainWindowSizeSave", !current)
                    }
                },
                {
                    label: "Minimize instead of exit",
                    type: "checkbox",
                    checked: store.get("minimizeOnExitButton"),
                    click: () => {
                        const current = store.get("minimizeOnExitButton")
                        store.set("minimizeOnExitButton", !current)
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Theme",
                    click: () => {
                        for (const window of BrowserWindow.getAllWindows()) {
                            if (window.getTitle() === "Theme Settings") {
                                window.focus()
                                return
                            }
                        }
                        settingsWindow = SettingsWindow_Create({ parentWindow: mainWindow, appIcon: CONSTANTS.IMAGES.APP})
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
                        if (mainWindow.isDevToolsOpened()) {
                            mainWindow.closeDevTools()
                        } else { 
                            mainWindow.openDevTools({
                                mode: "bottom"
                            })
                        }
                    }
                },
                {
                    label: "Reload page",
                    click: () => mainWindow.reload()
                },
                {
                    type: "separator"
                },
                {
                    label: "Clear cache",
                    click: () => {
                        mainWindow.webContents.session.clearStorageData()
                        mainWindow.reload()
                    }
                }
            ]
        },
        {
            label: "About",
            click: () => {
                mainWindow.show()
                
                aboutWindow = AboutWindow_Create({parentWindow: mainWindow, appIcon: CONSTANTS.IMAGES.APP})
            }
        },
        {
            type: "separator"
        },
        {
            label: "Quit",
            click: () => {
                for (const window of BrowserWindow.getAllWindows()) {
                    window.destroy()
                }
            }
        }
    ])
    tray.setToolTip("WhatsApp")
    tray.setContextMenu(contextMenu)
    return tray
}