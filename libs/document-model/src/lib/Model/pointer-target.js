import { addMethods, addProperties, memoize } from "@commonplace/utils";
import { Attributes } from "../Attributes/attributes";
import { RenderPointerCollection } from "./render-pointer-collection";

export function AddPointerTargetFeatures(obj, pointer, pointerSubjectFn, contentParent) {
  let renderPointerCollection = RenderPointerCollection(pointer, pointerSubjectFn);

  function renderPointers() {
    return renderPointerCollection.renderPointers();
  }

  function potentialSequenceDetails() {
    return renderPointerCollection.renderPointers().map(p => p.sequenceDetailsEndowments()).flat();
  }

  function attributes() {
    return Attributes(
      contentParent?.attributes(),
      renderPointerCollection.allPointers,
      renderPointerCollection.allDefaults);
  }

  addProperties(obj, {
    attributes: memoize(attributes),
    sequences: []
  });

  addMethods(obj, {
    renderPointers,
    potentialSequenceDetails,
    addAllEdlRenderLinks: renderPointerCollection.addAllEdlRenderLinks,
    tryAddRenderPointer: renderPointerCollection.tryAddRenderPointer
  });

  return renderPointerCollection;
}
