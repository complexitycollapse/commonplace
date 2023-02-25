import { finalObject } from "@commonplace/utils";
import { Zettel } from "./zettel";

export function ZettelSchneider2(clip, links = []) {
  let obj = {};
  
  function zettel() {
    let clipEndLinks = buildPointerEndLinks(links);
    let overlappingEntries = clipEndLinks.filter(s => s.pointer.overlaps && s.pointer.overlaps(clip));
    let result = undefined;

    if (clip.pointerType === "span") {
      result = mapSpanToZettel(clip, overlappingEntries);
    } else {
      let singleZettel = Zettel(clip, overlappingEntries);
      result = [singleZettel];
    }

    return result;
  }

  function mapSpanToZettel(span, overlappingEntries, linksToAdd = []) {
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
      let newLinkPointer = LinkPointer(coveringSpan.pointer, coveringSpan.end, coveringSpan.link);
      newLinksToAdd = linksToAdd.concat([newLinkPointer]);
    }
    
    let zettel = mapSpanToZettel(span, parentOverlappingSpans.filter(s => s.pointer.overlaps(span)), newLinksToAdd);
    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function buildPointerEndLinks(links) {
  let clipList = [];
  links.forEach(l => l.forEachPointer((p, e, l) => {
    if (p.isClip) {
      clipList.push(LinkPointer(p, e, l));
    }
  }));
  return clipList;
}

function LinkPointer(clip, end, link) {
  return { pointer: clip, end, link };
}