const Store = require('electron-store');

const get = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        const lib = url.startsWith("https") ? require("https") : require("http")
        lib.get(url, options, (res) => {
            let data = ""
            res.on("data", (chunk) => data += chunk)
            res.on("end", () => {
                try {
                    data = JSON.parse(data)
                } catch (err) {
                    // skip
                }
                resolve(data)
            })
        })
        .on("error", (err) => {
            reject(err)
        })
    })
}

const logger = {
    info: (msg) => console.log("[LOG] " + msg),
    warn: (msg) => console.log("[WARNING] " + msg),
    error: (msg) => console.error("[ERROR] " + msg),
    debug: (msg) => console.log("[DEBUG] " + msg),
}

const store = new Store({
    schema: {
        desktopNotifications: {
            type: "boolean",
            default: true
        },
        notificationTimeout: {
            type: "number",
            minimum: 0,
            default: 3000
        },
        minimizeOnExitButton: {
            type: "boolean",
            default: true
        },
        mainWindowHeight: {
            type: "number",
            default: 600
        },
        mainWindowWidth: {
            type: "number",
            default: 800
        },
        mainWindowSizeSave: {
            type: "boolean",
            default: false
        }
    }
})

module.exports = {
    get,
    logger,
    store
}