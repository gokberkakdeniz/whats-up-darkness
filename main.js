const {app, BrowserWindow, shell, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const appIcon = path.join(__dirname, 'assets', 'img', 'png', 'icon_normal.png')
const appIconFocused = path.join(__dirname, 'assets', 'img', 'png', 'icon_focused.png')
let win, tray, page, child

console.log("Electron " + process.versions.electron + " | Chromium " + process.versions.chrome)

app.on('second-instance', (commandLine, workingDirectory) => {
  if (win) {
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

if (!app.requestSingleInstanceLock()) {
  return app.quit()
}

function createWindow() {
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

  win.on('closed', function () {
    win = null
  })

  win.on('focus', function () {
    win.setIcon(appIcon)
    win.flashFrame(false)
  })

  win.on('close', function (e) {
    e.preventDefault()
    win.hide()
  })

  tray = new Tray(appIcon)
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: function() {
        win.show()
      }
    },
    {
      label: 'Toggle developer tools',
      click: function() {
        win.isDevToolsOpened() ? win.closeDevTools() : win.openDevTools({
          mode: 'bottom'
        })
      }
    },
    {
      label: 'Configure theme',
      click: function() {
        for (w of BrowserWindow.getAllWindows()) {
          if (w.getTitle() == "Theme Settings | tncga") {
            w.focus()
            return;
          }
        }
        child = new BrowserWindow({
          parent: win,
          width: 400,
          height: 800,
          maximizable: false,
          resizable: false,
          icon: appIcon,
          title: "Theme Settings | tncga"
        })
        child.setMenuBarVisibility(false)
        child.loadFile(path.join(__dirname, 'assets', 'html', 'menu.html'))
        child.webContents.on('will-navigate', function(e, url) {
          e.preventDefault();
          shell.openExternal(url);
        })
      }
    },
    {
      label: 'Quit',
      click: function() {
        win.destroy()
      }
    }
  ])
  tray.setToolTip("What's up darkness? | tncga")
  tray.setContextMenu(contextMenu)

  tray.on('double-click', function() {
    win.isVisible() ? win.hide() : win.show()
  })

  ipcMain.on('notification-triggered', function(e, msg) {
    if (win.isMinimized()) {
      win.flashFrame(true)
      win.setIcon(appIconFocused)
    }
  })

  ipcMain.on('update-theme', function(e, style) {
    page.executeJavaScript(`var sheet = document.getElementById('onyx');
    sheet.innerHTML = \`${style}\`;`, false, () => {
      console.log("Theme has been updated via 'BrowserWindow.webContents.executeJavaScript'.")
    })
  })

  ipcMain.on('toggle-menu', (e) => {
    child.setMenuBarVisibility(!child.isMenuBarVisible())
  })

  page = win.webContents;

  page.on('did-finish-load', function() {
    // insertCSS not working
    // it fails on background styling
    // page.insertCSS(fs.readFileSync(path.join(__dirname, 'assets', 'css', 'onyx.pure.css'), 'utf8'));
    fs.readFile(path.join(__dirname, 'assets', 'css', 'onyx.pure.css'), "utf-8", (err, data) => {
      if (err) {
        throw err
      } else {
        page.executeJavaScript(`var sheet = document.createElement('style');
        sheet.id="onyx"
        sheet.innerHTML = \`${data}\`;
        document.body.appendChild(sheet);`, false, () => {
          console.log("CSS has been injected via 'BrowserWindow.webContents.executeJavaScript'.")
        })
      }
    })
    win.show()
  })

  page.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  if (win === null) {
    createWindow()
  }
})
