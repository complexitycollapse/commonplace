import { contentMetalinkType, directMetalinkType, Edl, Link } from "./model";
import { EdlPointer, EdlTypePointer, InlinePointer, LinkPointer, LinkTypePointer, PointerTypePointer } from "./pointers";
import { EdlZettel } from "./zettel";

function makeEnds(types, attribute, value, hasValueEnd, valueEnd) {
  if (!Array.isArray(types)) { types = [types]; }
  let ends = [...types.map(type => [undefined, [LinkTypePointer(type)]]), ["attribute", [InlinePointer(attribute)]]];
  if (value !== undefined) {
    ends.push(["value", [InlinePointer(value)]]);
  }

  if (hasValueEnd) {
    ends.push(["value end", [InlinePointer(valueEnd)]]);
  }

  return ends;
}

function contentAttribute(type, attribute, value, hasValueEnd, valueEnd) {
  let ends = makeEnds(type, attribute, value, hasValueEnd, valueEnd);
  return Link(contentMetalinkType, ...ends);
}

function directAttribute(type, attribute, value, hasValueEnd, valueEnd) {
  let ends = makeEnds(type, attribute, value, hasValueEnd, valueEnd);
  return Link(directMetalinkType, ...ends);
}

let defaultsLinks = [
  contentAttribute("bold", "bold", true),
  directAttribute("paragraph", "paragraph", true),
  contentAttribute("italic", "italic", true),
  directAttribute("title", "title", true),
  contentAttribute("underline", "underline", true),
  contentAttribute("overline", "overline", true),
  contentAttribute("strike through", "strike through", true),
  contentAttribute("capitalize", "capitalization", "capitalize"),
  contentAttribute("uppercase", "capitalization", "uppercase"),
  contentAttribute("lowercase", "capitalization", "lowercase"),
  contentAttribute("left aligned text", "text align", "left"),
  contentAttribute("right aligned text", "text align", "right"),
  contentAttribute("centre aligned text", "text align", "center"),
  contentAttribute("justified aligned text", "text align", "justify"),
  contentAttribute(["colour", "color"], "colour", undefined, true, "value"),
  contentAttribute(["background colour", "background color"], "background colour", undefined, true, "value"),
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
