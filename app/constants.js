const { resolve } = require("path")
const { execSync } = require('child_process')
const { logger } = require("./utils")
const electron = require('electron')
const pkg = require("./../package.json")

module.exports = new function () {
    this.APP_USER_MODEL_ID = "com.gokberkakdeniz.wupd"
    this.APP_VERSION = pkg.version
    this.ELECTRON_VERSION = process.versions.electron
    this.CHROMIUM_VERSION = process.versions.chrome
    this.LINUX_DESKTOP_ENVIRONMENT = process.env.DESKTOP_SESSION || "nonlinux"
    this.ELECTRON_IS_DEV = require("electron-is-dev")
    this.PLATFORM = process.platform
    this.ARCH = process.arch
    this.DIR = {
        USER_DATA: this.ELECTRON_IS_DEV ? resolve(__dirname, "..", "assets", "userdata") : resolve((electron.app || electron.remote.app).getPath('userData'), "userdata")
    }
    this.USER_DATA = {
        PURE_CSS: resolve(this.DIR.USER_DATA, "onyx.pure.css"),
        USER_CSS: resolve(this.DIR.USER_DATA, "onyx.user.css"),
        THEME_SETTINGS: resolve(this.DIR.USER_DATA, "onyx.settings.json"),
        INFO: resolve(this.DIR.USER_DATA, "info.json")
    }
    const resources = resolve(__dirname, this.ELECTRON_IS_DEV ? ".." : "../..")

    this.IMAGES = {
        TRAY_NORMAL: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "tray-normal-win32.png") : resolve(resources, "assets", "img", "tray-normal-linux.png"),
        TRAY_ALERT: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "tray-alert-win32.png") : resolve(resources, "assets", "img", "tray-alert-linux.png"),
        APP: this.PLATFORM === "win32" ? resolve(resources, "assets", "img", "icon-win32.png") : resolve(resources, "assets", "img", "icon-linux.png"),
        STYLUS: resolve(resources, "assets", "img", "stylus.png")
    }
    this.FIREFOX_VERSION = "68.0"
    this.USER_AGENT = (() => {
        const OS_ARCH = process.arch == "x64" ? "x86_64" : "i686"
        switch(process.platform) {
            case "win32":
                return "Mozilla/5.0 (Windows NT 10.0; Win64; rv:" + this.FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + this.FIREFOX_VERSION
            case "linux":
                try {
                    const DISTO = execSync("cat /etc/os-release | head -n 1 | sed 's/NAME=//g'").toString()
                        .replace("\n", "")
                    return "Mozilla/5.0 (X11; " + DISTO + "; Linux " + OS_ARCH + "; rv:" + this.FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + this.FIREFOX_VERSION
                } catch(err) {
                    return "Mozilla/5.0 (X11; Linux " + OS_ARCH + "; rv:" + this.FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + this.FIREFOX_VERSION
                }
            case "darwin":
                return "Mozilla/5.0 (Macintosh;; rv:" + this.FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + this.FIREFOX_VERSION
            default:
                return "Mozilla/5.0 (Linux x86_64; rv:" + this.FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + this.FIREFOX_VERSION
        }
    })()
    this.UPDATER = {
        URL: "https://api.github.com/repos/tncga/whats-up-darkness/releases",
        USER_AGENT: "Whats-Up-Darkness"
    }
    this.printAll = () => {
        const printHelper = (obj, tabCount = 0) => {
            for (const key in obj) {
                if (key.indexOf("print") > -1) continue
    
                if (typeof obj[key] === "object") {
                    console.log("  ".repeat(tabCount) + key + ":")
                    printHelper(obj[key], tabCount + 1)
                } else {
                    console.log("  ".repeat(tabCount) + key + " = " + obj[key])
                }
            }
        }
        console.log("====================CONSTANTS====================")
        printHelper(this)
        console.log("=================================================")
    }
    this.printBriefly = () => {
        logger.info("wupd: v" + this.APP_VERSION)
        logger.info("electron: " + this.ELECTRON_VERSION)
        logger.info("chromium: " + this.CHROMIUM_VERSION)
        logger.info("os: " + this.PLATFORM)
        if (process.platform === "linux") logger.info("de: " + this.LINUX_DESKTOP_ENVIRONMENT)
        logger.info("arch: " + this.ARCH)
    }
}