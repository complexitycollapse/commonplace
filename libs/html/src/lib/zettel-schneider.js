import { finalObject, listTable } from "@commonplace/core";
import { Zettel } from "./zettel";

export function ManyZettelSchneider(clips, renderLinks = []) {
  return finalObject({}, {
    zettel() {
      let hash = makeEndsetHash(renderLinks);

      let clipToZettel = (clip, index) => {
        return ZettelSchneider(clip, hash.get(clip.origin), index.toString())
          .zettel();
      }
    
      let zettel = clips.map(clipToZettel).flat();
      return zettel;
    }
  });
}

export function SingleZettelSchneider(clip, renderLinks = [], keyPrefix) {
  return finalObject({}, {
    zettel() {
      return ZettelSchneider(clip, buildClipEndsetLinks(renderLinks), keyPrefix).zettel();
    }
  });
}

export function ZettelSchneider(clip, clipEndsetLinks, keyPrefix) {
  let obj = {};

  function zettel() {
    let overlappingEntries = clipEndsetLinks.filter(s => s.clip.overlaps(clip));
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

function makeEndsetHash(links) {
  let hash = listTable();
  forEachClipPointer(links, (p, e, l) => {
    if (p.isClip) { hash.push(p.origin, buildClipEndsetLink(p, e, l)); }
  });
  return hash;
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
