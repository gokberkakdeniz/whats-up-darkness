const electron = require("electron").remote
// original code from https://stackoverflow.com/a/12444641/8521693
let map = {}
window.onkeydown = window.onkeyup = function(e){
    e = e || event
    map[e.keyCode] = e.type == 'keydown'

    // CTRL+F
    // Focus "search or start new chat" input
    if (map[17] && map[70]) {
      document.querySelector("._2MSJr").focus()
    }

    // CTRL+Left Arrow
    // Focus contact list
    // Use up and down arrow keys to select contact
    if (map[17] && map[37]) {
      document.querySelector('#pane-side > div').focus()
    }

    // CTRL+Right Arrow
    // Focus chat
    if (map[17] && map[39]) {
      document.querySelector("._2S1VP.copyable-text.selectable-text").focus()
    }

    // CTRL+SHIFT+K
    // Toggle devtool
    if (map[16] && map[17] && map[75]) {
      let win = electron.getCurrentWindow()
      win.isDevToolsOpened() ? win.closeDevTools() : win.openDevTools({
        mode: 'bottom'
      })
    }
}
