const {app, BrowserWindow, shell, ipcMain, Tray, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const appIcon = path.join(__dirname, 'icon_normal.png')

function createWindow() {
  win = new BrowserWindow({
    height: 600,
    width: 800,
    title: "What's up darkness? | tncga",
	//frame: false,
    icon: appIcon,
    webPreferences: {
      preload: path.resolve(__dirname, 'notification.js')
    }
  })
  win.setMenu(null)

  ipcMain.on('notification-shim', (e, msg) => {
    if (win.isMinimized()) {
      win.flashFrame(true)
      win.setIcon(path.join(__dirname, 'icon_focused.png'))
    }
  })

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
}

app.on('ready', () => {
  createWindow()

  let tray  = new Tray(appIcon)
  const contextMenu = Menu.buildFromTemplate([
  {
	  label: 'Show',
	  click: () => {
		  win.show()
	  }
  },
  {
	  label: 'Quit',
	  click: () => {
		  win.destroy()
	  }
  }
  ])
  tray.setToolTip("What's up darkness? | tncga")
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    win.isVisible() ? win.hide() : win.show()
  })

  const page = win.webContents;

  page.on('dom-ready', () => {
    page.insertCSS(fs.readFileSync(path.join(__dirname, 'dark.css'), 'utf8'));
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
