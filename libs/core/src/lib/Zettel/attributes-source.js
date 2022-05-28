import { addProperties, finalObject } from "../utils";

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

  function attributes() {
    return generateAttributesOfGivenType(origin, sources, p => p.allDirectAttributeEndowments());
  }

  return finalObject({}, { attributes });
}

export function ContentAttributeSource(origin, sources) {

  function attributes() {
    return generateAttributesOfGivenType(origin, sources, p => p.allContentAttributeEndowments());
  }

  return finalObject({}, { attributes });
}

export function DefaultsAttributeSource(sources) {

  function attributes() {
    return generateAttributesOfGivenType("defaults", sources, p => p.allContentAttributeEndowments());
  }

  return finalObject({}, { attributes });
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