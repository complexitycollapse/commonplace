import { finalObject } from "@commonplace/utils";

export function SequenceBuildingCursor(sequenceDetails) {
  return SequenceBuildingCursorInternal(sequenceDetails, [], [...sequenceDetails.end.pointers]);
}

function SequenceBuildingCursorInternal(sequenceDetails, collected, remaining) {
  let obj = {};
  let { type, definingLink, signature } = sequenceDetails;
  let current = undefined;
  let validSoFar = true;
  let nestedSequencesStack = [];

  function consumeZettel(zettel) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    if (nestedSequencesStack.length === 0) {
      consumeZettelAtTopLevel(zettel);
    } else {
      validSoFar = consumeZettelInNestedSequence(zettel);
    }

    // Clean up the stack
    while(nestedSequencesStack.length > 0 && nestedSequencesStack[0].length === 0) {
      nestedSequencesStack.shift();
    }

    return validSoFar;
  }

  function consumeZettelInNestedSequence(zettel) {
    let currentSequence = nestedSequencesStack[0];
    let currentSequenceElement = currentSequence.shift();

    if (currentSequenceElement.isSequence) {
      nestedSequencesStack.unshift([...currentSequenceElement.zettel]);
      return consumeZettelInNestedSequence(zettel);
    }

    return currentSequenceElement.clip.denotesSame(zettel.clip);
  }

  function consumeZettelAtTopLevel(zettel) {
    let zettelSignatures = zettel.potentialSequenceDetails().map(d => d.signature);
    if (!zettelSignatures.some(d => signature.equals(d))) {
      validSoFar = false;
      return;
    }

    if (current === undefined) { current = remaining.shift(); }
    
    let { nibbled, remainder } = current.nibble(zettel.clip);

    if (nibbled) {
      current = remainder;
      collected.push(zettel);
    } else {
      validSoFar = false;
    }
  }

  function consumeSequence(sequence) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    let next = remaining.shift();

    let matches = next.denotesSame(sequence.definingLink.pointer);

    if (matches) {
      collected.push(sequence);
    } else {
      validSoFar = false;
    }

    nestedSequencesStack.unshift([...sequence.zettel]);
    return validSoFar;
  }

  function isComplete() {
    return validSoFar && current === undefined && remaining.length === 0 && nestedSequencesStack.length === 0;
  }

  function pushSequence() {
    if (!isComplete()) {
      throw "Cannot reify incomplete sequence";
    }

    let sequence = {
      definingLink,
      signature,
      type,
      zettel: collected,
      isSequence: true
    };

    collected.forEach(x => x.isSequence ? x.definingLink.sequences.push(sequence) : x.sequences.push(sequence));

    return sequence;
  }

  function clone() {
    return SequenceBuildingCursorInternal(sequenceDetails, collected, [...remaining]);
  }

  function stalledOnLink() {
    if (validSoFar && current === undefined && remaining.length > 0 && remaining[0].pointerType === "link") {
      return remaining[0];
    } else {
      return undefined;
    }
  }

  return finalObject(obj, {
    consumeZettel,
    consumeSequence,
    isComplete,
    pushSequence,
    clone,
    stalledOnLink
  });
}
