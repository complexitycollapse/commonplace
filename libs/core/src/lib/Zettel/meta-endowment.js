import { addProperties, finalObject } from "../utils";

export function MetaEndowment(attributeName, defaultValue, hasValueEnd, valueEndName) {
  let obj = {};
  
  addProperties(obj, {
    attributeName,
    defaultValue,
    hasValueEnd: hasValueEnd,
    valueEndName: valueEndName
  });

  function calculateValueForPointer(renderPointer) {
    if (hasValueEnd) {
      let renderEnd = renderPointer.renderLink.renderEnds.find(e => e.end.name === valueEndName);
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
