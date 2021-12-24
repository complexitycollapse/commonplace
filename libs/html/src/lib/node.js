import { StructureElement } from "./structure-element";

export function Node(endsets) {
  let obj = Object.create(StructureElement(endsets));
  obj.children = [];
  obj.key = 1;
  obj.isNode = true;
  return obj;
}
