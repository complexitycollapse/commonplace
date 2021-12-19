import { addProperties, finalObject } from "./utils";
import { ClipList, leafDataToClip } from "./clip-list";

export function Doc(clips, overlay) {
  let obj = {};
  let clipList = ClipList(...(clips ?? []));
  clips = clipList.clips;
  overlay = overlay ?? [];

  addProperties(obj, {
    clips,
    overlay
  });

  function leafData() {
    return {
      edl: clipList.leafData(),
      odl: overlay
    };
  }

  return finalObject(obj, {
    concLength: () => clipList.concLength(),
    leafData,
    convertToLeaf: () => JSON.stringify(leafData())
  });
}

export function leafDataToDoc(leafData) {
  return Doc(leafData.edl.map(leafDataToClip), leafData.odl);
}
