export function SequencePrototype(type, end, definingLink, metalinkPointer) {
  let linkPointer = definingLink.pointer;
  return {
    type,
    end,
    definingLink,
    signature: {
      linkPointer,
      metalinkPointer,
      equals: s => linkPointer.denotesSame(s.linkPointer) && metalinkPointer.denotesSame(s.metalinkPointer)
    }
  };
}
