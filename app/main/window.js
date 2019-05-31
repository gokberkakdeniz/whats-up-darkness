const { join } = require("path")
const { create_tray_menu } = require("./tray")
const { readFile } = require('fs')
const { convert_url } = require("./libs/urlTool")

const PRELOAD_SCRIPT = join(__dirname, "assets", "js", "preload.js")

const create_main_window = (args) => {
    let there_is_new_message = false
    
    // ELECTRON BUG: win.setMenu(null) not working (https://github.com/electron/electron/issues/16521)
    args.Menu.setApplicationMenu(null)

    let win = new args.BrowserWindow({
        height: 600,
        width: 800,
        title: "What's up darkness? | tncga",
        icon: args.CONSTANTS.IMAGES.APP,
        show: false,
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true,
            preload: PRELOAD_SCRIPT
        }
    })

    const page = win.webContents;
    args.win = win
    win.setMenu(null)

    win.loadURL("https://web.whatsapp.com/", {
        userAgent: args.CONSTANTS.USER_AGENT
    })

    const tray = create_tray_menu(args)

    win.on('closed', () => win = null)

    win.on('focus', () => {
        if (there_is_new_message) {
            if (args.CONSTANTS.LINUX_DESKTOP_ENVIRONMENT != "gnome") tray.setImage(args.CONSTANTS.IMAGES.TRAY_NORMAL)
            win.flashFrame(false)
            there_is_new_message = false;
        }
    })

    win.on('close', (event) => {
        const [about] = win.getChildWindows()
        if (about) about.destroy()

        event.preventDefault()
        win.hide()
    })

    tray.on('click', () => (win.isVisible() ? win.hide() : win.show()))

    args.ipcMain.on('notification-triggered', () => {
        if (win.isMinimized() || (win.isVisible() && !win.isFocused()) || !win.isVisible()) {
            there_is_new_message = true;
            if (args.CONSTANTS.LINUX_DESKTOP_ENVIRONMENT.indexOf("gnome") == -1) {
                tray.setImage(args.CONSTANTS.IMAGES.TRAY_ALERT)
                win.flashFrame(true)
            }
        }
    })

    args.ipcMain.on('update-theme', function (_event, style) {
        page.executeJavaScript(`var sheet = document.getElementById('onyx'); sheet.innerHTML = \`${style}\`;`, false, () => {
            console.log("[LOG] Theme has been updated via BrowserWindow.webContents.executeJavaScript!")
        })
    })

    args.ipcMain.on('toggle-devtool', () => {
        for (const window of args.BrowserWindow.getAllWindows()) {
            if (window.getTitle() === "Theme Settings") {
                if (window.isDevToolsOpened()) {
                    window.closeDevTools()
                } else {
                    window.openDevTools({
                        mode: 'bottom'
                    })
                }
            }
        }
    })

    page.on('dom-ready', function () {
        readFile(args.CONSTANTS.USER_DATA.PURE_CSS, "utf-8", (err, data) => {
            if (err) {
                console.log("[ERROR] CSS could not be injected!\n" + err.message)
                throw err
            }
            page.executeJavaScript(`var exists = document.getElementById("onyx") != undefined; var sheet = document.getElementById("onyx") || document.createElement('style'); sheet.id="onyx"; sheet.innerHTML = \`${data}\`; document.body.appendChild(sheet); exists`, false)
                .then((exists) => {
                    if (!exists) console.log("[LOG] CSS has been injected via BrowserWindow.webContents.executeJavaScript!")
                    win.show()
                })
        })
    })

    page.on('new-window', function (event, url) {
        event.preventDefault();
        const url_new = convert_url(url)
        // eslint-disable-next-line no-bitwise
        if (url != url_new && url_new.indexOf("spotify") > -1 ^ args.CONSTANTS.PLATFORM == "linux") {
            args.dialog.showMessageBox(win, {
                type: 'question',
                buttons: [
                    'Yes',
                    'No'
                ],
                message: 'Do you want to open with Spotify app?'
            }, (response) => {
                if (response) {
                    args.shell.openExternal(url);
                } else {
                    args.shell.openExternal(url_new);
                }
            })
        } else {
            args.shell.openExternal(url);
        }
    })
    return win
}

module.exports = {
    create_main_window
}