import { addProperties, addMethods } from "./utils";
import { leafDataToEndset } from "./endsets";

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

export function leafDataToLink(leafData) {
  let es = leafData.es.map(leafDataToEndset);
  return link(leafData.typ, ...es);
}
