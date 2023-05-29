import { finalObject } from "@commonplace/utils";
import { Link, Part, EdlPointer, InlinePointer, LinkPointer } from "@commonplace/core";

export const wellKnownParts = [];


function makeType(name, ...metalinks) {
  let pointer = LinkPointer(name);

  let metalinkParts = metalinks.map(m => Part(m[0], m[1]));
  let ends = metalinks.map(m => [undefined, [m[0]]]);
  let part = Part(pointer, Link(metatype, ["name", [InlinePointer(pointer.linkName)]], ...ends));

  metalinkParts.forEach(part => wellKnownParts.push(part));
  wellKnownParts.push(part);

  return [pointer, part];
}

export const defaultsPointer = EdlPointer("defaults Edl");
export const metatype = InlinePointer("type");

export const [defaultsType, defaultsPart] = makeType("defaults");
export const [markupType, markupPart] = makeType("markup");
export const [definesSequenceType, definesSequencePart] = makeType("defines sequence");
export const [documentType, documentPart] = makeType("document");
export const [missingEdlType, missingEdlPart] = makeType("missing Edl");
export const [definesSemanticClassType, definesSemanticClassPart] = makeType("defines semantic class");

function makeClass(name, description = "", ...endSpecs) {
  return [
    LinkPointer(name + " class"),
    Link(definesSemanticClassType,
      ["name", [InlinePointer(name)]],
      ["description", [InlinePointer(description)]],
      ...endSpecs)
  ];
}

function wrapInline(pointer) {
  return typeof pointer === "string" ? InlinePointer(pointer) : pointer;
}

function makeSequence(name, end, type) {
  let ends = [["end", [InlinePointer(end ?? "")]]];
  if (type) { ends.push(["type", [wrapInline(type)]]) }
  return [LinkPointer(name + " sequence"), Link(definesSequenceType, ...ends)];
}

export const [paragraphType, paragraphPart] = makeType("paragraph", makeSequence("paragraph"));
export const [emphasisType, emphasisPart] = makeType("emphasis", makeClass("emphasis", "", ["end", [InlinePointer("")]]));
export const [foreignWordType, foreignWordPart] = makeType("foreign word", makeClass("foreign word", "", ["end", [InlinePointer("")]]));
export const [quoteEmphasisType, quoteEmphasisPart] = makeType("quote emphasis", makeClass("quote emphasis", "", ["end", [InlinePointer("")]]));
export const [titleType, titlePart] = makeType("title", makeSequence("title"));
export const [headingType, headingPart] = makeType("heading", makeSequence("heading"));
export const [listType, listPart] = makeType("list", makeSequence("list", "items"));
export const [listItemType, listItemPart] = makeType("list item", makeSequence("list item"));

export function WellKnownObjectsPartFetcher() {
  async function getPart(pointer) {
    let part = wellKnownParts.find(part => part.pointer.denotesSame(pointer));
    if (part) {
      return [true, part];
    }

    return [false, undefined];
  }

  return finalObject({}, { getPart });
}
