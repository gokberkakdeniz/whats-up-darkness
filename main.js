const {app, BrowserWindow, shell, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const appIcon = path.join(__dirname, 'assets', 'img', 'png', 'icon_normal.png')
const appIconFocused = path.join(__dirname, 'assets', 'img', 'png', 'icon_focused.png')
let win = null
let tray = null

console.log("Electron " + process.versions.electron + " | Chromium " + process.versions.chrome)

// not working on windows unless start script is "electron main.js"
if(process.platform !== 'win32') {
  app.on('second-instance', (commandLine, workingDirectory) => {
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  })
  // it always returns false on windows
  if (!app.requestSingleInstanceLock()) {
    return app.quit()
  }
}

app.on('ready', () => {
  win = new BrowserWindow({
    height: 600,
    width: 800,
    title: "What's up darkness? | tncga",
    icon: appIcon,
    // temporary fix for unthemed window while the CSS is injecting
    show: false,
    webPreferences: {
      preload: path.resolve(__dirname, 'assets', 'libs', 'notification.js')
    }
  })
  win.setMenu(null)

  win.loadURL("https://web.whatsapp.com/")

  win.on('closed', () => {
    win = null
  })

  win.on('focus', () => {
    win.setIcon(appIcon)
    win.flashFrame(false)
  })

  win.on('close', (e) => {
    win.hide()
    e.preventDefault()
  })

  tray = new Tray(appIcon)
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: () => win.show()
    },
    {
      label: 'Toggle developer tools',
      type: 'checkbox',
      checked: false,
      click: () => {
        win.isDevToolsOpened() ? win.closeDevTools() : win.openDevTools({
          mode: 'bottom'
        })
      }
    },
    {
      label: 'Quit',
      click: () => win.destroy()
    }
  ])
  tray.setToolTip("What's up darkness? | tncga")
  tray.setContextMenu(contextMenu)

  tray.on('double-click', (e, b, m) => {
    win.isVisible() ? win.hide() : win.show()
  })

  ipcMain.on('notification-triggered', (e, msg) => {
    if (win.isMinimized()) {
      win.flashFrame(true)
      win.setIcon(appIconFocused)
    }
  })

  const page = win.webContents;

  page.on('did-finish-load', () => {
    // insertCSS not working
    // it fails on background styling
    // page.insertCSS(fs.readFileSync(path.join(__dirname, 'assets', 'css', 'onyx.pure.css'), 'utf8'));
    fs.readFile(path.join(__dirname, 'assets', 'css', 'onyx.pure.css'), "utf-8", (err, data) => {
      if (err) {
        throw err
      } else {
        page.executeJavaScript(`var sheet = document.createElement('style'); sheet.innerHTML = \`${data}\`; document.body.appendChild(sheet);`, false, () => {
          console.log("CSS has been injected via 'BrowserWindow.webContents.executeJavaScript'.")
        })
      }
    })
    win.show()
  })

  page.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win == null) {
    createWindow()
  }
})
