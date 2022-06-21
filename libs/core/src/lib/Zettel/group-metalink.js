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
          if (r.end.pointers.length > 0) { groupletEndNames.push(r.concatatext()); }
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
  let validSoFar = true;
  let collected = [];

  function consumePointer(zettel) {
    if (validSoFar === false) { return false; }
    if (isComplete()) { return true; }

    if (current === undefined) { current = remaining.shift(); }
    
    let { nibbled, remainder } = current.nibble(zettel.clip);

    if (nibbled) {
      current = remainder;
    } else {
      validSoFar = false;
    }

    collected.push(zettel);
    return validSoFar;
  }

  function isComplete() {
    return validSoFar && current === undefined && remaining.length === 0;
  }

  return finalObject(obj, {
    consumePointer,
    isComplete
  });
}
