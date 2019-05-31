/* eslint-disable no-unused-vars */
/* eslint-disable no-catch-shadow */
/* eslint-disable new-cap */
/* eslint-disable no-alert */
/* eslint-disable require-jsdoc */

require('module-alias/register')
const { writeFile, readFileSync } = require('fs')
const { basename } = require('path');
const { ipcRenderer } = require('electron')
const { get } = require('https')
const { is_less } = require('@app_updater')
const usercss = require('@app_settings/libs/usercss.js')
const CONSTANTS = require("@constants")

let onyx = null

class usercss_theme {
    // String style_file = "theme_name.user.css"
    constructor(style_file) {
        this.style = readFileSync(style_file, "utf8")
        this.file_name = basename(style_file, ".user.css")
        this.style_meta = usercss.meta.parse(this.style).metadata
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
        const generate_element = (options) => {
            const setContainer = document.createElement("div")
            setContainer.className = "setting-container"
            const setName = document.createElement("div")
            setName.className = "setting-name"
            const setName_span = document.createElement("span")
            const setName_text = document.createTextNode(options.label)
            setName_span.appendChild(setName_text)
            setName.appendChild(setName_span)

            const setInput = document.createElement("div")
            setInput.className = "setting-input"
            let setInput_input = null;

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
                case "select":
                case "dropdown":
                    setInput_input = document.createElement("select")
                    setInput_input.id = options.id
                    for (const opt of options.options) {
                        const option = document.createElement("option")
                        option.value = opt.name
                        if (!options.defaults && options.value == opt.name) option.setAttribute("selected", "")
                        if (options.defaults && options.defaults[options.id] == opt.name) option.setAttribute("selected", "")
                        const option_label = document.createTextNode(opt.label)
                        option.appendChild(option_label)
                        setInput_input.appendChild(option)
                    }
                    break;
                case "checkbox":
                    setInput_input = document.createElement("input")
                    setInput_input.id = options.id
                    setInput_input.type = "checkbox"
                    if (!options.defaults && options.value) setInput_input.setAttribute("checked", "")
                    if (options.defaults && options.defaults[options.id] == options.value) setInput_input.setAttribute("checked", "")
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

        const {vars} = this.style_meta
        let saved_values = null;
        try {
            const saved_values_json = readFileSync(CONSTANTS.USER_DATA.THEME_SETTINGS, "utf8")
            saved_values = JSON.parse(saved_values_json)
        } catch (err) {
            console.log(err)
        } finally {
            for (const val of Object.values(vars)) {
                generate_element({
                    type: val.type,
                    id: val.name,
                    label: val.label,
                    value: val.default,
                    options: val.options,
                    defaults: use_default_values ? null : saved_values
                })
            }

            // eslint-disable-next-line no-undef
            jsColorPicker('main input.color', {
                customBG: '#222',
                readOnly: false,
                // Colors is a different instance (not connected to colorPicker)
                init (elm, colors) {
                    elm.style.backgroundColor = elm.value;
                    elm.style.color = colors.rgbaMixCustom.luminance > 0.22 ? '#222' : '#ddd';
                }
            })
        }
    }
    
    gather_values() {
        const inputs = document.getElementsByClassName("setting-input")
        const vars_style = {}
        const vars_setting = {}
        for (const inp of inputs) {
            vars_setting[inp.firstElementChild.id] = inp.firstElementChild.value

            if (inp.firstElementChild.type == "select-one") {
                vars_style[inp.firstElementChild.id] = this.style_meta.vars[inp.firstElementChild.id].options.filter((obj) => obj.name == inp.firstElementChild.value)[0].value
            } else {
                vars_style[inp.firstElementChild.id] = inp.firstElementChild.value
            }
        }
        return {
            style: vars_style,
            settings: vars_setting
        }
    }

    pure_css(vars) {
        return usercss.convert_to_css(this.style, vars)
    }
}

const update_theme = (theme, callback_yes, callback_no) => {
    get({
        hostname: "api.github.com",
        path: "/repos/vednoc/onyx/releases",
        headers: {
            "user-agent": "Whats-Up-Darkness"
        }
    }, (res) => {
        let data = ""
        let err = null

        if (res.statusCode !== 200) {
            err = new Error(`Cannot retrieve theme version data (Status Code: ${res.statusCode}).`)
        } else if (!(/^application\/json/u).test(res.headers['content-type'])) {
            err = new Error(`Expected application/json but received ${res.headers['content-type']}.`)
        }

        if (err) {
            alert(err.message)
            res.resume()
            callback_no()
            return
        }

        res.setEncoding("utf8")
        res.on("data", (chunk) => data += chunk)
        res.on("end", () => {
            try {
                const [last_version] = JSON.parse(data)
                if (is_less(theme.meta_version).than(last_version.tag_name) && confirm(`Do you want to update?\n\n   Current version: ${theme.meta_version}\n   Latest version: ${last_version.tag_name}\n\n${last_version.body}`)) {
                    get("https://raw.githubusercontent.com/vednoc/onyx/" + last_version.tag_name + "/WhatsApp.user.css", (res) => {
                        let css = ""

                        if (res.statusCode !== 200) {
                            alert(`Cannot retrieve theme version data (Status Code: ${res.statusCode}).`)
                            res.resume()
                            callback_no()
                            return
                        }

                        res.setEncoding("utf8")
                        res.on("data", (char) => css += char)
                        res.on("end", () => {
                            try {
                                writeFile(CONSTANTS.USER_DATA.USER_CSS, css, "utf8", (err) => {
                                    if (err) throw err
                                    onyx = new usercss_theme(CONSTANTS.USER_DATA.USER_CSS)
                                    callback_yes()
                                })
                            } catch (err) {
                                alert(err.message)
                                callback_no()
                            }
                        }).on("error", (err) => {
                            alert(err.message)
                            callback_no()
                        })
                    })
                } else {
                    callback_no()
                }
            } catch (err) {
                alert(err.message)
                callback_no()
            }
        }).on("error", (err) => {
            alert(err.message)
            callback_no()
        })
    })
}

onyx = new usercss_theme(CONSTANTS.USER_DATA.USER_CSS)

const settings_save = () => {
    const usercss_values = onyx.gather_values()
    writeFile(CONSTANTS.USER_DATA.THEME_SETTINGS, JSON.stringify(usercss_values.settings), "utf8", (err) => {
        if (err) throw err
    })

    const pure_css = onyx.pure_css(usercss_values.style)
    writeFile(CONSTANTS.USER_DATA.PURE_CSS, pure_css, "utf8", (err) => {
        if (err) throw err
    })

    ipcRenderer.send("update-theme", pure_css)
}

const settings_reset = () => {
    document.querySelector("main").innerHTML = ""
    onyx.generate_html(true)
    settings_save()
}

const toggle_devtool = () => ipcRenderer.send('toggle-devtool')

const toggle = (id) => {
    const el = document.getElementById(id)
    if (el.style.display == '' || el.style.display == 'none') {
        el.style.display = 'block';
        document.querySelector('main').style["padding-top"] = "85px";
    } else {
        el.style.display = 'none';
        document.querySelector('main').style["padding-top"] = "52px";
    }
}

const toggle_live_save = () => {
    const reload = document.getElementById("live_save").checked
    if (reload) {
        document.querySelectorAll(".setting-input > *").forEach((el) => el.addEventListener("change", settings_save))
    } else {
        document.querySelectorAll(".setting-input > *").forEach((el) => el.removeEventListener("change", settings_save))
    }
}

window.onload = function () {
    update_theme(onyx, () => {
        document.getElementById("meta-name").innerHTML = `<a href="${onyx.meta_homepageURL}">${onyx.meta_name.substring(0, 21)}</a>`
        document.getElementById("meta-version").innerHTML = onyx.meta_version
        document.getElementById("meta-author").innerHTML = onyx.meta_author
        onyx.generate_html()
        settings_save()
    }, () => {
        document.getElementById("meta-name").innerHTML = `<a href="${onyx.meta_homepageURL}">${onyx.meta_name.substring(0, 21)}</a>`
        document.getElementById("meta-version").innerHTML = onyx.meta_version
        document.getElementById("meta-author").innerHTML = onyx.meta_author
        onyx.generate_html()
    })
}