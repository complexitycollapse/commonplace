import { finalObject } from "@commonplace/utils";
import { Link, Part, EdlPointer, InlinePointer, LinkPointer } from "@commonplace/core";

export const wellKnownParts = [];


function makeType(name, ...metalinks) {
  let pointer = LinkPointer(name);

  let metalinkParts = metalinks.map(m => Part(LinkPointer(m[0], m[1])));
  let ends = metalinkParts.map(p => [undefined, [p.pointer]]);
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
export const [paragraphType, paragraphPart] = makeType("paragraph");
export const [definesSemanticClassType, definesSemanticClassPart] = makeType("defines semantic class");

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
