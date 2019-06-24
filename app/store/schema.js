module.exports = {
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