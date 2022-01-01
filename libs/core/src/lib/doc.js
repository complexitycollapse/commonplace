import { addProperties, finalObject } from "./utils";
import { leafDataToBox } from './box';
import { leafDataToSpan } from './span';

export function Doc(clips, overlay) {
  let obj = {};
  clips = clips ?? [];
  overlay = overlay ?? [];

  addProperties(obj, {
    clips,
    overlay
  });

  function leafData() {
    return {
      edl: clips.map(c => c.leafData()),
      odl: overlay
    };
  }

  return finalObject(obj, {
    leafData,
    convertToLeaf: () => JSON.stringify(leafData())
  });
}

export function leafDataToDoc(leafData) {
  return Doc(leafData.edl.map(leafDataToClip), leafData.odl);
}

export function leafDataToClip(leafData) {
  if (leafData.typ === "span") {
    return leafDataToSpan(leafData);
  } else if (leafData.typ === "box") {
    return leafDataToBox(leafData);
  } else {
    throw `leafDataToClip does not understand '${JSON.stringify(leafData)}'`;
  }
}
