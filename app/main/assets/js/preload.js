/* eslint-disable require-jsdoc */
require('module-alias/register')
const { ipcRenderer } = require('electron')
const electron = require("electron").remote
const store = require("@app_store")

// https://stackoverflow.com/a/47776379/8521693
const checkElement = (selector) => {
    if (document.querySelector(selector) === null) {
        return new Promise((resolve) => {
            requestAnimationFrame(resolve)
        }).then(() => checkElement(selector))
    }
    return Promise.resolve(true)
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
        const titleEl = document.querySelector('.version-title');
        if (titleEl && titleEl.innerHTML.includes('Google Chrome 36+')) window.location.reload();

        // Watch 'Click to update WhatsApp' alert
        checkElement(".m6ZEb").then((el) => {
            el.style.display = "none"
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

    if (store.get("desktopNotifications")) {
        const notification = new OldNotification(title, options)
        notification.onclick = () => {
            electron.getCurrentWindow().show()
        }

        setTimeout(() => {
            notification.close()
        }, store.get("notificationTimeout"))

        return notification;
    }
    return null;
}
global.Notification.prototype = OldNotification.prototype
global.Notification.permission = OldNotification.permission
global.Notification.requestPermission = OldNotification.requestPermission

// Load shortcuts
require("./keyboardShortcuts")