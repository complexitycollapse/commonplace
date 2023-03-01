export function Sequence(sequencePrototype, members) {
  let sequence = {
    definingLink: sequencePrototype.definingLink,
    signature: sequencePrototype.signature,
    type: sequencePrototype.type,
    members,
    isSequence: true,
    isSubordinated: false
  };

  return sequence;
}
