import { finalObject } from "@commonplace/core"

export function CssStyle(attributes) {
  let styles = new Map(), fragmentTags = [];

  function calculate() {
    for(let [key, value] of attributes.entries()) {
      let [newKey, newValue] = mapEntry(key, value);
      if (newValue) {
        if (styles.has(newKey)) {
          newValue = styles.get(newKey) + " " + newValue;
        }
        styles.set(newKey, newValue);
      }
      let nextFragmentTag = getFragmentTag(key, value);
      if (nextFragmentTag) fragmentTags.push(nextFragmentTag);
    };
  }

  calculate();

  return finalObject({}, {
    css: () => Object.fromEntries(styles),
    fragmentTags: () => fragmentTags
  });
}

function mapEntry(key, value) {
  switch (key) {
    case "bold":
      if (value) { return ["fontStyle", "bold"]; }
      break;
    case "italic":
      if (value) { return ["fontStyle", "italic"]; }
      break;
    case "underline":
      if (value) { return ["textDecoration", "underline"]; }
      break;
    case "strike through":
      if (value) { return ["textDecoration", "line-through"]; }
      break;
    case "capitalization":
      return ["textTransform", value];
    case "left aligned text":
      return ["textAlign", "left"];
    case "right aligned text":
      return ["textAlign", "right"];
    case "centre aligned text":
      return ["textAlign", "center"];
    case "justified text":
      return ["textAlign", "justify"];
  }

  return [key, value];
}

function getFragmentTag(key, value) {
  if (!value) { return undefined; }

  switch (key) {
    case "paragraph":
      return "p";
    case "title":
      return "h1";
  }
}
