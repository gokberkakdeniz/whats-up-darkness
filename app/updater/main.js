const { dialog, shell, app} = require('electron')
const { logger, get, store} = require("./../utils")
const { accessSync } = require('fs-extra')
const { resolve } = require("path")
const { autoUpdater } = require("electron-updater")
const F_OK = require('fs-extra').constants.F_OK
const AppConstants = require("./../constants")
const semver = require("semver")

autoUpdater.logger = logger

const syncUserData = () => {
    const userDataDir = resolve(__dirname, "..", "..", "assets", "userdata")
    try { // if userdata directory exists
        accessSync(AppConstants.DIR.USER_DATA, F_OK)

        const IS_NEW_INSTALLATION = !store.has("version")
        const USER_DATA_IS_UNSYNCED = (IS_NEW_INSTALLATION || store.get("version") != AppConstants.APP_VERSION)
        if (IS_NEW_INSTALLATION) store.set("version", AppConstants.APP_VERSION)
    
        
        if (!AppConstants.ELECTRON_IS_DEV && USER_DATA_IS_UNSYNCED) {
            copy(userDataDir, AppConstants.DIR.USER_DATA, {
                filter: (src) => src.indexOf("onyx.settings.json") == -1
            })
                .then(() => logger.info("userdata is synced."))
                .catch((err) => {
                    logger.error("userdata could not be synced.\n" + err.message)
                    app.quit()
                })
        }
    } catch (err) { // if userdata directory does not exist
        if (!AppConstants.ELECTRON_IS_DEV && err.code === 'ENOENT') {
            copy(userDataDir, AppConstants.DIR.USER_DATA)
                .then(() => logger.info("userdata is copied."))
                .catch((err) => {
                    logger.error("userdata could not be copied.\n" + err.message)
                    app.quit()
                })
        }
    }
}

const checkForUpdatesAndNotify_unsupported = async () => {
    if (AppConstants.ELECTRON_IS_DEV) return;
    
    logger.info("checking new version...")
    try {
        const data = await get(AppConstants.UPDATER.URL, { 
            headers: {
                "User-Agent": AppConstants.UPDATER.USER_AGENT
            }
        })
        const latest = data[0]
        
        if (semver.gt(latest.tag_name, AppConstants.APP_VERSION)) {
            logger.info("there is a new version of app.")
            logger.info("new version is '" + latest.tag_name + "'.")
            dialog.showMessageBox(null, {
                title: "Do you want to download the new version?",
                type: "question",
                icon: AppConstants.IMAGES.APP,
                buttons: [
                    "OK",
                    "Cancel"
                ],
                message: `Current version: ${AppConstants.APP_VERSION}\nLatest version: ${latest.tag_name}\n\n${latest.body}`
            }, (response) => {
                if (!response) {
                    logger.info("opening download url in browser...")
                    shell.openExternal(latest.html_url)
                    app.quit()
                }
            })
        } else {
            logger.info("app is up-to-date.")
        }
    } catch(err) {
        logger.error("" + err.message)
    }
}

module.exports = { 
    checkForUpdatesAndNotify: AppConstants.PLATFORM === "win32" ? autoUpdater.checkForUpdatesAndNotify : checkForUpdatesAndNotify_unsupported,
    syncUserData
}