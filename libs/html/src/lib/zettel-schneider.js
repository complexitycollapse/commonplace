import { addMethods } from "@commonplace/core";
import { Zettel } from "./zettel";

export function ZettelSchneider(edits, links) {
  let obj = {};

  function zettel() {
    let hash = buildEndsetHash();

    function splitEdit(edit) {
      let overlappingEntries = (hash[edit.origin] ?? []).filter(s => s.edit.overlaps(edit));

      if (edit.editType === "span") {
        return mapSpanToZettel(edit, overlappingEntries);
      } else {
        let result = Zettel(edit);
        overlappingEntries.forEach(e => result.addEndset(e.endset, e.link));
        return [result];
      }
    }

    let result = [];

    edits.forEach(e => {
      let zettel = splitEdit(e);
      result = result.concat(zettel);
    });

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

  function buildEndsetHash() {
    let hash = {};

    links.forEach(l => {
      l.endsets.forEach(e => {
        if (e.hasEdits) { pushEditEndset(l, e, hash); }
      });
    });

    return hash;
  }

  function pushEditEndset(link, endset, hash) {
    endset.set.forEach(e => {
      pushAdd(hash, e, endset, link);
    });
  }

  function pushAdd(hash, edit, endset, link) {
    let entry = { edit, endset, link }, list = hash[edit.origin];
    if (list) { list.push(entry); }
    else { hash[edit.origin] = [entry]; }
  }

  addMethods(obj, {
    zettel
  });

  return obj;
}
