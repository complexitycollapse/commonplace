import { addMethods, addProperties, memoize } from "@commonplace/utils";
import { Attributes } from "../Attributes/attributes";
import { RenderPointerCollection } from "./render-pointer-collection";

export function AddPointerTargetFeatures(obj, pointer, pointerSubjectFn, containingEdl, contentParent) {
  let renderPointerCollection = RenderPointerCollection(pointer, pointerSubjectFn, containingEdl);

  function renderPointers() {
    return renderPointerCollection.renderPointers();
  }

  function potentialSequenceDetails() {
    return renderPointerCollection.renderPointers().map(p => p.sequenceDetailsEndowments()).flat();
  }

  function attributes() {
    let pointerStack = renderPointerCollection.pointerStack();
    let defaultsStack = renderPointerCollection.defaultsStack();
    return Attributes(obj, contentParent?.attributes(), pointerStack, defaultsStack);
  }

  addProperties(obj, {
    attributes: memoize(attributes),
    sequences: []
  });

  addMethods(obj, {
    renderPointers,
    potentialSequenceDetails,
    tryAddAll: renderPointerCollection.tryAddAll,
    tryAddRenderPointer: renderPointerCollection.tryAddRenderPointer
  });

  return renderPointerCollection;
}
