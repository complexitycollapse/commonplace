import { finalObject } from "@commonplace/core"

export function CssStyle(styles) {
  function css() {
    let result = {};
    
    styles.forEach(style => {
      for(let key of Object.keys(style)) {
        let value = style[key];
        if (value) {
          let mappedKey = mappings[key];
          let newKey = mappedKey ?? key;
          let newValue = calculatePropertyValue(key, mappedKey, value);
          if (Object.prototype.hasOwnProperty.call(result, newKey)) {
            newValue = result[newKey] + " " + newValue;
          }
          result[newKey] = newValue;
        }
      }
    });

    return result;
  }

  function calculatePropertyValue(originalKey, mappedKey, originalValue) {
    if (mappedKey && originalValue === true) {
        return originalKey;
    } else {
      return originalValue;
    }
  }

  return finalObject({}, {
    css
  });
}

let mappings = {
  italic: "fontStyle",
  bold: "fontStyle",
  underline: "textDecoration",
  "line-through": "textDecoration"
};
