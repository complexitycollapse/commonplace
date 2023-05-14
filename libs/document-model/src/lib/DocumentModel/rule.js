import { addProperties, finalObject } from "@commonplace/utils";

export function Rule(originLink, immediateTargets, classes, linkTypes, clipTypes, edlTypes, attributeDescriptors) {
  let obj = {};

  let hasTypeCriteria = linkTypes.length > 0 || clipTypes.length > 0 || edlTypes.length > 0;
  let hasClassCriteria = classes.length > 0;

  addProperties(obj, {
    originLink,
    attributeDescriptors,
    immediateTargets,
    linkTypes,
    clipTypes,
    edlTypes,
    classes,
    hasTypeCriteria,
    hasClassCriteria
  });

  function match(target) {
    if (immediateTargets.some(t => t.endowsTo(target.pointer))) {
      return true;
    }

    let hasClassCriteria = classes.length > 0;

    if (hasClassCriteria) {
      let targetClasses = target.getClasses();
      if (!targetClasses.some(c1 => classes.some(c2 => c1.pointer.denotesSame(c2)))) {
        return false;
      }

      if (linkTypes.length === 0 && clipTypes.length === 0 && edlTypes.length === 0) {
        return true;
      }
    }

    if (target.isLink && linkTypes.some(t => t.denotesSame(target.type))) {
      return true;
    }

    if (target.isClip && clipTypes.some(t => t === target.pointer.pointerType)) {
      return true;
    }

    if (target.isEdl && edlTypes.some(t => t.denotesSame(target.type))) {
      return true;
    }

    return false;
  }

  return finalObject(obj, {
    match
  });
}
