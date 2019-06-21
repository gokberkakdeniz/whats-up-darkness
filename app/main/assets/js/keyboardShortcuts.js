/* eslint-disable no-multi-assign */
const electron = require("electron").remote

// Original code from https://stackoverflow.com/a/12444641/8521693
const map = {}
window.onkeydown = window.onkeyup = function (event) {
    console.log(map)
    map[event.keyCode] = event.type == 'keydown'

    /*
     * CTRL+F
     * Focus "search or start new chat" input
     */
    if (map[17] && map[70]) {
        document.querySelector("._2zCfw").focus()
    }

    /*
     * CTRL+Right Arrow
     * Focus chat
     */
    if (map[17] && map[39]) {
        document.querySelector("._3u328.copyable-text.selectable-text").focus()
    }

    /*
     * CTRL+SHIFT+K
     * Toggle devtool
     */
    if (map[16] && map[17] && map[75]) {
        const win = electron.getCurrentWindow()
        if (win.isDevToolsOpened()) {
            win.closeDevTools()
        } else {
            win.openDevTools({
                mode: 'bottom'
            })
        }
    }
}