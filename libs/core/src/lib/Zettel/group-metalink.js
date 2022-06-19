import { finalObject, memoize } from "../utils";
import { BaseRenderLink } from "./render-link";

export function GroupMetalink(pointer, link, homeEdl) {
  let groupDetails = memoize(calculateDetails);

  function metaGroupletBuilderFor(pointer, metaPointer) {
    if (metaPointer.renderEnd.end.name !== "target") { return undefined; }
    let endName = pointer.renderEnd.name;
    let details = groupDetails();
    if (details.groupletEndNames.findIndex(n => n === endName) === -1) { return undefined; }
    else { return GroupletBuilder(details.type, pointer.renderEnd.end); }
  }

  let obj = BaseRenderLink(pointer, link, homeEdl, { metaGroupletBuilderFor });

  function calculateDetails() {
    let type, groupletEndNames = [];

    obj.renderEnds.forEach(r => {
      switch (r.end.name) {
        case "type":
          type = r.concatatext();
          break;
        case undefined:
          groupletEndNames.push(r.concatatext());
          break;
      }
    });

    return { type, groupletEndNames };
  }

  return obj;
}

function GroupletBuilder(type, end) {
  let obj = {};
  let remaining = [...end.pointers];
  let current = undefined;
  let invalidated = false;

  function consumePointer(pointer) {
    if (current === undefined) { current = remaining.shift(); }
    if (current.denotesSame(pointer)) {
      current = undefined;
    } else {
      invalidated = true;
    }

    return invalidated;
  }

  return finalObject(obj, {
    consumePointer
  });
}
