const {app, BrowserWindow, dialog, shell, ipcMain, Tray, Menu} = require('electron')
const {join} = require('path')
const {readFile} = require('fs')
const {get} = require('https');
const compareVersions = require('compare-versions');
const appIcon = join(__dirname, 'assets', 'img', 'png', 'icon_normal.png')
const appIconFocused = join(__dirname, 'assets', 'img', 'png', 'icon_focused.png')
let win, tray, page, child

get({
  hostname: "api.github.com",
  path: "/repos/tncga/whats-up-darkness/releases",
  headers: {
    "user-agent": "Whats-Up-Darkness"
  }
}, (res) => {
  let err, data = ""

  if (res.statusCode !== 200) {
    error = new Error(`Cannot retrieve version data (Status Code: ${res.statusCode}).`)
  } else if (!/^application\/json/.test(res.headers['content-type'])) {
    error = new Error(`Expected application/json but received ${res.headers['content-type']}.`)
  }

  if (err) {
    console.log(err.message);
    res.resume()
    return
  }

  res.setEncoding("utf8")
  res.on("data", c => data += c)
  res.on("end", () => {
    const latest_version = JSON.parse(data)[0]
    if (compareVersions(latest_version.tag_name, app.getVersion()) === 1) {
      dialog.showMessageBox(win, {type: 'question', buttons: ['OK', 'Cancel'], message: `Do you want to download it?\n\n   Current version: ${app.getVersion()}\n   Latest version: ${latest_version.tag_name}\n\n${latest_version.body}`}, (r) => {
        if (!r) {
          shell.openExternal(latest_version.html_url)
        }
      })
    }
  }).on("error", e => {
    console.log(e.message)
  })
})

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
      preload: join(__dirname, 'assets', 'libs', 'notification.js')
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
        child.setMenu(null)
        child.loadFile(join(__dirname, 'assets', 'html', 'menu.html'))
        child.webContents.on('will-navigate', function(e, url) {
          e.preventDefault();
          shell.openExternal(url);
        })
      }
    },
    {
      label: 'Quit',
      click: function() {
        try {
          win.destroy()
          child.destroy()
        } catch(e) {
        }
      }
    }
  ])
  tray.setToolTip("What's up darkness? | tncga")
  tray.setContextMenu(contextMenu)

  if (process.platform == "linux" /*&& process.env.XDG_SESSION_DESKTOP == "KDE"*/) {
    tray.on('click', function() {
      win.isVisible() ? win.hide() : win.show()
    })
  } else {
    tray.on('double-click', function() {
      win.isVisible() ? win.hide() : win.show()
    })
  }

  ipcMain.on('notification-triggered', function(e, msg) {
    if (win.isMinimized() || (!win.isFocused() && win.isVisible())) {
      win.flashFrame(true)
      win.setIcon(appIconFocused)      
    }
  })

  ipcMain.on('update-theme', function(e, style) {
    page.executeJavaScript(`var sheet = document.getElementById('onyx');
    sheet.innerHTML = \`${style}\`;`, false, () => {
      console.log("Theme has been updated via BrowserWindow.webContents.executeJavaScript!")
    })
  })

  ipcMain.on('toggle-devtool', (e) => {
    child.isDevToolsOpened() ? child.closeDevTools() : child.openDevTools({
      mode: 'bottom'
    })
  })

  page = win.webContents;

  page.on('did-finish-load', function() {
    // insertCSS not working
    // it fails on background styling
    // page.insertCSS(fs.readFileSync(join(__dirname, 'assets', 'css', 'onyx.pure.css'), 'utf8'));
    readFile(join(__dirname, 'assets', 'css', 'onyx.pure.css'), "utf-8", (err, data) => {
      if (err) {
        throw err
      } else {
        page.executeJavaScript(`var sheet = document.createElement('style');
        sheet.id="onyx"
        sheet.innerHTML = \`${data}\`;
        document.body.appendChild(sheet);`, false, () => {
          console.log("CSS has been injected via BrowserWindow.webContents.executeJavaScript!")
        })
      }
    })
    readFile(join(__dirname, 'assets', 'libs', 'keyboardShortcuts.js'), "utf-8", (err, data) => {
      if (err) {
        throw err
      } else {
        page.executeJavaScript(data, false, () => {
          console.log("Keyboard shortcuts have been injected via BrowserWindow.webContents.executeJavaScript!")
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
