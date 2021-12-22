import { StructureElement } from "./structure-element";

export function Node(endsets) {
  let obj = Object.create(StructureElement(endsets));
  obj.children = [];
  return obj;
}
