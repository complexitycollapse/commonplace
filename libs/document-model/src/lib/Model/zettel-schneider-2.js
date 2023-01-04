import { finalObject } from "@commonplace/utils";

export function ZettelSchneider2(clip, links = []) {
  let obj = {};
  
  function zettel() {
    let clipEndLinks = buildClipEndLinks(links);
    let overlappingEntries = clipEndLinks.filter(s => s.clip.overlaps && s.clip.overlaps(clip));
    let result = undefined;

    if (clip.pointerType === "span") {
      result = mapSpanToZettel(clip, overlappingEntries);
    } else {
      let singleZettel = Zettel2(clip, overlappingEntries);
      result = [singleZettel];
    }

    return result;
  }

  function mapSpanToZettel(span, overlappingEntries, linksToAdd = []) {
    if (overlappingEntries.length == 0) { return [Zettel2(span, linksToAdd)]; }

    let overlappingClip = overlappingEntries[0].clip;
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
      let newLinkPointer = LinkPointer(coveringSpan.clip, coveringSpan.end, coveringSpan.link);
      newLinksToAdd = linksToAdd.concat([newLinkPointer]);
    }
    
    let zettel = mapSpanToZettel(span, parentOverlappingSpans.filter(s => s.clip.overlaps(span)), newLinksToAdd);
    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function buildClipEndLinks(links) {
  let clipList = [];
  links.forEach(l => l.forEachPointer((p, e, l) => {
    if (p.isClip) {
      clipList.push(LinkPointer(p, e, l));
    }
  }));
  return clipList;
}

function Zettel2(clip, linkPointers) {
  return { clip, linkPointers };
}

function LinkPointer(clip, end, link) {
  return { clip, end, link };
}