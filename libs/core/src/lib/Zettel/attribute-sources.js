import { finalObject } from '../utils';

export function AttributesSources(renderPointerCollection, containingEdl) {
  let obj = {};

  function* generateAttributeSources() {
    let [directPointers, typePointers, allTypePointers] = renderPointerCollection.allPointers();
    
    yield decomposePointersAccordingToEdlHierarchy(allTypePointers);
    yield decomposePointersAccordingToEdlHierarchy(typePointers);
    yield decomposePointersAccordingToEdlHierarchy(directPointers);
  }

  return finalObject(obj, {
    generateAttributeSources
  });

  // Runs through the containingEdl and its ancestors, yielding all RenderPointers that
  // originate in that Edl that are found in the given pointer collection.
  // (So basically we are taking the RenderPointers in the collection and sorting and filtering
  // them according to the Edl hierarchy).
  function* decomposePointersAccordingToEdlHierarchy(renderPointersByEdlHashname) {
    for(let edl = containingEdl; edl !== undefined; edl = edl.parent) {
      let pointers = renderPointersByEdlHashname[edl.hashableName];
      yield { edl, pointers };
    }
  }
}
