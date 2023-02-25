export function SequencePrototype(rule, end, definingLink) {
  let linkPointer = definingLink.pointer, metalinkPointer = rule.originLink.pointer;
  return {
    type: rule.type,
    end,
    definingLink,
    signature: {
      linkPointer,
      metalinkPointer,
      equals: s => linkPointer.denotesSame(s.linkPointer) && metalinkPointer.denotesSame(s.metalinkPointer)
    }
  };
}
