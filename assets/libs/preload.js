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
    
    return new OldNotification(title, options)
  }
  global.Notification.prototype = OldNotification.prototype
  global.Notification.permission = OldNotification.permission
  global.Notification.requestPermission = OldNotification.requestPermission
})

// Update chrome fix
// https://github.com/meetfranz/franz/issues/1185#issuecomment-447908579

var ses = electron.session.defaultSession; //Gets the default session
ses.flushStorageData(); //Writes any unwritten DOMStorage data to disk
ses.clearStorageData({ //Clears the specified storages in the session
    storages: ['appcache', 'serviceworkers', 'cachestorage', 'websql', 'indexdb'],
});
window.navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
        registration.unregister(); //Unregisters all the service workers
    }
});
window.onload = function() {
  const titleEl = document.querySelector('.window-title');
  if (titleEl && titleEl.innerHTML.includes('Google Chrome 36+')) {
      window.location.reload(); //Reloads the page if the page shows the error
  }
}