import {
  Edl, Link, InlinePointer, LinkPointer, Part
} from "@commonplace/core";
import {
  markupType, defaultsType, defaultsPointer, paragraphType, headingType,
  listType, listItemType
} from '../well-known-objects';
import { DocumentModelBuilder } from '../DocumentModel/document-model-builder';
import { finalObject } from "@commonplace/utils";

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

function wrapInline(pointer) {
  return typeof pointer === "string" ? InlinePointer(pointer) : pointer;
}

// function contentAttribute(type, attribute, value, hasValueEnd, valueEnd) {
//   let ends = makeEnds("content", type, attribute, value, hasValueEnd, valueEnd);
//   let link = Link(endowsAttributesType, ...ends);
//   return Part(deriveLinkPointer(link), link);
// }

// function directAttribute(type, attribute, value, hasValueEnd, valueEnd) {
//   let ends = makeEnds("direct", type, attribute, value, hasValueEnd, valueEnd);
//   let link = Link(endowsAttributesType, ...ends);
//   return Part(deriveLinkPointer(link), link);
// }

function markupRule(name, attributeDescriptions, { clipType, edlType, linkType, classes } = {}) {
  let ends = [];

  attributeDescriptions.forEach(desc => {
    ends.push(["attribute", [InlinePointer(desc[0])]]);
    ends.push(["value", [InlinePointer(desc[1])]]);
    ends.push(["inheritance", [InlinePointer(desc[2])]]);
  });

  if (clipType) { ends.push(["clip types", [InlinePointer(clipType)]]); }
  if (edlType) { ends.push(["edl types", [wrapInline(edlType)]]); }
  if (linkType) { ends.push(["link types", [wrapInline(linkType)]]); }
  if (classes) { ends.push(["classes", [classes]]); }

  return Part(LinkPointer(name), Link(markupType, ...ends));
}

export let defaultsLinksParts = [
  // contentAttribute("left aligned text", "text align", "left"),
  // contentAttribute("right aligned text", "text align", "right"),
  // contentAttribute("centre aligned text", "text align", "center"),
  // contentAttribute("justified aligned text", "text align", "justify"),
  // contentAttribute("inline", "layout level", "inline"),
  // directAttribute("block", "layout level", "block"),
  // directAttribute("break", "break", true),
  markupRule("defaults:spans", [["layout level", "inline", "direct"]], {clipType: "span"}),
  markupRule("defaults:blocks", [["layout level", "block", "direct"]], { clipType: "image" }),

  markupRule("defaults:paragraph", [
    ["layout level", "block", "direct"],
    ["box", "true", "direct"]
  ], { edlType: paragraphType, linkType: paragraphType }),

  markupRule("defaults:list", [
    ["layout level", "block", "direct"],
    ["box", "true", "direct"],
    ["list", "true", "direct"]
  ], { edlType: listType, linkType: listType }),
  markupRule("defaults:list item", [
    ["layout level", "block", "direct"],
    ["box", "true", "direct"],
    ["list item", "true", "direct"]
  ], { edlType: listItemType, linkType: listItemType }),

  markupRule("defaults:heading markup", [
    ["layout level", "block", "direct"],
    ["box", "true", "direct"],
    ["bold", "true", "content"],
    ["font size", "1.5em", "content"]
  ], { linkType: headingType, edlType: headingType }),

  markupRule("defaults:emphasis", [["italic", "true", "content"]], {classes: LinkPointer("emphasis")}),
  markupRule("defaults:foreign word", [["italic", "true", "content"]], {classes: LinkPointer("foreign word")}),
  markupRule("defaults:quote emphasis", [["italic", "true", "content"]], {classes: LinkPointer("quote emphasis")}),
  //Link("inline", [undefined, [PointerTypePointer("span")]]),
];

function deriveLinkPointer(link) {
  let targetType = link.getEnd("link types").pointers[0].inlineText;
  return LinkPointer("defaults:" + targetType);
}

export const defaultsEdl = Edl(defaultsType, [], defaultsLinksParts.map(part => part.pointer));

export function DefaultsDocModel(cache) {
  return DocumentModelBuilder(defaultsPointer, cache).build();
}

export function DefaultsPartFetcher() {
  async function getPart(pointer) {
    if (defaultsPointer.denotesSame(pointer)) {
      return [true, Part(defaultsPointer, defaultsEdl)];
    }

    let part = defaultsLinksParts.find(part => part.pointer.denotesSame(pointer));
    if (part) {
      return [true, part];
    }

    return [false, undefined];
  }

  return finalObject({}, { getPart });
}
