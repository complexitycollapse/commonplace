import { finalObject } from "@commonplace/core";
import { Zettel } from "./zettel";

export function ZettelSchneider(edit, links = [], keyPrefix) {
  let obj = {};

  function zettel() {
    let hash = EndsetHash(links).build();

    let overlappingEntries = (hash[edit.origin] ?? []).filter(s => s.edit.overlaps(edit));
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
    let hash = {};

    links.forEach(l => {
      l.endsets.forEach(e => {
        if (e.hasEdits) { pushEditEndset(l, e, hash); }
      });
    });

    return hash;
  }

  function pushEditEndset(link, endset, hash) {
    endset.pointer.forEach(e => {
      pushAdd(hash, e, endset, link);
    });
  }

  return { build };
}

function pushAdd(hash, edit, endset, link) {
  let entry = { edit, endset, link }, list = hash[edit.origin];
  if (list) { list.push(entry); }
  else { hash[edit.origin] = [entry]; }
}
