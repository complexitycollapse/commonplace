import { memoize } from "@commonplace/utils";
import { BaseRenderLink } from "../Model/render-link";

export function SequenceMetalink(pointer, link, homeEdl, linkIndex) {
  let groupDetails = memoize(calculateDetails);

  function metaSequenceDetailPrototypessFor(renderEnd, metaEnd) {
    if (metaEnd.end.name !== "target") { return undefined; }
    let endName = renderEnd.name;
    let details = groupDetails();
    if (details.sequenceEndNames.findIndex(n => n === endName) === -1) { return undefined; }
    else {
      let linkPointer = renderEnd.renderLink.pointer;
      let metalinkPointer = metaEnd.renderLink.pointer;
      let signature = {
        linkPointer,
        metalinkPointer,
        equals: s => linkPointer.denotesSame(s.linkPointer) && metalinkPointer.denotesSame(s.metalinkPointer)
      };
      return {
        type: details.type, 
        end: renderEnd.end,
        signature,
        definingLink: renderEnd.renderLink
      };
    }
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, linkIndex, { metaSequenceDetailPrototypessFor });

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
