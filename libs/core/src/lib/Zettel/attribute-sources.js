import { finalObject } from '../utils';

export function AttributesSources([specificPointers, typePointers, allTypePointers], containingEdl) {
  let obj = {};

  function* generateAttributeSources() {
    yield* decomposePointersAccordingToEdlHierarchy(specificPointers);
    yield* decomposePointersAccordingToEdlHierarchy(typePointers);
    yield* decomposePointersAccordingToEdlHierarchy(allTypePointers);
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
      let pointers = renderPointersByEdlHashName.get(edl.hashableName);
      if (pointers.length > 0) { yield { edl, pointers: buildPointerList(pointers, edl) }; }
    }
  }
}

function buildPointerList(pointers, edl) {
  let sortedList = [];
  edl.edl.links.forEach(pointer => {
    let rp = pointers.find(p => p.renderLink.pointer == pointer);
    if (rp) { sortedList.push(rp); }
  });
  return sortedList.reverse();
}