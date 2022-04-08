import { finalObject } from '../utils';

export function AttributesSources([specificPointers, typePointers, allTypePointers], containingEdl) {
  let obj = {};

  function* generateAttributeSources() {
    yield* decomposePointersAccordingToEdlHierarchy(allTypePointers);
    yield* decomposePointersAccordingToEdlHierarchy(typePointers);
    yield* decomposePointersAccordingToEdlHierarchy(specificPointers);
  }

  return finalObject(obj, {
    generateAttributeSources
  });

  // Runs through the containingEdl and its ancestors, yielding all RenderPointers that
  // originate in that Edl that are found in the given pointer collection.
  // (So basically we are taking the RenderPointers in the collection and sorting and filtering
  // them according to the Edl hierarchy).
  function* decomposePointersAccordingToEdlHierarchy(renderPointersByEdlHashName) {
    for(let edl = containingEdl; edl !== undefined; edl = edl.parent) {
      let pointers = renderPointersByEdlHashName[edl.hashableName];
      if (pointers && pointers.length > 0) { yield { edl, pointers }; }
    }
  }
}
