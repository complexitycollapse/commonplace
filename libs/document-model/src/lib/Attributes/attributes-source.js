import { addProperties, finalObject } from "@commonplace/utils";

export function DirectAttributeSource(origin, edlAndPointersStack) {
  let obj = {};

  addProperties(obj, {
    attributes: generateAttributesOfGivenType(origin, edlAndPointersStack, p => p.allDirectAttributeEndowments())
  });

  return finalObject(obj, { });
}

export function ContentAttributeSource(origin, edlAndPointersStack) {
  let obj = {};

  addProperties(obj, {
    attributes: generateAttributesOfGivenType(origin, edlAndPointersStack, p => p.allContentAttributeEndowments())
  });

  return finalObject(obj, { });
}

function generateAttributesOfGivenType(origin, edlAndPointersStack, endowmentsFn) {
  let attributeDescriptors = edlAndPointersStack
    .map(edlAndPointers => edlAndPointers.pointers
      .map(pointer => {
        let endowments = endowmentsFn(pointer);
        let entries = [...endowments.entries()];
        return entries.map(([attribute, value]) => ({ attribute, value, pointer, edl: edlAndPointers.edl }));
      })
      .flat());
  
  return { origin, attributeDescriptors }
}
