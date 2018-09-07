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

/*
  test on windows

  a = () => new Notification(Math.floor((Math.random() * 10) + 1))
  setTimeout(function() {a(); setTimeout(function() {a(); setTimeout(function() {a(); setTimeout(function() {a()}, 50)}, 50)}, 50)}, 50)
*/

//     if (typeof options === "undefined") {
//       options = {}
//       options.tag = "no-tag"
//     } else if (!options.hasOwnProperty("tag")) {
//       options.tag = "no-tag"
//     }
//     if (global.notifications.hasOwnProperty(options.tag)) {
//       console.log(title)
//       new_notification = () => {
//         global.notifications[options.tag].close.bind(global.notifications[options.tag])
//         global.notifications[options.tag] = new OldNotification(title, options)
//       }
//       setTimeout(new_notification, 1500)
//     } else {
//         global.notifications[options.tag] = new OldNotification(title, options)
//     }
//
//     global.notifications[options.tag].onclick = function(title, options) {
//       electron.getCurrentWindow().show()
//     }

    return new OldNotification(title, options)
  }
  global.Notification.prototype = OldNotification.prototype
  global.Notification.permission = OldNotification.permission
  global.Notification.requestPermission = OldNotification.requestPermission
})
