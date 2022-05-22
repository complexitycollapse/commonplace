import { finalObject } from "../utils";
import { Zettel } from "./zettel";

export function ZettelSchneider(clip, renderLinks = [], keyPrefix, containingEdl) {
  let obj = {};
  let clipEndsetLinks = buildClipEndsetLinks(renderLinks);
  
  function zettel() {
    let overlappingEntries = clipEndsetLinks.filter(s => s.clip.overlaps && s.clip.overlaps(clip));
    let result = undefined;

    if (clip.pointerType === "span") {
      result = mapSpanToZettel(clip, overlappingEntries);
    } else {
      let singleZettel = Zettel(clip, containingEdl);
      overlappingEntries.forEach(c => {
        singleZettel.addPointer(c.clip, c.endset, c.link);
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
        z.addPointer(span, coveringSpan.endset, coveringSpan.link);
      });
    }

    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function buildClipEndsetLinks(links) {
  let list = [];
  forEachClipPointer(links, (p, e, l) => {
    if (p.isClip) { list.push(buildClipEndsetLink(p, e, l)) };
  });
  return list;
}

function buildClipEndsetLink(clip, endset, link) {
  return { clip, endset, link };
}

function forEachClipPointer(links, callback) {
  links.forEach(link => {
    link.endsets.forEach(endset => {
      endset.pointers.forEach(pointer => {
        if (pointer.isClip) {
          callback(pointer, endset, link);
        }
      });
    });
  });
}
