import { finalObject, memoize } from "@commonplace/utils";
import { BaseRenderLink } from "../Model/render-link";

export function SequenceMetalink(pointer, link, homeEdl) {
  let groupDetails = memoize(calculateDetails);

  function metaSequenceDetailsFor(pointer, metaPointer) {
    if (metaPointer.renderEnd.end.name !== "target") { return undefined; }
    let endName = pointer.renderEnd.name;
    let details = groupDetails();
    if (details.sequenceEndNames.findIndex(n => n === endName) === -1) { return undefined; }
    else {
      let linkPointer = pointer.renderLink.pointer;
      let metalinkPointer = pointer.renderLink.pointer;
      let signature = {
        linkPointer,
        metalinkPointer,
        equals: s => linkPointer.denotesSame(s.linkPointer) && metalinkPointer.denotesSame(s.metalinkPointer)
      };
      return {
        type: details.type, 
        end: pointer.renderEnd.end,
        signature,
        link: pointer.renderLink
      };
    }
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, { metaSequenceDetailsFor });

  function calculateDetails() {
    let type, sequenceEndNames = [];

    obj.renderEnds.forEach(r => {
      switch (r.end.name) {
        case "type":
          type = r.concatatext();
          break;
        case undefined:
          if (r.end.pointers.length > 0) { sequenceEndNames.push(r.concatatext()); }
          break;
      }
    });

    return { type, sequenceEndNames };
  }

  return obj;
}
