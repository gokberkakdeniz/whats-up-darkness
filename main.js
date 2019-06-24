require('module-alias/register')

const {app, BrowserWindow, dialog, shell, ipcMain, Tray, Menu} = require('electron')
const { copy, access } = require('fs-extra')
const FS_EXTRA_CONSTANTS = require("fs-extra").constants
const { resolve } = require("path")
const CONSTANTS = require("@constants")
const store = require("@app_store")

let { check_new_version } = require("@app_updater")
let { create_main_window } = require("@app_main/window.js")

if(CONSTANTS.ELECTRON_IS_DEV) {
    console.log("\n[WARNING] DEVELOPER PROCESS")
    CONSTANTS.print()
} else {
    console.log("[INFO] wupd: v" + CONSTANTS.APP_VERSION)
    console.log("[INFO] electron: " + CONSTANTS.ELECTRON_VERSION)
    console.log("[INFO] chromium: " + CONSTANTS.CHROMIUM_VERSION)
    console.log("[INFO] os: " + CONSTANTS.PLATFORM)
    if(process.platform === "linux") console.log("[INFO] de: " + CONSTANTS.LINUX_DESKTOP_ENVIRONMENT)
    console.log("[INFO] arch: " + CONSTANTS.ARCH)
}

let win = null
create_main_window = create_main_window.bind(this, {BrowserWindow, Tray, Menu, ipcMain, dialog, shell, app, CONSTANTS, store})
check_new_version = check_new_version.bind(this, {dialog, shell, CONSTANTS})

const callback_uptodate = () => win = create_main_window()
const callback_no = callback_uptodate
const callback_yes = ((app) => app.quit()).bind(this, app)

app.setAppUserModelId(CONSTANTS.APP_USER_MODEL_ID)

app.on('second-instance', () => {
    console.log("[LOG] another instance of app is detected.")
    if (win) {
        console.log("[LOG] main window is being shown.")
        if (win.isMinimized()) win.hide()
        win.show()
    }
})

if (!app.requestSingleInstanceLock()) {
    console.error("[ERROR] multiple instance of app is not allowed.")
    return app.quit()
}

app.on('ready', () => {
    console.log("[LOG] app is ready.")
    access(CONSTANTS.DIR.USER_DATA, FS_EXTRA_CONSTANTS.F_OK, (err) => {
        let USER_DATA_IS_UNSYNCED = false
        if (!err) USER_DATA_IS_UNSYNCED = require(CONSTANTS.USER_DATA.INFO).version != CONSTANTS.APP_VERSION

        if (!CONSTANTS.ELECTRON_IS_DEV && err) {
            copy(resolve(__dirname, "..", "assets", "userdata"), CONSTANTS.DIR.USER_DATA)
                .then(() => console.log("[LOG] userdata is copied."))
                .then(() => {
                    check_new_version(callback_uptodate, callback_yes, callback_no)
                })
                .catch((err) => {
                    console.error("[ERROR] userdata could not be copied.\n" + err.message)
                    app.quit()
                }) 
        } else if (!CONSTANTS.ELECTRON_IS_DEV && USER_DATA_IS_UNSYNCED) {
            copy(resolve(__dirname, "..", "assets", "userdata"), CONSTANTS.DIR.USER_DATA, {
                filter: (src) => src.indexOf("onyx.settings.json") == -1
            })
                .then(() => console.log("[LOG] userdata is synced."))
                .then(() => {
                    check_new_version(callback_uptodate, callback_yes, callback_no)
                })
                .catch((err) => {
                    console.error("[ERROR] userdata could not be synced.\n" + err.message)
                    app.quit()
                })            
        } else {
            check_new_version(callback_uptodate, callback_yes, callback_no)
        }
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (win === null) win = create_main_window()
})
