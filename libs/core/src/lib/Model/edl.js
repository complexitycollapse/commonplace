import { addProperties, finalObject } from "../utils";
import { leafDataToBox } from '../Pointers/box';
import { leafDataToSpan } from '../Pointers/span';
import { leafDataToLinkPointer } from "../Pointers/pointer";

export function Edl(type, clips, links) {
  let obj = {};
  clips = clips ?? [];
  links = links ?? [];

  addProperties(obj, {
    type,
    clips,
    links
  });

  function leafData() {
    return {
      typ: type,
      cps: clips.map(c => c.leafData()),
      lks: links.map(l => l.leafData())
    };
  }

  return finalObject(obj, {
    leafData,
    convertToLeaf: () => JSON.stringify(leafData())
  });
}

export function leafDataToEdl(leafData) {
  return Edl(
    leafData.typ,
    leafData.cps.map(leafDataToClip),
    leafData.lks.map(leafDataToLinkPointer));
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
