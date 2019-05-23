const { create_theme_settings_window } = require("@app_settings/window.js")
const { create_about_window } = require("@app_about")

const create_tray_menu = (args) => {
	var tray = new args.Tray(args.CONSTANTS.IMAGES.TRAY_NORMAL)
	var child = null
	var about = null
	
	const contextMenu = args.Menu.buildFromTemplate([{
			label: 'Show',
			click: function () {
				args.win.hide()
				args.win.show()
			}
		},
		{
			label: 'Toggle developer tools',
			click: function () {
				args.win.isDevToolsOpened() ? args.win.closeDevTools() : args.win.openDevTools({
					mode: 'bottom'
				})
			}
		},
		{
			label: 'Configure theme',
			click: function () {
				for (w of args.BrowserWindow.getAllWindows()) {
					if (w.getTitle() == "Theme Settings") {
						w.focus()
						return;
					}
				}
				child = create_theme_settings_window(args)
			}
		},
		{
			label: 'Reload page',
			click: function () {
				args.win.reload()
			}
		},
		{
			label: 'Clear cache',
			click: function () {
				args.win.webContents.session.clearStorageData()
				args.win.reload()
			}
		},
		{
			label: 'About',
			click: function () {
				args.win.show()
				about = create_about_window(args)
			}
		},
		{
			label: 'Quit',
			click: function () {
				for (w of args.BrowserWindow.getAllWindows()) {
					w.destroy()
				}
			}
		}
	])
	tray.setToolTip("WhatsApp")
	tray.setContextMenu(contextMenu)
	return tray
}

module.exports = {
	create_tray_menu
}