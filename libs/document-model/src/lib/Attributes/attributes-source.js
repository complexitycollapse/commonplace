export function DirectAttributeSource(origin, edlAndPointersStack) {
  return generateAttributesOfGivenType(origin, edlAndPointersStack, p => p.allDirectAttributeEndowments());
}

export function ContentAttributeSource(origin, edlAndPointersStack) {
  return generateAttributesOfGivenType(origin, edlAndPointersStack, p => p.allContentAttributeEndowments());
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
