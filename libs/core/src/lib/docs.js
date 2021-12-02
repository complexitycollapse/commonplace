import { addProperties, addMethods } from "./utils";
import { EditList, leafDataToEdit } from "./edit-lists";
import { leafDataToLink } from "./links";

export function Doc(edits, links) {
  let obj = {};
  edits = EditList(...(edits ?? []));
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
  return Doc(leafData.edl.map(leafDataToEdit), leafData.odl.map(leafDataToLink));
}
