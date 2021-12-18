import { addProperties, addMethods, OriginHash } from '@commonplace/core';
import { ZettelSchneider } from '..';
import { RootFragment } from './fragment';
import { RenderLink } from './render-link';

export function DocumentRenderElements(doc, links) {
  let renderLinksCache = undefined;
  let fragmentTreeCache = undefined;
  let zettelCache = undefined;
  let overlappingLinksCache = undefined;

  let obj = {};

  addProperties(obj, {
    doc,
    links
  });

  function fragmentTree() {
    if (!fragmentTreeCache) {
      buildFragmentTree();
    }
    return fragmentTreeCache;
  }

  function inDoc(fragment) {
    return doc.edits.find(e => e.overlaps(fragment.edit));
  }

  function zettel() {
    if (!zettelCache) {
      let renderLinks = ensureRenderLinks();

      let editToZettel = (edit, index) =>
        ZettelSchneider(edit, renderLinks, index.toString())
          .zettel();

      zettelCache = doc.edits.map(editToZettel).flat();
    }
    return zettelCache;
  }

  function ensureRenderLinks() {
    if (!renderLinksCache) {
      renderLinksCache = links.map(l => RenderLink(l));
    }
    return renderLinksCache;
  }

  function overlappingLinks() {
    if (!overlappingLinksCache) {
      buildFragmentTree();
    }
    return overlappingLinksCache;
  }

  function buildFragmentTree() {
    fragmentTreeCache = RootFragment();
    let links = ensureRenderLinks();
    let fragments = links.map(l => l.fragments().filter(inDoc)).flat();
    overlappingLinksCache = [];

    let hash = OriginHash();
    fragments.forEach(f => hash.add(f.edit.origin, f));

    for(let key of hash.keys()) {
      let frags = hash.get(key);
      for(let i = 0; i < frags.length; ++i) {
        let overlapping = false;
        for(let j = 0; j < frags.length; ++j) {
          if (j !== i && frags[i].edit.overlapingButNotEngulfing(frags[j].edit)){
            overlappingLinksCache.push(frags[i]);
            overlapping = true;
            break;
          }
        }
        if (!overlapping) { fragmentTreeCache.tryAdd(frags[i]); }
      }
    }
  }

  addMethods(obj, {
    fragmentTree,
    overlappingLinks,
    zettel
  });

  return obj;
}
