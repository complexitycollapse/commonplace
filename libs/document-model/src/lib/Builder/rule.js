import { addProperties, finalObject } from "@commonplace/utils";

export function Rule(originLink, immediateTargets, linkTypes, clipTypes, edlTypes, attributeValuePairs) {
  let obj = {};

  addProperties(obj, {
    attributeValuePairs
  });

  function match(target) {
    if (target.incomingLinks.any(l => l.pointer.endowsTo(originLink.pointer))) {
      return attributeValuePairs;
    }

    if (target.isLink && linkTypes.any(t => t == target.type)) {
      return attributeValuePairs;
    }

    if (target.isClip && clipTypes.any(t => t === target.pointerType)) {
      return attributeValuePairs;
    }

    if (target.isEdl && edlTypes.any(t => t === target.type)) {
      return attributeValuePairs;
    }

    return [];
  }

  return finalObject(obj, {
    match
  });
}
