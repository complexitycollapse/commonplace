import { compoundingStyleDecorator } from "./style-decorator";

function listStyleDecorator(cssMap, target) {
  if (target.markup.get("list") !== "true" && target.markup.get("list item") !== "true") {
    return cssMap;
  }

  let listMarker = target.markup.get("list marker") ?? "bullets";
  let listStyleType;

  if (listMarker === "bullets") { listStyleType = "disc"; }
  else if (listMarker === "numbers") { listStyleType = "numeric"; }
  else if (listMarker === "none") { listStyleType = "none"; }

  if (listStyleType) { cssMap.set("listStyleType", listStyleType); }

  return cssMap;
}

export const decorators = [
  compoundingStyleDecorator("bold", "fontWeight", "bold"),
  compoundingStyleDecorator("italic", "fontStyle", "italic"),
  compoundingStyleDecorator("underline", "textDecoration", "underline"),
  compoundingStyleDecorator("overline", "textDecoration", "overline"),
  compoundingStyleDecorator("strike through", "textDecoration", "line-through"),
  compoundingStyleDecorator("upper case", "textTransform", "uppercase"),
  compoundingStyleDecorator("lower case", "textTransform", "lowercase"),
  compoundingStyleDecorator("capitalize", "textTransform", "capitalize"),
  compoundingStyleDecorator("text align", "textAlign"),
  compoundingStyleDecorator("colour", "color"),
  compoundingStyleDecorator("color", "color"),
  compoundingStyleDecorator("background colour", "backgroundColor"),
  compoundingStyleDecorator("background color", "backgroundColor"),
  compoundingStyleDecorator("layout mode", "display"),
  compoundingStyleDecorator("font size", "fontSize"),
  listStyleDecorator
];
