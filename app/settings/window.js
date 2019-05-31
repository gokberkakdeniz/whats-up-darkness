const { join } = require("path")

const create_theme_settings_window = (args) => {
    const win = new args.BrowserWindow({
        parent: args.win,
        width: 400,
        height: 800,
        maximizable: false,
        resizable: false,
        icon: args.CONSTANTS.IMAGES.APP,
        title: "Theme Settings",
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true
        }
    })
    win.setMenu(null)
    win.loadFile(join(__dirname, 'assets', 'html', 'menu.html'))
    win.webContents.on('will-navigate', function (event, url) {
        event.preventDefault();
        args.shell.openExternal(url);
    })
    return win;
}

module.exports = { create_theme_settings_window }