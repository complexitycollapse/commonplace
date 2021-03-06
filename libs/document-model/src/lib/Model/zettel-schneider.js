import { finalObject } from "@commonplace/utils";
import { Zettel } from "./zettel";

export function ZettelSchneider(clip, renderLinks = [], keyPrefix, containingEdl) {
  let obj = {};
  
  function zettel() {
    let clipEndLinks = buildClipEndLinks(renderLinks);
    let overlappingEntries = clipEndLinks.filter(s => s.clip.overlaps && s.clip.overlaps(clip));
    let result = undefined;

    if (clip.pointerType === "span") {
      result = mapSpanToZettel(clip, overlappingEntries);
    } else {
      let singleZettel = Zettel(clip, containingEdl);
      overlappingEntries.forEach(c => {
        singleZettel.addPointer(c.clip, c.end, c.link);
      });
      result = [singleZettel];
    }

    if (keyPrefix) {
      result.forEach((z, index) => z.key = keyPrefix + "." + index.toString());
    }

    return result;
  }

  function mapSpanToZettel(span, overlappingEntries) {
    if (overlappingEntries.length == 0) { return [Zettel(span, containingEdl)]; }

    let overlappingClip = overlappingEntries[0].clip;
    let remainingEntries = overlappingEntries.slice(1);
    let cropped = span.intersect(overlappingClip)[1];
    let subResults = [];

    if (cropped.start > span.start){
      subResults.push(mapSplitSpanToZettel(
        span.clone({ length: overlappingClip.start - span.start }),
        undefined,
        remainingEntries));
    }

    subResults.push(mapSplitSpanToZettel(
      cropped,
      overlappingEntries[0],
      remainingEntries));

    if (cropped.next < span.next) {
      subResults.push(mapSplitSpanToZettel(
        span.clone( { start: cropped.next, length: span.next - cropped.next }),
        undefined,
        remainingEntries));
    }

    let result = subResults.flat();
    return result;
  }

  function mapSplitSpanToZettel(span, coveringSpan, parentOverlappingSpans) {
    var zettel = mapSpanToZettel(span, parentOverlappingSpans.filter(s => s.clip.overlaps(span)));

    if (coveringSpan) {
      zettel.forEach(z => {
        z.addPointer(span, coveringSpan.end, coveringSpan.link);
      });
    }

    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function buildClipEndLinks(links) {
  let clipList = [];
  forEachPointer(links, (p, e, l) => {
    if (p.isClip) {
      clipList.push({ clip: p, end: e, link: l });
    }
  });
  return clipList;
}

function forEachPointer(links, callback) {
  links.forEach(link => { link.forEachPointer(callback); });
}
