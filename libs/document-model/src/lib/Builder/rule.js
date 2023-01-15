import { addProperties, finalObject } from "@commonplace/utils";

export function Rule(originLink, immediateTargets, linkTypes, clipTypes, edlTypes, attributeValuePairs) {
  let obj = {};

  addProperties(obj, {
    originLink,
    attributeValuePairs,
    immediateTargets,
    linkTypes,
    clipTypes,
    edlTypes
  });

  function match(target) {
    if (immediateTargets.some(t => t.endowsTo(target.pointer))) {
      return true;
    }

    if (target.isLink && linkTypes.some(t => t == target.type)) {
      return true;
    }

    if (target.isClip && clipTypes.some(t => t === target.pointerType)) {
      return true;
    }

    if (target.isEdl && edlTypes.some(t => t === target.type)) {
      return true;
    }

    return false;
  }

  return finalObject(obj, {
    match
  });
}
