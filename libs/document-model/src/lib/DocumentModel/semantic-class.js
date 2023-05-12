import { addProperties, finalObject } from "@commonplace/utils";

export default function SemantiClass(pointer, link) {
  let obj = {};

  addProperties(obj, {
    pointer,
    link
  });

  return finalObject(obj);
}
