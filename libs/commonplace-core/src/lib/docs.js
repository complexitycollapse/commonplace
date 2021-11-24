import { addProperties } from "./utils";

export function doc(edits, links) {
  let obj = {};

  addProperties(obj, {
    edits,
    links
  });

  return obj;
}
