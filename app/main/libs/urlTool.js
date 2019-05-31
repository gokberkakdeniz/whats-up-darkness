/* eslint-disable require-jsdoc */

/* 
 * Unfortunely, Spotify for Linux client has some bugs. Any URI redirected from web browser will spawn new Spotify window with home page.
 * Despite that, it can be achieved, except spawning new window, by executing command: 
 * spotify --option=argument.spotify --uri=spotify:album:3syPhP5MaecyRbU08xVMbE
 */
const rules = {
    "^(?:https|http)://open\\.spotify\\.com/track/(?<track>\\w+)": [
        ["track"],
        (args) => "spotify:track:" + args.track
    ],
    "^(?:https|http)://open\\.spotify\\.com/artist/(?<artist>\\w+)": [
        ["artist"],
        (args) => "spotify:artist:" + args.artist
    ],
    "^(?:https|http)://open\\.spotify\\.com/album/(?<album>\\w+)": [
        ["album"],
        (args) => "spotify:album:" + args.album
    ],
    "^(?:https|http)://open\\.spotify\\.com/user/(?<user>\\w+)": [
        ["user"],
        (args) => "spotify:user:" + args.user
    ],
    "^(?:https|http)://open\\.spotify\\.com/user/(?<user>\\w+)/playlist/(?<playlist>\\w+)": [
        [
            "user",
            "playlist"
        ],
        (args) => "spotify:user:" + args.user + ":playlist:" + args.playlist
    ]
}

const convert_url = (url) => {
    for (const pattern of Reflect.ownKeys(rules)) {
        const [, converter] = rules[pattern];
        const [parameter_keys] = rules[pattern];
        const regex = new RegExp(pattern, "u")
        const matches = url.match(regex)
        if (matches) {
            const parameters = parameter_keys.reduce((obj, name) => (
                { 
                    ...obj, 
                    [name]: matches.groups[name]
                }
            ), {})

            return converter(parameters)
        }
    }
    return url
}

module.exports = { convert_url }