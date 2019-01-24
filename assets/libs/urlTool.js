class URL {
    constructor() {
        this.rules = {
            "^(?:https|http):\/\/open\\.spotify\.com\/track\/(?<track>\\w+)": [["track"], track => "spotify:track:" + track],
            "^(?:https|http):\/\/open\\.spotify\.com\/artist\/(?<artist>\\w+)": [["artist"], artist => "spotify:artist:" + artist],
            "^(?:https|http):\/\/open\\.spotify\.com\/album\/(?<album>\\w+)": [["album"], album => "spotify:album:" + album],
            "^(?:https|http):\/\/open\\.spotify\\.com\/user\/(?<user>\\w+)(?:\\?|$)": [["user"], user => "spotify:user:" + user],
            "^(?:https|http):\/\/open\\.spotify\\.com\/user\/(?<user>\\w+)\/playlist\/(?<playlist>\\w+)(?:\\?|$)": [["user", "playlist"], (user, playlist) => "spotify:user:" + user + ":playlist:" + playlist]
          }
    }

    convert(url) {
        for (const pattern in this.rules) {
            const converter = this.rules[pattern][1];
            const parameter_names = this.rules[pattern][0];
            const regex = new RegExp(pattern)
            let matches = url.match(regex)
            if(matches) {
                const parameters = parameter_names.map(name => matches.groups[name])
                return converter.bind.apply(converter, [null].concat(Array.prototype.slice.call(parameters)))()
            } else {
                return url
            }
        }
    }
}

module.exports = { URL }