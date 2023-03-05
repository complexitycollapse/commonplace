import { finalObject } from "@commonplace/utils";
import { IncomingPointer } from "./incoming-pointer";
import { Zettel } from "./zettel";

export function ZettelSchneider(clip, links, parentKey, index) {
  let obj = {};
  
  function zettel() {
    let incomingPointers = buildIncomingPointers(links, clip);
    let rootKey = parentKey + ":" + index.toString();

    if (clip.pointerType === "span") {
      let result = mapSpanToZettel(clip, incomingPointers, []);
      return result.map((z, i) => Zettel(z.clip, z.incomingPointers, rootKey + ":" + i));

    } else {
      let singleZettel = Zettel(clip, incomingPointers, rootKey);
      return [singleZettel];
    }
  }

  function mapSpanToZettel(span, overlappingEntries, linksToAdd) {
    if (overlappingEntries.length == 0) { return [Zettel(span, linksToAdd)]; }

    let overlappingClip = overlappingEntries[0].pointer;
    let remainingEntries = overlappingEntries.slice(1);
    let cropped = span.intersect(overlappingClip)[1];
    let subResults = [];

    if (cropped.start > span.start){
      subResults.push(mapSplitSpanToZettel(
        span.clone({ length: overlappingClip.start - span.start }),
        undefined,
        remainingEntries,
        linksToAdd));
    }

    subResults.push(mapSplitSpanToZettel(
      cropped,
      overlappingEntries[0],
      remainingEntries,
      linksToAdd));

    if (cropped.next < span.next) {
      subResults.push(mapSplitSpanToZettel(
        span.clone( { start: cropped.next, length: span.next - cropped.next }),
        undefined,
        remainingEntries,
        linksToAdd));
    }

    let result = subResults.flat();
    return result;
  }

  function mapSplitSpanToZettel(span, coveringSpan, parentOverlappingSpans, linksToAdd) {
    let newLinksToAdd = linksToAdd;
    if (coveringSpan) {
      let newLinkPointer = IncomingPointer(coveringSpan.pointer, coveringSpan.end, coveringSpan.link);
      newLinksToAdd = linksToAdd.concat([newLinkPointer]);
    }
    
    let zettel = mapSpanToZettel(span, parentOverlappingSpans.filter(s => s.pointer.overlaps(span)), newLinksToAdd);
    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function buildIncomingPointers(links, clip) {
  let clipList = [];
  links.forEach(l => l.forEachPointer((p, e, l) => {
    if (p.isClip && p.overlaps && p.overlaps(clip)) {
      clipList.push(IncomingPointer(p, e, l));
    }
  }));
  return clipList;
}
