const { app, dialog } = require('electron')
const { copy, access } = require('fs-extra')
const { autoUpdater } = require("electron-updater")
const { resolve } = require("path")
const FS_EXTRA_CONSTANTS = require("fs-extra").constants
const CONSTANTS = require("./constants")
const store = require("./store")

let { check_new_version } = require("./updater/main")
let MainWindow_Create = require("./main/window")

if (CONSTANTS.ELECTRON_IS_DEV) {
    console.log("\n[WARNING] DEVELOPER PROCESS")
    CONSTANTS.print()
} else {
    console.log("[INFO] wupd: v" + CONSTANTS.APP_VERSION)
    console.log("[INFO] electron: " + CONSTANTS.ELECTRON_VERSION)
    console.log("[INFO] chromium: " + CONSTANTS.CHROMIUM_VERSION)
    console.log("[INFO] os: " + CONSTANTS.PLATFORM)
    if (process.platform === "linux") console.log("[INFO] de: " + CONSTANTS.LINUX_DESKTOP_ENVIRONMENT)
    console.log("[INFO] arch: " + CONSTANTS.ARCH)
}

let win = null

const callback_uptodate = () => win = MainWindow_Create({ store, CONSTANTS })
const callback_no = callback_uptodate
const callback_yes = app.quit

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
    autoUpdater.checkForUpdatesAndNotify()
    access(CONSTANTS.DIR.USER_DATA, FS_EXTRA_CONSTANTS.F_OK, (err) => {
        const IS_NEW_INSTALLATION = !store.has("version")
        const USER_DATA_IS_UNSYNCED = !err && (IS_NEW_INSTALLATION || store.get("version") != CONSTANTS.APP_VERSION)
        if (IS_NEW_INSTALLATION) store.set("version", CONSTANTS.APP_VERSION)

        if (!CONSTANTS.ELECTRON_IS_DEV && err) {
            copy(resolve(__dirname, "..", "..", "assets", "userdata"), CONSTANTS.DIR.USER_DATA)
                .then(() => console.log("[LOG] userdata is copied."))
                .then(() => {
                    //check_new_version(CONSTANTS, callback_uptodate, callback_yes, callback_no)
                })
                .catch((err) => {
                    console.error("[ERROR] userdata could not be copied.\n" + err.message)
                    app.quit()
                }) 
        } else if (!CONSTANTS.ELECTRON_IS_DEV && USER_DATA_IS_UNSYNCED) {
            copy(resolve(__dirname, "..", "..", "assets", "userdata"), CONSTANTS.DIR.USER_DATA, {
                filter: (src) => src.indexOf("onyx.settings.json") == -1
            })
                .then(() => console.log("[LOG] userdata is synced."))
                .then(() => {
                    //check_new_version(CONSTANTS, callback_uptodate, callback_yes, callback_no)
                })
                .catch((err) => {
                    console.error("[ERROR] userdata could not be synced.\n" + err.message)
                    app.quit()
                })
        } else {
            //check_new_version(CONSTANTS, callback_uptodate, callback_yes, callback_no)
        }
    })
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (win === null) win = MainWindow_Create({ store, CONSTANTS })
})

process.on("uncaughtException", (err, _origin) => {
    const messageBoxOptions = {
         type: "error",
         message: err.stack
    }

    console.log("[ERROR] " + err.message)
    console.log(err.stack)

    dialog.showMessageBox(messageBoxOptions)
    app.quit()
 });