import { addProperties, finalObject } from "../utils";

export function AttributesSourceFromPointers(edl, pointers) {
  let obj = {};

  addProperties(obj, {
    edl,
    pointers
  });

  return finalObject(obj, {

  });
}
