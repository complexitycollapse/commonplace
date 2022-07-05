import { finalObject } from "@commonplace/utils";

export function SequenceBuilder(type, end, signature) {
  let obj = {};
  let remaining = [...end.pointers];
  let current = undefined;
  let validSoFar = true;
  let collected = [];

  function consumePointer(zettel) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    if (current === undefined) { current = remaining.shift(); }
    
    let { nibbled, remainder } = current.nibble(zettel.clip);

    if (nibbled) {
      current = remainder;
    } else {
      validSoFar = false;
    }

    collected.push(zettel);
    return validSoFar;
  }

  function isComplete() {
    return validSoFar && current === undefined && remaining.length === 0;
  }

  return finalObject(obj, {
    consumePointer,
    isComplete
  });
}
