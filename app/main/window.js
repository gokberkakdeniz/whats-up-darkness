const { BrowserWindow, Menu, ipcMain, dialog, shell } = require("electron")
const { logger, store } = require("./../utils")
const { join } = require("path")
const { readFile } = require('fs')
const { convert_url } = require("./libs/urlTool")
const TrayMenu_Create = require("./tray")
const AppConstants = require("./../constants")

class MainWindow {
    constructor() {
        this.mainWindow = null
        this.isThereANewMessage = false
    }

    init() {
        if (this.mainWindow !== null) throw new Error("The window is already created.")
        
        Menu.setApplicationMenu(null)
        
        this.mainWindow = new BrowserWindow({
            height: store.get("mainWindowHeight"),
            width: store.get("mainWindowWidth"),
            title: "What's up darkness? | tncga",
            icon: AppConstants.IMAGES.APP,
            backgroundColor: '#272C35',
            show: false,
            webPreferences: {
                nodeIntegration: true,
                preload: join(__dirname, "assets", "js", "preload.js")
            }
        })

        // Attach BrowserWindow methods
        for (const method in BrowserWindow.prototype) {
            if (method !== "constructor") Reflect.defineProperty(this, method, { value: this.mainWindow[method] })
        }

        const page = this.mainWindow.webContents
        
        this.mainWindow.setMenu(null)

        this.mainWindow.loadURL("https://web.whatsapp.com/", {
            userAgent: AppConstants.USER_AGENT
        })

        const tray = TrayMenu_Create(this.mainWindow)

        this.mainWindow.on('closed', () => this.mainWindow = null)

        this.mainWindow.on('focus', () => {
            if (this.isThereANewMessage) {
                if (AppConstants.LINUX_DESKTOP_ENVIRONMENT != "gnome") tray.setImage(AppConstants.IMAGES.TRAY_NORMAL)
                this.mainWindow.flashFrame(false)
                this.isThereANewMessage = false;
            }
        })

        this.mainWindow.on("resize", () => {
            if (store.get("mainWindowSizeSave")) {
                const size = this.mainWindow.getSize()
                store.set("mainWindowWidth", size[0])
                store.set("mainWindowHeight", size[1])
            }
            
        })

        this.mainWindow.on('close', (event) => {
            if (store.get("minimizeOnExitButton")) {
                const [about] = this.mainWindow.getChildWindows()
                if (about) about.destroy()

                event.preventDefault()
                this.mainWindow.hide()
            } else {
                for (const window of BrowserWindow.getAllWindows()) {
                    window.destroy()
                }
            }
        })

        tray.on('click', () => (this.mainWindow.isVisible() ? this.mainWindow.hide() : this.mainWindow.show()))

        ipcMain.on('notification-triggered', () => {
            if (this.mainWindow.isMinimized() || (this.mainWindow.isVisible() && !this.mainWindow.isFocused()) || !this.mainWindow.isVisible()) {
                this.isThereANewMessage = true;
                if (AppConstants.LINUX_DESKTOP_ENVIRONMENT.indexOf("gnome") === -1) {
                    tray.setImage(AppConstants.IMAGES.TRAY_ALERT)
                    this.mainWindow.flashFrame(true)
                }
            }
        })

        ipcMain.on('update-theme', function (_event, style) {
            // TODO: test implementation with insertCSS & removeInsertedCSS methods that are introduced in electron 7.x
            // page.insertCSS(style)
            //logger.info("Theme has been updated via BrowserWindow.webContents.inserCSS!")
            page.executeJavaScript(`var sheet = document.getElementById('onyx'); sheet.innerHTML = \`${style}\`;`, false)
                .then(() => {
                logger.info("theme has been updated via BrowserWindow.webContents.executeJavaScript!")
                })
        })

        ipcMain.on('toggle-devtool', () => {
            for (const window of BrowserWindow.getAllWindows()) {
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

        page.on('dom-ready', () => {
            readFile(AppConstants.USER_DATA.PURE_CSS, "utf-8", (err, data) => {
                if (err) {
                    logger.error("CSS could not be injected!\n" + err.message)
                    throw err
                }

                page.executeJavaScript(`var exists = document.getElementById("onyx") != undefined; var sheet = document.getElementById("onyx") || document.createElement('style'); sheet.id="onyx"; sheet.innerHTML = \`${data}\`; document.body.appendChild(sheet); exists`, false)
                    .then((exists) => {
                        if (!exists) logger.info("CSS has been injected via BrowserWindow.webContents.executeJavaScript!")
                        this.mainWindow.show()
                    })
            })
        })

        page.on('new-window', (event, url) => {
            event.preventDefault();
            const newUrl = convert_url(url)
            if (url != newUrl && newUrl.indexOf("spotify") > -1 ^ AppConstants.PLATFORM == "linux") {
                dialog.showMessageBox(this.mainWindow, {
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
    }

    get window() {
        if (!this.mainWindow) throw new Error("The window is not created.")
        return this.mainWindow
    }
}

module.exports = MainWindow