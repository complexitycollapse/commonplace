import { finalObject } from "@commonplace/core";
import { ZettelSegment } from "./zettel-segment";

export function TreeBuilder(zettel) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    if (remaining.length === 0) { return ZettelSegment([]); }
    return descend(undefined);
  }

  function descend(limits) {
    let segment = ZettelSegment([...(remaining[0].structuralEndsets)]);
    return gobble(limits, segment);
  }

  function ascend(child, limits) {
    let segmentEndsets = child.sharedEndsets(remaining[0], true);
    let segment = ZettelSegment(segmentEndsets);
    segment.children.push(child);
    return gobble(limits, segment);
  }

  function gobble(limits, segment) {
    for (let next = remaining[0]; remaining.length !== 0; next = remaining[0]) {
      
      // The next zettel breaks the limits of this one
      if (limits) {
        if (limits.endsetsNotInOther(next, true).length > 0 || 
        limits.sameEndsets(next, true)) {
          return segment;
        }
      }

      // The next zettel needs to belong to the parent segment
      if (segment.endsetsNotInOther(next, true).length > 0) {
        return ascend(segment, limits);
      }

      // The next zettel needs to belong to a child
      if (next.endsetsNotInOther(segment, true).length > 0) {
        segment.children.push(descend(segment));
      } else {
        // The next zettel should be added to this segment
        segment.children.push(next);
        remaining.shift();
      }
    }

    return segment;  
  }

  return finalObject(obj, {
    build
  });
}
