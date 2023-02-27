import { finalObject } from "@commonplace/utils";
import { Sequence } from "./sequence";

// Attempts to incrementally build a sequence for a particular SequencePrototype, either succeeding
// if the passed zettel and sequences that match the SequencePrototype, or failing if they don't.
export function SequenceBuildingCursor2(sequencePrototype) {
  return SequenceBuildingCursorInternal(sequencePrototype, [], [...sequencePrototype.end.pointers]);
}

function SequenceBuildingCursorInternal(sequencePrototype, collected, remaining) {
  let obj = {};
  let signature = sequencePrototype.signature;
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
      nestedSequencesStack.unshift([...currentSequenceElement.members]);
      return consumeZettelInNestedSequence(zettel);
    }

    return currentSequenceElement.pointer.denotesSame(zettel.pointer);
  }

  function consumeZettelAtTopLevel(zettel) {
    let sequencePrototypes = zettel.sequencePrototypes().filter(p => signature.equals(p.signature));
    if (sequencePrototypes.length === 0) {
      validSoFar = false;
      return;
    }

    if (current === undefined) { current = remaining.shift(); }
    
    let { nibbled, remainder } = current.nibble(zettel.pointer);

    if (nibbled) {
      current = remainder;
      collected.push(SequenceMember(zettel, sequencePrototypes));
    } else {
      validSoFar = false;
    }
  }

  function consumeSequence(sequence) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    let definingLink = sequence.definingLink;

    let sequencePrototypes = definingLink.sequencePrototypes().filter(p => signature.equals(p.signature));
    if (sequencePrototypes.length === 0) {
      validSoFar = false;
      return false;
    }

    let next = remaining.shift();

    let matches = next.denotesSame(definingLink.pointer);

    if (matches) {
      collected.push(SequenceMember(sequence, sequencePrototypes));
    } else {
      validSoFar = false;
    }

    nestedSequencesStack.unshift([...sequence.members]);
    return validSoFar;
  }

  function isComplete() {
    return validSoFar && current === undefined && remaining.length === 0 && nestedSequencesStack.length === 0;
  }

  function pushSequence() {
    if (!isComplete()) {
      throw "Cannot reify incomplete sequence";
    }
    
    let sequence = Sequence(sequencePrototype, collected.map(m => m.member));

    sequence.members.forEach(z => z.isSequence ? z.definingLink.sequences.push(sequence) : z.sequences.push(sequence));

    return sequence;
  }

  function clone() {
    return SequenceBuildingCursorInternal(sequencePrototype, collected, [...remaining]);
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

function SequenceMember(member, sequencePrototypes) {
  // TODO SequencePrototype doesn't even have an endowingPointer property.
  // Wrong name or not needed?
  return Object.freeze({
    member,
    endowingPointers: sequencePrototypes.map(p => p.endowingPointer)
  });
}
