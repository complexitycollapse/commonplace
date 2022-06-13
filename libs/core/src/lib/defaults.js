import { contentMetalinkType, directMetalinkType, Edl, Link } from "./model";
import { EdlPointer, EdlTypePointer, InlinePointer, LinkPointer, LinkTypePointer, PointerTypePointer } from "./pointers";
import { EdlZettel } from "./zettel";

function contentAttribute(type, attribute, value) {
  return Link(contentMetalinkType,
   [undefined, [LinkTypePointer(type)]],
   ["attribute", [InlinePointer(attribute)]],
   ["value", [InlinePointer(value)]]);
}

function directAttribute(type, attribute, value) {
  return Link(directMetalinkType,
   [undefined, [LinkTypePointer(type)]],
   ["attribute", [InlinePointer(attribute)]],
   ["value", [InlinePointer(value)]]);
}

let defaultsLinks = [
  contentAttribute("bold", "bold", true),
  directAttribute("paragraph", "paragraph", true),
  contentAttribute("italic", "italic", true),
  directAttribute("title", "title", true),
  contentAttribute("underline", "underline", true),
  contentAttribute("strike through", "strike through", true),
  contentAttribute("capitalize", "capitalization", "capitalize"),
  contentAttribute("uppercase", "capitalization", "uppercase"),
  contentAttribute("lowercase", "capitalization", "lowercase"),
  contentAttribute("left aligned text", "text align", "left"),
  contentAttribute("right aligned text", "text align", "right"),
  contentAttribute("centre aligned text", "text align", "center"),
  contentAttribute("justified aligned text", "text align", "justify"),
  contentAttribute("red", "colour", "red"),
  contentAttribute("inline", "layout mode", "inline"),
  directAttribute("block", "layout mode", "block"),
  directAttribute("break", "break", true),
  Link("inline", [undefined, [PointerTypePointer("span")]]),
  Link("block", [undefined, [EdlTypePointer("paragraph")]])
];

let defaultsEdl = Edl("defaults", [], defaultsLinks.map(link => LinkPointer("defaults:" + link.type)));

let defaultsPointer = EdlPointer("defaults");

export function DefaultsEdlZettel() {
  return EdlZettel(defaultsPointer, undefined, [], "defaults", defaultsEdl, defaultsLinks, []);
}
