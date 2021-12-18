import { finalObject, OriginHash } from "@commonplace/core";
import { Zettel } from "./zettel";

export function ZettelSchneider(edit, renderLinks = [], keyPrefix) {
  let obj = {};

  function zettel() {
    let hash = EndsetHash(renderLinks).build();

    let overlappingEntries = (hash.get([edit.origin])).filter(s => s.edit.overlaps(edit));
    let result = undefined;

    if (edit.editType === "span") {
      result = mapSpanToZettel(edit, overlappingEntries);
    } else {
      let singleZettel = Zettel(edit);
      overlappingEntries.forEach(e => singleZettel.addEndset(e.endset, e.link));
      result = [singleZettel];
    }

    if (keyPrefix) {
      result.forEach((z, index) => z.key = keyPrefix + "." + index.toString());
    }

    return result;
  }

  function mapSpanToZettel(span, overlappingEntries) {
    if (overlappingEntries.length == 0) { return [Zettel(span, [])]; }

    let overlappingEdit = overlappingEntries[0].edit;
    let remainingEntries = overlappingEntries.slice(1);
    let cropped = span.intersect(overlappingEdit);
    let subResults = [];

    if (cropped.start > span.start){
      subResults.push(mapSplitSpanToZettel(
        span.clone({ length: overlappingEdit.start - span.start }),
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
    var zettel = mapSpanToZettel(span, parentOverlappingSpans.filter(s => s.edit.overlaps(span)));

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
    let hash = OriginHash();

    links.forEach(l => {
      l.endsets.forEach(e => {
        pushEndset(l, e, hash);
      });
    });

    return hash;
  }

  function pushEndset(link, endset, hash) {
    endset.pointers.forEach(p => {
      if (p.isEdit) { hash.add(p.origin, { edit: p, endset, link }); }
    });
  }

  return { build };
}
