require("module-alias/register")
const https = require("https");

const URL = "https://api.github.com/repos/tncga/whats-up-darkness/releases"
const USER_AGENT = "Whats-Up-Darkness"
const CONSTANTS = require("@constants")

const check_new_version = (args, callback_uptodate, callback_yes, callback_no) => {
    if(CONSTANTS.ELECTRON_IS_DEV) {
        callback_uptodate()
        return
    }

    console.log("[LOG] checking new version...")
    https.get(URL, {
        headers: {
            "User-Agent": USER_AGENT
        }
    }, (res) => {
        let data = ""

        res.on("data", (chunk) => {
            data += chunk
        })

        res.on("end", () => {
            const latest = JSON.parse(data)[0]
            if (latest.tag_name && is_less(CONSTANTS.APP_VERSION).than(latest.tag_name)) {
                console.log("[LOG] there is a new version of app.")
                console.log("[LOG] new version is '" + latest.tag_name +"'.")
                args.dialog.showMessageBox(null, {
                    title: "Do you want to download the new version?",
                    type: "question",
                    icon: CONSTANTS.IMAGES.APP,
                    buttons: ["OK", "Cancel"],
                    message: `Current version: ${CONSTANTS.APP_VERSION}\nLatest version: ${latest.tag_name}\n\n${latest.body}`
                }, (r) => {
                    if (!r) {
                        console.log("[LOG] opening download url in browser...")
                        args.shell.openExternal(latest.html_url)
                        callback_yes()
                    } else {
                        callback_no()
                    }
                })
            } else {
                console.log("[LOG] app is up-to-date.")
                callback_uptodate()
            }
        })
    }).on("error", (err) => {
        console.error("[ERROR]" + err.message)
        callback_no()
    })
}

const is_less = (current_version) => {
    return {
        than: function(compared) {
            current_version_int = Number.parseInt(current_version.replace(/[^\d]/g, ""))
            compared_int = Number.parseInt(compared.replace(/[^\d]/g, ""))
            return current_version < compared
        }
    }
}

module.exports = { is_less, check_new_version }