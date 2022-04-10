import { addProperties, finalObject } from "../utils";

export function AttributesSource(edl, pointers) {
  let obj = {};

  addProperties(obj, {
    edl,
    pointers
  });

  return finalObject(obj, {

  });
}
