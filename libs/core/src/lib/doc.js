import { addProperties, addMethods } from "./utils";
import { EditList, leafDataToEdit } from "./edit-list";

export function Doc(edits, overlay) {
  let obj = {};
  let editList = EditList(...(edits ?? []));
  edits = editList.edits;
  overlay = overlay ?? [];

  addProperties(obj, {
    edits,
    overlay
  });

  function leafData() {
    return {
      edl: editList.leafData(),
      odl: overlay
    };
  }

  addMethods(obj, {
    concLength: () => editList.concLength(),
    leafData,
    convertToLeaf: () => JSON.stringify(leafData())
  });

  return obj;
}

export function leafDataToDoc(leafData) {
  return Doc(leafData.edl.map(leafDataToEdit), leafData.odl);
}
