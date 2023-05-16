import { finalObject } from "@commonplace/utils";
import { Link } from "./model";
import { Part } from "./part";
import { EdlPointer, InlinePointer, LinkPointer } from "./pointers";

export const wellKnownParts = [];

function makePart(pointer) {
  let part = Part(pointer, Link(metatype, ["name", [InlinePointer(pointer.linkName)]]));
  wellKnownParts.push(part);
  return part;
}

export const defaultsType = LinkPointer("defaults");
export const defaultsPointer = EdlPointer("defaults Edl");
export const markupType = LinkPointer("markup");
export const definesSequenceType = LinkPointer("defines sequence");
export const metatype = InlinePointer("type");
export const documentType = LinkPointer("document");
export const missingEdlType = InlinePointer("missing Edl");
export const paragraphType = LinkPointer("paragraph");
export const definesSemanticClassType = LinkPointer("defines semantic class");

export const defaultsPart = makePart(defaultsType);
export const markupPart = makePart(markupType);
export const definesSequencePart = makePart(definesSequenceType);
export const documentPart = makePart(documentType);
export const paragraphPart = makePart(paragraphType);
export const definesSemanticClassPart = makePart(definesSemanticClassType);

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
