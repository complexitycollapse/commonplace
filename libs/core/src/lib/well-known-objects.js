import { finalObject } from "@commonplace/utils";
import { Link } from "./model";
import { Part } from "./part";
import { EdlPointer, InlinePointer, LinkPointer } from "./pointers";

export const defaultsType = "defaults";
export const defaultsPointer = EdlPointer("defaults");
export const markupType = LinkPointer("markup");
export const definesSequenceType = LinkPointer("defines sequence");
export const endowsAttributesType = LinkPointer("endows attributes");
export const metatype = InlinePointer("type");
export const documentType = LinkPointer("document");
export const missingEdlType = InlinePointer("missing Edl");
export const paragraphType = LinkPointer("paragraph");

export const markupPart = Part(LinkPointer("markup"), Link(metatype, ["name", [InlinePointer("markup")]]));
export const definesSequencePart = Part(LinkPointer("defines sequence"), Link(metatype, ["name", [InlinePointer("defines sequence")]]));
export const endowsAttributePart = Part(LinkPointer("endows attributes"), Link(metatype, ["name", [InlinePointer("endows attributes")]]));
export const documentPart = Part(LinkPointer("document"), Link(metatype, ["name", [InlinePointer("document")]]));
export const paragraphPart = Part(LinkPointer("paragraph"), Link(metatype, ["name", [InlinePointer("paragraph")]]));

export const wellKnownParts = [markupPart, definesSequencePart, endowsAttributePart, documentPart, paragraphPart];

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
