import { addProperties, addMethods } from "./utils";
import { editList } from "./edit-lists";

export function doc(edits, links) {
  let obj = {};
  edits = editList(...(edits ?? []));
  links = links ?? [];

  addProperties(obj, {
    edits,
    links
  });

  addMethods(obj, {
    concLength: () => edits.concLength()
  });

  return obj;
}
