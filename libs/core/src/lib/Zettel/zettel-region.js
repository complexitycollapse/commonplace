import { StructureElement } from "./structure-element";
import { addMethods } from '../utils';

export function ZettelRegion(endsets) {
  let obj = StructureElement(endsets);
  obj.children = [];
  obj.key = 1;
  obj.isSegment = true;

  function outstandingRequests() {
    return obj.children.map(z => z.outstandingRequests()).flat();
  }

  addMethods(obj, { outstandingRequests });

  return obj;
}
