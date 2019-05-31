/* eslint-disable newline-per-chained-call */

const { execSync } = require('child_process');
const FIREFOX_VERSION = require("@root/package.json").constants.userAgentFirefoxVersion

const get_user_agent = () => {
    const OS_ARCH = process.arch == "x64" ? "x86_64" : "i686"
    switch(process.platform) {
        case "win32":
            return "Mozilla/5.0 (Windows NT 10.0; Win64; rv:" + FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + FIREFOX_VERSION
        case "linux":
            try {
                const DISTO = execSync("cat /etc/os-release | head -n 1 | sed 's/NAME=//g'").toString().replace("\n", "")
                return "Mozilla/5.0 (X11; " + DISTO + "; Linux " + OS_ARCH + "; rv:" + FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + FIREFOX_VERSION
            } catch(err) {
                return "Mozilla/5.0 (X11; Linux " + OS_ARCH + "; rv:" + FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + FIREFOX_VERSION
            }
        case "darwin":
            return "Mozilla/5.0 (Macintosh;; rv:" + FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + FIREFOX_VERSION
        default:
            return "Mozilla/5.0 (Linux x86_64; rv:" + FIREFOX_VERSION + ") Gecko/20100101 Firefox/" + FIREFOX_VERSION
    }
}

module.exports = { get_user_agent }