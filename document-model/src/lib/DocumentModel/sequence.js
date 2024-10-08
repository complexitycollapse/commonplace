import { addMethods, addUnenumerable } from "@commonplace/utils";

export function Sequence(sequencePrototype, members) {
  let sequence = {
    definingLink: sequencePrototype.definingLink,
    signature: sequencePrototype.signature,
    type: sequencePrototype.type,
    members,
    isSequence: true,
    isSubordinated: false,
    key: undefined,
    getContainers: sequencePrototype.definingLink.getContainers,
    getClasses: sequencePrototype.definingLink.getClasses,
    hasClasses: sequencePrototype.definingLink.hasClasses,
    getLevels: sequencePrototype.definingLink.getLevels
  };

  addUnenumerable(sequence, "parent", undefined, true);

  addMethods(sequence, {
    getRoot: () => sequence.isSubordinated ? sequence.parent.getRoot() : sequence
  });

  return sequence;
}
