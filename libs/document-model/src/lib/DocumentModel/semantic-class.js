import { addProperties, finalObject } from "@commonplace/utils";

export default function SemanticClass(pointer, link) {
  let obj = {};

  addProperties(obj, {
    pointer,
    link,
    hashableName: "class:" + pointer.hashableName
  });

  return finalObject(obj);
}
