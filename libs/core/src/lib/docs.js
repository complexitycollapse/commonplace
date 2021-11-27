import { addProperties, addMethods } from "./utils";
import { editList, leafDataToEdit } from "./edit-lists";
import { leafDataToLink } from "./links";

export function doc(edits, links) {
  let obj = {};
  edits = editList(...(edits ?? []));
  links = links ?? [];

  addProperties(obj, {
    edits,
    links
  });

  function leafData() {
    return {
      edl: edits.leafData(),
      odl: links.map(l => l.leafData())
    };
  }

  addMethods(obj, {
    concLength: () => edits.concLength(),
    leafData,
    convertToLeaf: () => JSON.stringify(leafData())
  });

  return obj;
}

export function leafDataToDoc(leafData) {
  return doc(leafData.edl.map(leafDataToEdit), leafData.odl.map(leafDataToLink));
}
