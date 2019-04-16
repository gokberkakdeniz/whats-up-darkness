const {ipcRenderer} = require('electron')
const electron = require("electron").remote
global.notifications = {}

// setTimeout: fix for async APIs
// electron 3.x/4.x
// https://github.com/electron/electron/issues/13787#issuecomment-413211266
setTimeout(() => {
  const OldNotification = global.Notification
  global.Notification = function (title, options) {
    ipcRenderer.send('notification-triggered', {
      title,
      options
    })

    return new OldNotification(title, options)
  }
  global.Notification.prototype = OldNotification.prototype
  global.Notification.permission = OldNotification.permission
  global.Notification.requestPermission = OldNotification.requestPermission
})

// https://stackoverflow.com/a/53269990/8521693
const checkElement = async selector => {
  while (document.querySelector(selector) === null) {
    await new Promise(resolve => requestAnimationFrame(resolve))
  }
  return document.querySelector(selector)
}

// Update chrome fix
// https://github.com/meetfranz/franz/issues/1185#issuecomment-447908579

var ses = electron.session.defaultSession; //Gets the default session
ses.flushStorageData(); //Writes any unwritten DOMStorage data to disk
ses.clearStorageData({ //Clears the specified storages in the session
  storages: ['appcache', 'serviceworkers', 'cachestorage', 'websql', 'indexdb'],
})

window.navigator.serviceWorker.getRegistrations().then(registrations => {
  for (let registration of registrations) {
    registration.unregister(); //Unregisters all the service workers
  }
})

document.onreadystatechange = function () {
  if (document.readyState === "interactive" || document.readyState === "complete") {
    const titleEl = document.querySelector('.version-title');
    if (titleEl && titleEl.innerHTML.includes('Google Chrome 36+')) {
      window.location.reload(); //Reloads the page if the page shows the error
    }
    
    //Watch 'Click to update WhatsApp' alert
    checkElement(".m6ZEb").then(el => {
      el.style.display = "none"
      console.log("Update alert removed.")
    })
  }
}