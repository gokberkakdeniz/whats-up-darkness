const { app, dialog } = require('electron')
const { logger } = require("./utils")
const AppUpdater = require("./updater/main")
const AppConstants = require("./constants")
const MainWindow = require("./main/window")

app.setAppUserModelId(AppConstants.APP_USER_MODEL_ID)

if (AppConstants.ELECTRON_IS_DEV) {
    logger.warn("DEVELOPER PROCESS")
    AppConstants.printAll()
} else {
    AppConstants.printBriefly()
}

let mainWindow = new MainWindow()

app.on('second-instance', () => {
    logger.info("another instance of app is detected.")
    if (mainWindow) {
        logger.info("main window is being shown.")
        if (mainWindow.isMinimized()) mainWindow.hide()
        mainWindow.show()
    }
})

if (!app.requestSingleInstanceLock()) {
    logger.error("multiple instance of app is not allowed.")
    return app.quit()
}

app.on('ready', () => {
    logger.info("app is ready.")
    AppUpdater.checkForUpdatesAndNotify()
    AppUpdater.syncUserData()
    mainWindow.init()
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
    if (mainWindow === null) {
        mainWindow = new MainWindow()
        mainWindow.init()
    } else if (mainWindow.window === null) {
        mainWindow = mainWindow.init()
    }
})

process.on("uncaughtException", (err = {}) => {
    logger.error(err.message + "\n" + err.stack)
    dialog.showMessageBox({
        type: "error",
        message: err.stack
    })
    app.quit()
})

process.on("unhandledRejection", (err = {}) => {
    logger.error(err.message + "\n" + err.stack)
    dialog.showMessageBox({
        type: "error",
        message: err.stack
    })
    app.quit()
})