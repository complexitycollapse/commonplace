import { StructureElement } from "./structure-element";

export function ZettelRegion(endsets) {
  let obj = StructureElement(endsets);
  obj.children = [];
  obj.key = 1;
  obj.isSegment = true;
  return obj;
}
