import { finalObject } from "@commonplace/core";
import { ZettelRegion } from "./zettel-region";

export function RegionBuilder(zettel) {
  let remaining = [...zettel];

  let obj = {};

  function build() {
    if (remaining.length === 0) { return ZettelRegion([]); }
    return descend(undefined);
  }

  function descend(limits) {
    let segment = ZettelRegion([...(remaining[0].structuralEndsets)]);
    return gobble(limits, segment);
  }

  function ascend(child, limits) {
    let segmentEndsets = child.sharedRenderEndsets(remaining[0], true);
    let segment = ZettelRegion(segmentEndsets);
    segment.children.push(child);
    return gobble(limits, segment);
  }

  function gobble(limits, segment) {
    for (let next = remaining[0]; remaining.length !== 0; next = remaining[0]) {
      
      // The next zettel breaks the limits of this one
      if (limits) {
        if (limits.renderEndsetsNotInOther(next, true).length > 0 || 
        limits.sameRenderEndsets(next, true)) {
          return segment;
        }
      }

      // The next zettel needs to belong to the parent segment
      if (segment.renderEndsetsNotInOther(next, true).length > 0) {
        return ascend(segment, limits);
      }

      // The next zettel needs to belong to a child
      if (next.renderEndsetsNotInOther(segment, true).length > 0) {
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
