import { addProperties } from "./utils";

export function link(type, ...endsets) {
  let obj = {};

  addProperties(obj, {
    type,
    endsets
  });

  return obj;
}
