import { finalObject } from "@commonplace/utils";

export function SequenceBuilder(type, end, definingLink, signature) {
  let obj = {};
  let remaining = [...end.pointers];
  let current = undefined;
  let validSoFar = true;
  let collected = [];

  function consumeZettel(zettel) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    let zettelSignatures = zettel.sequenceDetails().map(d => d.signature);
    if (!zettelSignatures.some(d => signature.equals(d))) {
      validSoFar = false;
      return false;
    }

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

  function pushSequence() {
    if (!isComplete()) {
      throw "Cannot reify incomplete sequence";
    }

    let sequence = {
      definingLink,
      signature,
      type,
      zettel: collected
    };

    collected.forEach(z => z.sequences.push(sequence));

    return sequence;
  }

  return finalObject(obj, {
    consumeZettel,
    isComplete,
    pushSequence
  });
}
