import { addProperties, finalObject } from "../utils";

export function MetaEndowment(attributeName, defaultValue, hasValueEndset, valueEndsetName) {
  let obj = {};
  
  addProperties(obj, {
    attributeName,
    defaultValue,
    hasValueEndset,
    valueEndsetName
  });

  function calculateValueForPointer(renderPointer) {
    if (hasValueEndset) {
      let renderEnd = renderPointer.renderLink.renderEnds.find(e => e.end.name === valueEndsetName);
      if (renderEnd) {
        // TODO: this does not handle non-string types. It can't. Parsing needs to be done somewhere,
        // such as when we assign to the attribute (presumably the attribute knows what type it accepts).
        return [true, renderEnd.concatatext()];
      }
    }

    if (defaultValue !== undefined) {
      return [true, defaultValue];
    } else {
      return [false, undefined];
    }
  }

  return finalObject(obj, {
    calculateValueForPointer
  });
}
