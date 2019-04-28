const { join } = require("path")
const { create_tray_menu } = require("./tray")
const { readFile } = require('fs')
const { URLTool } = require("./libs/urlTool")

const PRELOAD_SCRIPT = join(__dirname, "assets", "js", "preload.js")
const USER_AGENT = require("./libs/userAgentTool").get_user_agent()
const CONSTANTS = require("@constants")

let there_is_new_message = false

function create_main_window(args) {
    args.CONSTANTS = CONSTANTS
    const urltool = new URLTool();

    var win = new args.BrowserWindow({
        height: 600,
        width: 800,
        title: "What's up darkness? | tncga",
        icon: CONSTANTS.IMAGES.APP,
        show: false,
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true,
            preload: PRELOAD_SCRIPT
        }
    })

    page = win.webContents;
    args.win = win
    win.setMenu(null)

    win.loadURL("https://web.whatsapp.com/", {
        userAgent: USER_AGENT
    })

    var tray = create_tray_menu(args)

    win.on('closed', function () {
        win = null
    })

    win.on('focus', function () {
        if (there_is_new_message) {
            if (CONSTANTS.LINUX_DESKTOP_ENVIRONMENT != "gnome") tray.setImage(CONSTANTS.IMAGES.TRAY_NORMAL)
            win.flashFrame(false)
            there_is_new_message = false;
        }
    })

    win.on('close', function (e) {
        let about = win.getChildWindows()[0]
        if(about) about.destroy()

        e.preventDefault()
        win.hide()
    })

    if (process.platform == "linux") {
        tray.on('click', function () {
            win.isVisible() ? win.hide() : win.show()
        })
    } else {
        tray.on('double-click', function () {
            win.isVisible() ? win.hide() : win.show()
        })
    }

    args.ipcMain.on('notification-triggered', function (e, msg) {
        if (win.isMinimized() || (!win.isFocused() && win.isVisible()) || !win.isVisible()) {
            there_is_new_message = true;
            if (CONSTANTS.LINUX_DESKTOP_ENVIRONMENT != "gnome") tray.setImage(CONSTANTS.IMAGES.TRAY_ALERT)
            win.flashFrame(true)
        }
    })

    args.ipcMain.on('update-theme', function (e, style) {
        page.executeJavaScript(`var sheet = document.getElementById('onyx'); sheet.innerHTML = \`${style}\`;`, false, () => {
            console.log("[LOG] Theme has been updated via BrowserWindow.webContents.executeJavaScript!")
        })
    })

    args.ipcMain.on('toggle-devtool', (e) => {
        for (w of args.BrowserWindow.getAllWindows()) {
            if (w.getTitle() === "Theme Settings") {
                w.isDevToolsOpened() ? w.closeDevTools() : w.openDevTools({
                    mode: 'bottom'
                })
            }
        }
    })

    page.on('dom-ready', function () {
        readFile(CONSTANTS.USER_DATA.PURE_CSS, "utf-8", (err, data) => {
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

    page.on('new-window', function (e, url) {
        e.preventDefault();
        url_new = urltool.convert(url)
        if (url != url_new && (url_new.indexOf("spotify") > -1 ^ CONSTANTS.PLATFORM == "linux")) {
            args.dialog.showMessageBox(win, {
                type: 'question',
                buttons: ['Yes', 'No'],
                message: 'Do you want to open it Spotify app?'
            }, (r) => {
                if (!r) {
                    args.shell.openExternal(url_new);
                } else {
                    args.shell.openExternal(url);
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