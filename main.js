const {app, BrowserWindow, dialog, shell, ipcMain, Tray, Menu} = require('electron')
const {join} = require('path')
const {readFile} = require('fs')
const {URL} = require(join(__dirname, 'assets', 'libs', 'urlTool.js'))
const compareVersions = require('compare-versions')
const fetch = require('node-fetch')

const Icon = join(__dirname, 'assets', 'img', 'png', 'icon-32x32.png')
const IconTray = join(__dirname, 'assets', 'img', 'png', 'icon_normal.png')
const IconFocused = join(__dirname, 'assets', 'img', 'png', 'icon_focused.png')
const Style = join(__dirname, 'assets', 'css', 'onyx.pure.css')
const Shortcut = join(__dirname, 'assets', 'libs', 'keyboardShortcuts.js')

const Url = new URL()
let win, tray, page, child
var THERE_IS_NEW_MESSAGE = false

console.log("Electron " + process.versions.electron + " | Chromium " + process.versions.chrome)

app.on('second-instance', (commandLine, workingDirectory) => {
  if (win) {
    if (win.isMinimized()) {
      win.hide()
    }
    win.show()
  }
})

if (!app.requestSingleInstanceLock()) {
  console.log("Showing first instance...")
  return app.quit()
}

fetch("https://api.github.com/repos/tncga/whats-up-darkness/releases", {
    headers: {
      "user-agent": "Whats-Up-Darkness"
    }
})
.then(res => res.json())
.then(json => json["0"])
.then((latest_version) => {
  if (latest_version.tag_name && compareVersions(latest_version.tag_name, app.getVersion()) === 1) {
    dialog.showMessageBox(win, {type: 'question', buttons: ['OK', 'Cancel'], message: `Do you want to download it?\n\n   Current version: ${app.getVersion()}\n   Latest version: ${latest_version.tag_name}\n\n${latest_version.body}`}, (r) => {
      if (!r) {
        shell.openExternal(latest_version.html_url)
      }
    })
  }
})
.catch(err => console.error(err))

function createWindow() {
  win = new BrowserWindow({
    height: 600,
    width: 800,
    title: "What's up darkness? | tncga",
    icon: Icon,
    // temporary fix for unthemed window while the CSS is injecting
    show: false,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'assets', 'libs', 'preload.js')
    }
  })
  win.setMenu(null)

  win.loadURL("https://web.whatsapp.com/", {
    userAgent: "Mozilla/5.0 (X11; Fedora; Linux x86_64; rv:66.0) Gecko/20100101 Firefox/66.0"
  })

  win.on('closed', function () {
    win = null
  })

  win.on('focus', function () {
    if (THERE_IS_NEW_MESSAGE) {
      win.setIcon(Icon)
      win.flashFrame(false)
      tray.setImage(IconTray)
      THERE_IS_NEW_MESSAGE = false;
    }
  })

  win.on('close', function (e) {
    e.preventDefault()
    win.hide()
  })

  tray = new Tray(IconTray)
  const contextMenu = Menu.buildFromTemplate([{
      label: 'Show',
      click: function() {
        win.hide()
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
          icon: Icon,
          title: "Theme Settings | tncga",
          webPreferences: {
            nodeIntegration: true,
          }
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
      label: 'Clean cache',
      click: function() {
        win.webContents.session.clearStorageData()
        win.reload()
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
  tray.setToolTip("WhatsApp")
  tray.setContextMenu(contextMenu)

  if (process.platform == "linux") {
    tray.on('click', function() {
      win.isVisible() ? win.hide() : win.show()
    })
  } else {
    tray.on('double-click', function() {
      win.isVisible() ? win.hide() : win.show()
    })
  }

  ipcMain.on('notification-triggered', function(e, msg) {
    if (win.isMinimized() || (!win.isFocused() && win.isVisible()) || !win.isVisible()) {
      THERE_IS_NEW_MESSAGE = true;
      tray.setImage(IconFocused)
      win.flashFrame(true)
      win.setIcon(IconFocused)
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

  page.on('dom-ready', function() {
    // insertCSS not working
    // it fails on background styling
    // page.insertCSS(fs.readFileSync(join(__dirname, 'assets', 'css', 'onyx.pure.css'), 'utf8'));
    readFile(Style, "utf-8", (err, data) => {
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
    readFile(Shortcut, "utf-8", (err, data) => {
      if (err) {
        throw err
      } else {
        page.executeJavaScript(data, false, () => {
          console.log("Keyboard shortcuts have been injected via BrowserWindow.webContents.executeJavaScript!")
          win.show()
        })
      }
    })
  })

  page.on('new-window', function(e, url) {
    e.preventDefault();
    url_new = Url.convert(url)
    if (url != url_new && (url_new.indexOf("spotify") > -1 ^ process.platform == "linux")) {
      dialog.showMessageBox(win, {type: 'question', buttons: ['Yes', 'No'], message: 'Do you want to open it Spotify app?'}, (r) => {
        if (!r) {
          shell.openExternal(url_new);
        } else {
          shell.openExternal(url);
        }
      })
    } else {
      shell.openExternal(url);
    }
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
