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

function displayDecorator(cssMap, target) {
  if (target.isRootBox) {
    cssMap.set("display", "block");
    return cssMap;
  }

  let layoutLevel = target.markup.get("layout level") ?? "inline";
  let layoutDirection = target.markup.get("layout direction") ?? "vertical";

  if (target.markup.get("box") !== "true") {
    cssMap.set("display", layoutLevel);
  } else if (layoutDirection === "vertical") {
    cssMap.set("display", layoutLevel);
  } else if (layoutDirection === "horizontal") {
    cssMap.set("display", layoutLevel === "block" ? "flex" : "inline-flex");
    cssMap.set("flexDirection", "row");
    cssMap.set("gap", "0.5em");
  }

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
  displayDecorator,
  compoundingStyleDecorator("font size", "fontSize"),
  listStyleDecorator
];
