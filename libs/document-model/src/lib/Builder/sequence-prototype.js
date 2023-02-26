import { addProperties, finalObject } from "@commonplace/utils";

export function SequencePrototype(type, end, definingLink, metalinkPointer) {
  let linkPointer = definingLink.pointer;
  let obj = addProperties({}, {
    type,
    end,
    definingLink,
    signature: {
      linkPointer,
      metalinkPointer,
      equals: s => linkPointer.denotesSame(s.linkPointer) && metalinkPointer.denotesSame(s.metalinkPointer)
  }
  });

  return finalObject(obj, {});
}
