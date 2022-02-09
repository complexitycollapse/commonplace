import { finalObject } from '../utils';

export function Attributes(renderPointerCollection, containingEdl) {
  let obj = {};

  function* generateAttributeSources() {
    let [directPointers, typePointers, allTypePointers] = renderPointerCollection.allPointers();
    
    yield* generatePointersFromEdl(allTypePointers);
    yield* generatePointersFromEdl(typePointers);
    yield* generatePointersFromEdl(directPointers);

    return undefined;
  }

  return finalObject(obj, {

  });

  function* generatePointersFromEdl(pointerObject) {
    for(let edl = containingEdl; edl !== undefined; edl = edl.parent) {
      let pointers = pointerObject[edl.hashableName];
      yield { edl, pointers };
    }
  }
}
