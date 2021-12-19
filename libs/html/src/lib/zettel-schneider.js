import { finalObject, listTable } from "@commonplace/core";
import { Zettel } from "./zettel";

export function ZettelSchneider(clip, renderLinks = [], keyPrefix) {
  let obj = {};

  function zettel() {
    let hash = EndsetHash(renderLinks).build();

    let overlappingEntries = (hash.get([clip.origin])).filter(s => s.clip.overlaps(clip));
    let result = undefined;

    if (clip.clipType === "span") {
      result = mapSpanToZettel(clip, overlappingEntries);
    } else {
      let singleZettel = Zettel(clip);
      overlappingEntries.forEach(c => singleZettel.addEndset(c.endset, c.link));
      result = [singleZettel];
    }

    if (keyPrefix) {
      result.forEach((z, index) => z.key = keyPrefix + "." + index.toString());
    }

    return result;
  }

  function mapSpanToZettel(span, overlappingEntries) {
    if (overlappingEntries.length == 0) { return [Zettel(span, [])]; }

    let overlappingClip = overlappingEntries[0].clip;
    let remainingEntries = overlappingEntries.slice(1);
    let cropped = span.intersect(overlappingClip);
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
      zettel.forEach(z => z.addEndset(coveringSpan.endset, coveringSpan.link));
    }

    return zettel;
  }

  return finalObject(obj, {
    zettel
  });
}

function EndsetHash(links) {

  function build() {
    let hash = listTable();

    links.forEach(l => {
      l.endsets.forEach(e => {
        pushEndset(l, e, hash);
      });
    });

    return hash;
  }

  function pushEndset(link, endset, hash) {
    endset.pointers.forEach(p => {
      if (p.isClip) { hash.push(p.origin, { clip: p, endset, link }); }
    });
  }

  return { build };
}
