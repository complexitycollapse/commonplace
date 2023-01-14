import { addProperties, finalObject } from "@commonplace/utils";

export function Rule(originLink, immediateTargets, linkTypes, clipTypes, edlTypes, attributeValuePairs, additionalProperties = {}) {
  let obj = {};

  addProperties(obj, {
    originLink,
    attributeValuePairs,
    immediateTargets,
    linkTypes,
    clipTypes,
    edlTypes
  });

  Object.assign(obj, additionalProperties);

  function match(target) {
    if (immediateTargets.some(t => t.endowsTo(target.pointer))) {
      return attributeValuePairs;
    }

    if (target.isLink && linkTypes.some(t => t == target.type)) {
      return attributeValuePairs;
    }

    if (target.isClip && clipTypes.some(t => t === target.pointerType)) {
      return attributeValuePairs;
    }

    if (target.isEdl && edlTypes.some(t => t === target.type)) {
      return attributeValuePairs;
    }

    return [];
  }

  return finalObject(obj, {
    match
  });
}
