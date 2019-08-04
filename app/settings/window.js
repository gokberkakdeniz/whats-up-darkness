const { shell, BrowserWindow } = require("electron")
const { join } = require("path")

module.exports = ({ parentWindow, appIcon }) => {
    const settingsWindow = new BrowserWindow({
        parent: parentWindow,
        width: 400,
        height: 800,
        maximizable: false,
        resizable: false,
        icon: appIcon,
        title: "Theme Settings",
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true
        }
    })
    
    settingsWindow.setMenu(null)
    settingsWindow.loadFile(join(__dirname, 'assets', 'html', 'menu.html'))
    
    settingsWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    })

    return settingsWindow
}
