import { finalObject } from "@commonplace/utils";
import { Sequence } from "./sequence";

// Attempts to incrementally build a sequence for a particular SequenceDetails, either succeeding
// if the passed zettel and sequences match the SequenceDetails, or failing if they don't.
export function SequenceBuildingCursor2(sequenceDetailsPrototype) {
  return SequenceBuildingCursorInternal(sequenceDetailsPrototype, [], [...sequenceDetailsPrototype.end.pointers]);
}

function SequenceBuildingCursorInternal(sequenceDetailsPrototype, collected, remaining) {
  let obj = {};
  let signature = sequenceDetailsPrototype.signature;
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
    let sequenceDetails = zettel.potentialSequenceDetails().filter(d => signature.equals(d.signature));
    if (sequenceDetails.length === 0) {
      validSoFar = false;
      return;
    }

    if (current === undefined) { current = remaining.shift(); }
    
    let { nibbled, remainder } = current.nibble(zettel.clip);

    if (nibbled) {
      current = remainder;
      collected.push(SequenceMember(zettel, sequenceDetails));
    } else {
      validSoFar = false;
    }
  }

  function consumeSequence(sequence) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    let definingLink = sequence.definingLink;

    let sequenceDetails = definingLink.potentialSequenceDetails().filter(d => signature.equals(d.signature));
    if (sequenceDetails.length === 0) {
      validSoFar = false;
      return false;
    }

    let next = remaining.shift();

    let matches = next.denotesSame(definingLink.pointer);

    if (matches) {
      collected.push(SequenceMember(sequence, sequenceDetails));
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
    
    let sequence = Sequence(sequenceDetailsPrototype, collected.map(m => m.member));

    sequence.members.forEach(z => z.isSequence ? z.definingLink.sequences.push(sequence) : z.sequences.push(sequence));
    collected.forEach(member => member.endowingPointers.forEach(p => p.addValidSequenceEndowed(sequenceDetailsPrototype)));

    return sequence;
  }

  function clone() {
    return SequenceBuildingCursorInternal(sequenceDetailsPrototype, collected, [...remaining]);
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

function SequenceMember(member, sequenceDetails) {
  return Object.freeze({
    member,
    endowingPointers: sequenceDetails.map(d => d.endowingPointer)
  });
}
