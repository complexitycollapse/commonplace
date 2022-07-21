import { addProperties, finalObject } from "@commonplace/utils";

export function AttributesSourceFromPointers(edl, pointers) {
  let obj = {};

  addProperties(obj, {
    edl,
    pointers
  });

  return finalObject(obj, {

  });
}

export function DirectAttributeSource(origin, sources) {
  let obj = {};

  addProperties(obj, {
    attributes: generateAttributesOfGivenType(origin, sources, p => p.allDirectAttributeEndowments())
  });

  return finalObject(obj, { });
}

export function ContentAttributeSource(origin, sources) {
  let obj = {};

  addProperties(obj, {
    attributes: generateAttributesOfGivenType(origin, sources, p => p.allContentAttributeEndowments())
  });

  return finalObject(obj, { });
}

export function DefaultsAttributeSource(sources) {
  let obj = {};

  addProperties(obj, {
    attributes: generateAttributesOfGivenType("defaults", sources, p => p.allContentAttributeEndowments())
  });

  return finalObject(obj, { });
}

function generateAttributesOfGivenType(origin, sources, endowmentsFn) {
  let contents = sources
    .map(source => source.pointers
      .map(pointer => {
        let endowments = endowmentsFn(pointer);
        let entries = [...endowments.entries()];
        return entries.map(function ([attribute, value]) { return { attribute, value, pointer, edl: source.edl }; });
      })
      .flat());
  
  return { origin, contents }
}