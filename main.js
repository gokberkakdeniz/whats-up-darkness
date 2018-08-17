const {app, BrowserWindow, shell, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const appIcon = path.join(__dirname, 'icon_normal.png')

console.log("Electron " + process.versions.electron + " | Chromium " + process.versions.chrome)
let win = null
let tray = null
app.on('second-instance', (commandLine, workingDirectory) => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

if (!app.requestSingleInstanceLock()) {
  return app.quit()
}

app.on('ready', () => {
  win = new BrowserWindow({
    height: 600,
    width: 800,
    title: "What's up darkness? | tncga",
    icon: appIcon,
    webPreferences: {
      preload: path.resolve(__dirname, 'notification.js')
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
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => win.show()
    },
    {
      label: 'Toggle developer tools',
      type: 'checkbox',
      checked: false,
      click: () => {
        win.toggleDevTools()
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

  ipcMain.on('notification-shim', (e, msg) => {
    if (win.isMinimized()) {
      win.flashFrame(true)
      win.setIcon(path.join(__dirname, 'icon_focused.png'))
    }
  })

  const page = win.webContents;

  page.on('dom-ready', () => {
    // insertCSS not working
    // it fails on background styling
    // page.insertCSS(fs.readFileSync(path.join(__dirname, 'dark.pure.css'), 'utf8'));
    fs.readFile("./onyx.pure.css", "utf-8", (err, data) => {
      page.executeJavaScript(`var sheet = document.createElement('style'); sheet.innerHTML = \`${data}\`; document.body.appendChild(sheet);`)
    })
    win.show();
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
