//original: https://github.com/seriema/electron-notification-shim
const {ipcRenderer} = require('electron')
const electron = require("electron").remote
global.notifications= {}

// setTimeout: fix for async APIs
// electron 3.x/4.x
// https://github.com/electron/electron/issues/13787#issuecomment-413211266
setTimeout(() => {
  const OldNotification = global.Notification
  global.Notification = function(title, options) {
    ipcRenderer.send('notification-triggered', {
      title,
      options
    })
    if (global.notifications[options.tag]) {
      global.notifications[options.tag].close.bind(global.notifications[options.tag])
    }
    global.notifications[options.tag] = new OldNotification(title, options)
    global.notifications[options.tag].onclick = function(title, options) {
      electron.getCurrentWindow().show()
    }
  }
  global.Notification.prototype = OldNotification.prototype
  global.Notification.permission = OldNotification.permission
  global.Notification.requestPermission = OldNotification.requestPermission
})
