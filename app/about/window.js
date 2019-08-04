const { shell, BrowserWindow } = require("electron")
const { join } = require("path")

module.exports = ({ parentWindow, appIcon }) => {
    const aboutWindow = new BrowserWindow({
        parent: parentWindow,
        width: 450,
        height: 325,
        maximizable: false,
        resizable: false,
        modal: true,
        icon: appIcon,
        title: "About",
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true
        }
    })

    aboutWindow.setMenu(null)
    aboutWindow.loadFile(join(__dirname, 'assets', 'html', 'about.html'))
    aboutWindow.webContents.on('will-navigate', (event, url) => {
        event.preventDefault()
        shell.openExternal(url)
    })
    
    return aboutWindow
}