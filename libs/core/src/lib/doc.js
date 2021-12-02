import { addProperties, addMethods } from "./utils";
import { EditList, leafDataToEdit } from "./edit-list";

export function Doc(edits, overlay) {
  let obj = {};
  edits = EditList(...(edits ?? []));
  overlay = overlay ?? [];

  addProperties(obj, {
    edits,
    overlay
  });

  function leafData() {
    return {
      edl: edits.leafData(),
      odl: overlay
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
  return Doc(leafData.edl.map(leafDataToEdit), leafData.odl);
}
