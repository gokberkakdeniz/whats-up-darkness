const fetch = require('node-fetch')
const {versionCompare} = require('./version.js');
const {version} = require('./../../package.json')
const tar = require('tar')

async function Update(dialog) {
    try {
        const response = await fetch("https://api.github.com/repos/tncga/whats-up-darkness/releases", {
            headers: {
                "user-agent": "Whats-Up-Darkness"
            }
        })
        const data = await response.json()
        const latest_version = data["0"]
        const version_compared = versionCompare(version, latest_version.tag_name)
        if (version_compared === 2) {
            await Patch(latest_version.tarball_url)
            return 2
        } else if (version_compared === 1) {
            dialog(version, latest_version.tag_name, latest_version.body, latest_version.html_url)
            return 1
        } else {
            return version_compared
        }
    } catch (error) {
        console.error(error)
        return -2
    }
}

async function Patch(url) {
    try {
        const response = await fetch(url, {
            headers: {
                "user-agent": "Whats-Up-Darkness"
            }
        })
    
        await response.body.pipe(tar.x({
            strip: 1,
            C: "resources\\app"
        }))
        return True
    } catch (error) {
        console.error(error)
        return False
    }
}

module.exports = {Update}