import { Edl, Link, InlinePointer, LinkPointer, EdlPointer } from "@commonplace/core";
import { DocumentModelBuilder } from './DocumentModel/document-model-builder';

function makeEnds(inheritance, types, attribute, value, hasValueEnd, valueEnd) {
  if (!Array.isArray(types)) { types = [types]; }
  let ends = [
    ["link types", types.map(t => InlinePointer(t))],
    ["attribute", [InlinePointer(attribute)]],
    ["inheritance", [InlinePointer(inheritance)]]
  ];

  if (value !== undefined) {
    ends.push(["value", [InlinePointer(value)]]);
  }

  if (hasValueEnd) {
    ends.push(["end", [InlinePointer(valueEnd)]]);
  }

  return ends;
}

function contentAttribute(type, attribute, value, hasValueEnd, valueEnd) {
  let ends = makeEnds("content", type, attribute, value, hasValueEnd, valueEnd);
  return Link("endows attributes", ...ends);
}

function directAttribute(type, attribute, value, hasValueEnd, valueEnd) {
  let ends = makeEnds("direct", type, attribute, value, hasValueEnd, valueEnd);
  return Link("endows attributes", ...ends);
}

export let defaultsLinks = [
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
  directAttribute(["background colour", "background color"], "background colour", undefined, true, "value"),
  contentAttribute("inline", "layout mode", "inline"),
  directAttribute("block", "layout mode", "block"),
  directAttribute("break", "break", true)
  //Link("inline", [undefined, [PointerTypePointer("span")]]),
  //Link("block", [undefined, [EdlTypePointer("paragraph")]])
];

function deriveLinkPointer(link) {
  let targetType = link.getEnd("link types").pointers[0].inlineText;
  return LinkPointer("defaults:" + targetType);
}

export const defaultsType = "defaults";

export const defaultsPointer = EdlPointer("defaults");

export const defaultsEdl = Edl(defaultsType, [], defaultsLinks.map(deriveLinkPointer));

export function DefaultsDocModel(repo) {
  return DocumentModelBuilder(defaultsPointer, repo).build();
}
