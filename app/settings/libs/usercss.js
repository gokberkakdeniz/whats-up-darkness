const {parse, stringify} = require('usercss-meta')

// string convert_to_css
// string style
// object vars (if it is blank, function will use default values)
const convert_to_css = (style, vars = false) => {
  //get css style part
  const RX_DOCUMENT = /@-moz-document.*{([\S\s]{0,})}/
  let css_part = RX_DOCUMENT.exec(style)[1]

  //get default values
  if (vars == false) {
    var vars = {}
    const meta_vars = parse(style).vars
    for (var v in meta_vars) {
      if (meta_vars.hasOwnProperty(v)) {
        if (meta_vars[v].options == null) {
          vars[v] = meta_vars[v].default
        } else {
          let def_opt = meta_vars[v].options.filter(o => o.name == meta_vars[v].default)[0].value
          vars[v] = def_opt
        }
      }
    }
  }

  //change placeholders recursively
  let pure_css = css_part;
  while (pure_css.match(/\/\*\[\[([\w-]+)\]\]\*\//g) != null) {
    pure_css = pure_css.replace(/\/\*\[\[([\w-]+)\]\]\*\//g, (match, group) => {
      return vars[group]
    })
  }
  
  return pure_css
}

module.exports = {meta: {parse, stringify}, convert_to_css}
