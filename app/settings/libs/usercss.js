/* eslint-disable prefer-named-capture-group */
/* eslint-disable require-unicode-regexp */
const {parse, stringify} = require('usercss-meta')

/* 
 * UserCSS to Pure CSS
 * string convert_to_css
 * string style
 * object vars (if it is blank, function will use default values) 
 */
const convert_to_css = (style, vars) => {
    // Get css style part
    const RX_DOCUMENT = /@-moz-document.*{([\S\s]{0,})}/
    const [, css_part] = RX_DOCUMENT.exec(style)

    // Get default values
    if (!vars) {
        const vars = {}
        const meta_vars = parse(style).vars
        for (const val in Reflect.ownKeys(meta_vars)) {
            if (meta_vars[val].options === null) {
                vars[val] = meta_vars[val].default
            } else {
                const def_opt = meta_vars[val].options.filter((obj) => obj.name == meta_vars[val].default)[0].value
                vars[val] = def_opt
            }
        }
    }
    // Change placeholders recursively
    let pure_css = css_part;
    while (pure_css.match(/\/\*\[\[([\w-]+)\]\]\*\//g) !== null) {
        pure_css = pure_css.replace(/\/\*\[\[([\w-]+)\]\]\*\//g, (_match, group) => vars[group])
    }

    return pure_css
}

module.exports = {
    meta: {
        parse,
        stringify
    },
    convert_to_css
}