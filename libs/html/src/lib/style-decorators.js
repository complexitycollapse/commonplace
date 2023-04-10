import { compoundingStyleDecorator } from "./style-decorator";

export const decorators = [
  compoundingStyleDecorator("bold", "fontWeight", "bold"),
  compoundingStyleDecorator("italic", "fontStyle", "italic"),
  compoundingStyleDecorator("underline", "textDecoration", "underline"),
  compoundingStyleDecorator("overline", "textDecoration", "overline"),
  compoundingStyleDecorator("strike through", "textDecoration", "line-through"),
  compoundingStyleDecorator("capitalization", "textTransform"),
  compoundingStyleDecorator("text align", "textAlign"),
  compoundingStyleDecorator("colour", "color"),
  compoundingStyleDecorator("background colour", "backgroundColor"),
  compoundingStyleDecorator("layout mode", "display")
];
