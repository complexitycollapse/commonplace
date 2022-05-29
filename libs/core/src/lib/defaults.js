import { contentMetalinkType, directMetalinkType, Edl, Endset, Link } from "./model";
import { EdlPointer, InlinePointer, LinkPointer, LinkTypePointer } from "./pointers";
import { EdlZettel } from "./zettel";

function contentAttribute(type, attribute, value) {
  return Link(contentMetalinkType,
   Endset(undefined, [LinkTypePointer(type)]),
   Endset("attribute", [InlinePointer(attribute)]),
   Endset("value", [InlinePointer(value)]));
}

function directAttribute(type, attribute, value) {
  return Link(directMetalinkType,
   Endset(undefined, [LinkTypePointer(type)]),
   Endset("attribute", [InlinePointer(attribute)]),
   Endset("value", [InlinePointer(value)]));
}

let defaultsLinks =[
  contentAttribute("bold", "bold", true),
  directAttribute("paragraph", "paragraph", true),
  contentAttribute("italic", "italic", true),
  directAttribute("title", "title", true),
  contentAttribute("underline", "underline", true),
  contentAttribute("strike through", "strike through", true),
  contentAttribute("capitalize", "capitalization", "capitalized"),
  contentAttribute("uppercase", "capitalization", "uppercase"),
  contentAttribute("lowercase", "capitalization", "lowercase"),
  contentAttribute("left aligned text", "text alignment", "left"),
  contentAttribute("right aligned text", "text alignment", "left"),
  contentAttribute("centre aligned text", "text alignment", "center"),
  contentAttribute("justified aligned text", "text alignment", "justify")
];

let defaultsEdl = Edl("defaults", [], defaultsLinks.map(link => LinkPointer("defaults:" + link.type)));

let defaultsPointer = EdlPointer("defaults");

export function DefaultsEdlZettel() {
  return EdlZettel(defaultsPointer, undefined, [], "defaults", defaultsEdl, defaultsLinks, []);
}
