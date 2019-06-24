const electron = require('electron');
const { inspect } = require('util');
const { resolve } = require("path")

const CONSTANTS = new function () {
    this.APP_USER_MODEL_ID = "com.gokberkakdeniz.wupd"
    this.APP_VERSION = require("./package.json").version
    this.ELECTRON_VERSION = process.versions.electron
    this.CHROMIUM_VERSION = process.versions.chrome
    this.LINUX_DESKTOP_ENVIRONMENT = process.env.DESKTOP_SESSION || "nonlinux"
    this.ELECTRON_IS_DEV = require("electron-is-dev")
    this.PLATFORM = process.platform
    this.ARCH = process.arch
    this.DIR = {
        USER_DATA: this.ELECTRON_IS_DEV ? resolve(__dirname, "assets", "userdata") : resolve((electron.app || electron.remote.app).getPath('userData'), "userdata")
    }
    this.USER_DATA = {
        PURE_CSS: resolve(this.DIR.USER_DATA, "onyx.pure.css"),
        USER_CSS: resolve(this.DIR.USER_DATA, "onyx.user.css"),
        THEME_SETTINGS: resolve(this.DIR.USER_DATA, "onyx.settings.json"),
        INFO: resolve(this.DIR.USER_DATA, "info.json")
    }
    const resources = resolve(__dirname, this.ELECTRON_IS_DEV ? "" : "..")
    this.IMAGES = {
        TRAY_NORMAL: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "tray-normal-win32.png") : resolve(resources, "assets", "img", "tray-normal-linux.png"),
        TRAY_ALERT: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "tray-alert-win32.png") : resolve(resources, "assets", "img", "tray-alert-linux.png"),
        APP: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "icon-win32.png") : resolve(resources, "assets", "img", "icon-linux.png"),
        STYLUS: resolve(resources, "assets", "img", "stylus.png")
    }
    this.USER_AGENT = require("@app_main/libs/userAgentTool").get_user_agent()
    this.UPDATER = {
        URL: "https://api.github.com/repos/tncga/whats-up-darkness/releases",
        USER_AGENT: "Whats-Up-Darkness"
    }

    let dump = inspect(this, { compact: false, depth: 5, breakLength: Infinity })
    dump = dump.substring(2, dump.length - 2).replace(/\n/ug, "\n    ")
    this.print = () => console.log(`[LOG] CONSTANTS:\n    ${dump}`)
}

module.exports = CONSTANTS