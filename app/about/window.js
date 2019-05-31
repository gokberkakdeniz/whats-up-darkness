const { join } = require("path")

const create_about_window = (args) => {
    const win = new args.BrowserWindow({
        parent: args.win,
        width: 450,
        height: 325,
        maximizable: false,
        resizable: false,
        modal: true,
        icon: args.CONSTANTS.IMAGES.APP,
        title: "About",
        webPreferences: {
            backgroundColor: '#272C35',
            nodeIntegration: true
        }
    })
    win.setMenu(null)
    win.loadFile(join(__dirname, 'assets', 'html', 'about.html'))
    win.webContents.on('will-navigate', function (event, url) {
        event.preventDefault();
        args.shell.openExternal(url);
    })
    return win;
}

module.exports = { create_about_window }