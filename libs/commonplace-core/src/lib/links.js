import { addProperties, addMethods } from "./utils";

export function link(type, ...endsets) {
  let obj = {};

  addProperties(obj, {
    type,
    endsets
  });

  function leafData() {
    return {
      typ: type,
      es: endsets.map(e => e.leafData())
    };
  }

  addMethods(obj, {
    leafData
  });

  return obj;
}
