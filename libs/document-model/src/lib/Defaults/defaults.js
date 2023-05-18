import {
  Edl, Link, InlinePointer, LinkPointer, Part
} from "@commonplace/core";
import { markupType, definesSequenceType, defaultsType, defaultsPointer, paragraphType } from '../well-known-objects';
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

function markupRule(name, attributeDescriptions, { clipType, edlType, linkType } = {}) {
  let ends = [];

  attributeDescriptions.forEach(desc => {
    ends.push(["attribute", [InlinePointer(desc[0])]]);
    ends.push(["value", [InlinePointer(desc[1])]]);
    ends.push(["inherit", [InlinePointer(desc[2])]]);
  });

  if (clipType) { ends.push(["clip types", [InlinePointer(clipType)]]); }
  if (edlType) { ends.push(["edl types", [wrapInline(edlType)]]); }
  if (linkType) { ends.push(["link types", [wrapInline(linkType)]]); }

  return Part(LinkPointer(name), Link(markupType, ...ends));
}

function sequence(name, type, end) {
  return Part(LinkPointer(name),
    Link(definesSequenceType, ["type", [wrapInline(type)]], ["end", [InlinePointer(end ?? "")]]));
}

export let defaultsLinksParts = [
  // directAttribute("paragraph", "paragraph", true),
  // directAttribute("title", "title", true),
  // contentAttribute("left aligned text", "text align", "left"),
  // contentAttribute("right aligned text", "text align", "right"),
  // contentAttribute("centre aligned text", "text align", "center"),
  // contentAttribute("justified aligned text", "text align", "justify"),
  // contentAttribute("inline", "layout mode", "inline"),
  // directAttribute("block", "layout mode", "block"),
  // directAttribute("break", "break", true),
  markupRule("defaults:spans", [["layout mode", "inline", "direct"]], {clipType: "span"}),
  markupRule("defaults:blocks", [["layout mode", "block", "direct"]], {clipType: "image"}),
  markupRule("defaults:paragraphs", [
    ["layout mode", "block", "direct"],
    ["box", "true", "direct"]
  ], { edlType: paragraphType, linkType: paragraphType }),
  sequence("defaults:paragraph sequence", paragraphType, undefined)
  //Link("inline", [undefined, [PointerTypePointer("span")]]),
  //Link("block", [undefined, [EdlTypePointer("paragraph")]]),
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
