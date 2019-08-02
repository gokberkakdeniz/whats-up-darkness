const { join } = require("path")
const { BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron")

const TrayMenu_Create = require("./tray")
const { readFile } = require('fs')
const { convert_url } = require("./libs/urlTool")

module.exports = ({ store, CONSTANTS }) => {
    let isThereNewMessage = false
    
    // ELECTRON BUG: mainWindow.setMenu(null) not working on linux (https://github.com/electron/electron/issues/16521)
    if (CONSTANTS.PLATFORM === "linux") Menu.setApplicationMenu(null)
    
    let mainWindow = new BrowserWindow({
        height: store.get("mainWindowHeight"),
        width: store.get("mainWindowWidth"),
        title: "What's up darkness? | tncga",
        icon: CONSTANTS.IMAGES.APP,
        backgroundColor: '#272C35',
        show: false,
        webPreferences: {
            nodeIntegration: true,
            preload: join(__dirname, "assets", "js", "preload.js")
        }
    })

    const page = mainWindow.webContents
    
    if (CONSTANTS.PLATFORM != "linux") mainWindow.setMenu(null)

    mainWindow.loadURL("https://web.whatsapp.com/", {
        userAgent: CONSTANTS.USER_AGENT
    })

    const tray = TrayMenu_Create({ mainWindow: mainWindow, CONSTANTS: CONSTANTS, store: store })

    mainWindow.on('closed', () => mainWindow = null)

    mainWindow.on('focus', () => {
        if (isThereNewMessage) {
            if (CONSTANTS.LINUX_DESKTOP_ENVIRONMENT != "gnome") tray.setImage(CONSTANTS.IMAGES.TRAY_NORMAL)
            mainWindow.flashFrame(false)
            isThereNewMessage = false;
        }
    })

    mainWindow.on("resize", () => {
        if (store.get("mainWindowSizeSave")) {
            const size = mainWindow.getSize()
            store.set("mainWindowWidth", size[0])
            store.set("mainWindowHeight", size[1])
        }
        
    })

    mainWindow.on('close', (event) => {
        if (store.get("minimizeOnExitButton")) {
            const [about] = mainWindow.getChildWindows()
            if (about) about.destroy()

            event.preventDefault()
            mainWindow.hide()
        } else {
            for (const window of BrowserWindow.getAllWindows()) {
                window.destroy()
            }
        }
    })

    tray.on('click', () => (mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()))

    ipcMain.on('notification-triggered', () => {
        if (mainWindow.isMinimized() || (mainWindow.isVisible() && !mainWindow.isFocused()) || !mainWindow.isVisible()) {
            isThereNewMessage = true;
            if (CONSTANTS.LINUX_DESKTOP_ENVIRONMENT.indexOf("gnome") == -1) {
                tray.setImage(CONSTANTS.IMAGES.TRAY_ALERT)
                mainWindow.flashFrame(true)
            }
        }
    })

    ipcMain.on('update-theme', function (_event, style) {
        // TODO: test implementation with insertCSS & removeInsertedCSS methods that are introduced in electron 7.x
        // page.insertCSS(style)
        // console.log("[LOG] Theme has been updated via BrowserWindow.webContents.inserCSS!")
        page.executeJavaScript(`var sheet = document.getElementById('onyx'); sheet.innerHTML = \`${style}\`;`, false)
            .then(() => {
                console.log("[LOG] Theme has been updated via BrowserWindow.webContents.executeJavaScript!")
            })
    })

    ipcMain.on('toggle-devtool', () => {
        for (const mainWindow of BrowserWindow.getAllWindows()) {
            if (mainWindow.getTitle() === "Theme Settings") {
                if (mainWindow.isDevToolsOpened()) {
                    mainWindow.closeDevTools()
                } else {
                    mainWindow.openDevTools({
                        mode: 'bottom'
                    })
                }
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
                    mainWindow.show()
                })
        })
    })

    page.on('new-window', function (event, url) {
        event.preventDefault();
        const newUrl = convert_url(url)
        if (url != newUrl && newUrl.indexOf("spotify") > -1 ^ CONSTANTS.PLATFORM == "linux") {
            dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: [
                    'Yes',
                    'No'
                ],
                message: 'Do you want to open with Spotify app?'
            }, (response) => {
                if (response) {
                    shell.openExternal(url);
                } else {
                    shell.openExternal(newUrl);
                }
            })
        } else {
            shell.openExternal(url);
        }
    })
    return mainWindow
}