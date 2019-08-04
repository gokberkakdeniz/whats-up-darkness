const { ipcRenderer } = require('electron')
const electron = require("electron").remote
const { store } = require("./../../../utils")
const NotificationQueue = require("./NotificationQueue.js")

const notifications = new NotificationQueue();

// https://stackoverflow.com/a/47776379/8521693
const checkElement = (selector) => {
    const el = document.querySelector(selector)
    if (el === null) {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve)
        }).then(() => checkElement(selector))
    }
    return Promise.resolve(el)
}

/*
 * Update chrome fix
 * https://github.com/meetfranz/franz/issues/1185#issuecomment-447908579
 */

// Gets the default session
const ses = electron.session.defaultSession;
// Writes any unwritten DOMStorage data to disk
ses.flushStorageData();
// Clears the specified storages in the session
ses.clearStorageData({
    storages: [
        'appcache',
        'serviceworkers',
        'cachestorage',
        'websql',
        'indexdb'
    ]
})

window.navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
        // Unregisters all the service workers
        registration.unregister();
    }
})

document.onreadystatechange = function () {
    if (document.readyState === "interactive" || document.readyState === "complete") {
        // Reload page if "WhatsApp works with Google Chrome 49+" alert is shown.
        if (document.querySelector('.version-title')) window.location.reload();

        // Watch 'Click to update WhatsApp' alert
        checkElement("span[data-icon=alert-update]").then((el) => {
            el.parentNode.parentNode.parentNode.style.display = "none"
            console.log("Update alert removed.")
        })
    }
}

// Overwrite browser notification api
const OldNotification = global.Notification
global.Notification = function (title, options) {
    ipcRenderer.send('notification-triggered', {
        title,
        options
    })

    if (store.get("desktopNotifications") && !electron.getCurrentWindow().isFocused()) {
        notifications.dequeue()

        const notification = new OldNotification(title, options)

        notification.onclick = () => {
            electron.getCurrentWindow().show()
        }

        notification.onclose = () => {
            if (notification === notifications.front()) notifications.dequeue()
        }

        setTimeout(() => {
            notification.onclose()
        }, store.get("notificationTimeout"))

        notifications.enqueue(notification)

        return notification;
    }
    return null;
}
global.Notification.prototype = OldNotification.prototype
global.Notification.permission = OldNotification.permission
global.Notification.requestPermission = OldNotification.requestPermission

// Load shortcuts
require("./keyboardShortcuts")