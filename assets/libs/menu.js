const {writeFile, readFileSync} = require('fs')
const {join, basename} = require('path');
const {ipcRenderer} = require('electron')
const usercss = require('../libs/usercss.js')

class usercss_theme {
  //string style_file = "theme_name.user.css"
  constructor(style_file) {
    try {
      this.style = readFileSync(style_file, "utf8")
      this.file_name = basename(style_file, ".user.css")
      this.style_meta = usercss.meta.parse(this.style)
    } catch(e) {
      throw e
    }
  }
  get meta_name() {
    return this.style_meta.name
  }
  get meta_homepageURL() {
    return this.style_meta.homepageURL
  }
  get meta_version() {
    return this.style_meta.version
  }
  get meta_author() {
    return this.style_meta.author
  }
  generate_html(use_default_values = false) {
    function generate_element(options) {
      let setContainer = document.createElement("div")
      setContainer.className = "setting-container"
      let setName = document.createElement("div")
      setName.className = "setting-name"
      let setName_span = document.createElement("span")
      let setName_text = document.createTextNode(options.label)
      setName_span.appendChild(setName_text)
      setName.appendChild(setName_span)

      let setInput = document.createElement("div")
      setInput.className = "setting-input"
      let setInput_input

      switch (options.type) {
        case "text":
          setInput_input = document.createElement("input")
          setInput_input.id = options.id
          setInput_input.value = options.defaults ? options.defaults[options.id] : options.value
          break;
        case "color":
          setInput_input = document.createElement("input")
          setInput_input.id = options.id
          setInput_input.value = options.defaults ? options.defaults[options.id] : options.value
          setInput_input.className = "color"
          break;
        case "dropdown":
          setInput_input = document.createElement("select")
          setInput_input.id = options.id
          for (var opt of options.options) {
            let option = document.createElement("option")
            option.value = opt.name
            if (!options.defaults && options.value == opt.name) option.setAttribute("selected", "")
            if (options.defaults && options.defaults[options.id] == opt.name) option.setAttribute("selected", "")
            let option_label = document.createTextNode(opt.label)
            option.appendChild(option_label)
            setInput_input.appendChild(option)
          }
          break;
        case "checkbox":
          setInput_input = document.createElement("input")
          setInput_input.id = options.id
          setInput_input.type = "checkbox"
          if (!options.defaults && options.value) setInput_color.setAttribute("checked", "")
          if (options.defaults && options.defaults[options.id] == options.value) setInput_color.setAttribute("checked", "")
          break;
        default:
          setInput_input = document.createTextNode("Unknown type: " + options.type)
          break;
      }

      setInput.appendChild(setInput_input)
      setContainer.appendChild(setName)
      setContainer.appendChild(setInput)

      return document.querySelector("main").appendChild(setContainer)
    }

    const vars = this.style_meta.vars
    let saved_values = undefined
    try {
      const saved_values_json = readFileSync(join(__dirname, "..", "json", this.file_name + ".settings.json"), "utf8")
      saved_values = JSON.parse(saved_values_json)
    } catch(e) {
      console.log(e)
    } finally {
      for (var v in vars) {
        if (vars.hasOwnProperty(v)) {
          var x = generate_element({
            type: vars[v].type,
            id: vars[v].name,
            label: vars[v].label,
            value: vars[v].default,
            options: vars[v].options,
            defaults: use_default_values ? undefined : saved_values
          })
        }
      }
      var colors = jsColorPicker('main input.color', {
          customBG: '#222',
          readOnly: false,
          init: function(elm, colors) { // colors is a different instance (not connected to colorPicker)
            elm.style.backgroundColor = elm.value;
            elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
          }
      })
    }
  }
  gather_values() {
    const inputs = document.getElementsByClassName("setting-input")
    let vars_style = {}
    let vars_setting = {}
    for (let i of inputs) {
      vars_setting[i.firstElementChild.id] = i.firstElementChild.value

      if (i.firstElementChild.type == "select-one") {
        vars_style[i.firstElementChild.id] = this.style_meta.vars[i.firstElementChild.id].options.filter(o => o.name == i.firstElementChild.value)[0].value
      } else {
        vars_style[i.firstElementChild.id] = i.firstElementChild.value
      }
    }
    return {style: vars_style, settings: vars_setting}
  }
  pure_css(vars) {
    return usercss.convert_to_css(this.style, vars)
  }
}

const onyx = new usercss_theme(join(__dirname, "..", "css", "onyx.user.css"))

window.onload = function() {
  document.getElementById("meta-name").innerHTML = `<a href="${onyx.meta_homepageURL}">${onyx.meta_name.substring(0,21)}</a>`
  document.getElementById("meta-version").innerHTML = onyx.meta_version
  document.getElementById("meta-author").innerHTML = onyx.meta_author
  onyx.generate_html()
}

function settings_save() {
  const usercss_values = onyx.gather_values()
  writeFile(join(__dirname, "..", "json", onyx.file_name + ".settings.json"), JSON.stringify(usercss_values.settings), "utf8", (err) => {
    if (err) throw err
  })

  const pure_css = onyx.pure_css(usercss_values.style)
  writeFile(join(__dirname, "..", "css", onyx.file_name + ".pure.css"), pure_css, "utf8", (err) => {
    if (err) throw err
  })

  ipcRenderer.send("update-theme", pure_css)
}

function settings_reset() {
  document.querySelector("main").innerHTML = ""
  onyx.generate_html(true)
  settings_save()
}

function toggle_devtool() {
  ipcRenderer.send('toggle-devtool')
}

function toggle(id) {
  var e = document.getElementById(id)
  if (e.style.display == '' || e.style.display == 'none') {
    e.style.display = 'block';
    document.querySelector('main').style["padding-top"]="85px";
  } else {
    e.style.display = 'none';
    document.querySelector('main').style["padding-top"]="52px";
  }
}

function toggle_live_save() {
  const reload = document.getElementById("live_save").checked
  // input_listener = (j) => {
    // j.srcElement.value, j.srcElement.id
  // }
  if (reload) {
    document.querySelectorAll(".setting-input > *").forEach(i => i.addEventListener("change", settings_save))
  } else {
    document.querySelectorAll(".setting-input > *").forEach(i => i.removeEventListener("change", settings_save))
  }
}
