import { StructureElement } from "./structure-element";

export function ZettelSegment(endsets) {
  let obj = Object.create(StructureElement(endsets));
  obj.children = [];
  obj.key = 1;
  obj.isSegment = true;
  return obj;
}
