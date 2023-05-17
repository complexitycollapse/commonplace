import { compoundingStyleDecorator } from "./style-decorator";

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
  compoundingStyleDecorator("font size", "fontSize")
];
