import { addProperties, finalObject } from "@commonplace/utils";
import { leafDataToImage, leafDataToSpan, leafDataToLinkPointer, leafDataToEdlPointer, leafDataToPointer } from '../pointers.js';

export function Edl(type, clips, links) {
  let obj = {};
  clips = clips ?? [];
  links = links ?? [];

  addProperties(obj, {
    type,
    clips,
    links,
    isEdl: true
  });

  function leafData() {
    return {
      typ: type?.leafData(),
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
    leafData.typ ? leafDataToPointer(leafData.typ) : undefined,
    leafData.cps.map(leafDataToClip),
    leafData.lks.map(leafDataToLinkPointer));
}

export function leafDataToClip(leafData) {
  if (leafData.typ === "span") {
    return leafDataToSpan(leafData);
  } else if (leafData.typ === "image") {
    return leafDataToImage(leafData);
  } else if (leafData.typ === "edl") {
    return leafDataToEdlPointer(leafData);
  } else {
    throw `leafDataToClip does not understand '${JSON.stringify(leafData)}'`;
  }
}
