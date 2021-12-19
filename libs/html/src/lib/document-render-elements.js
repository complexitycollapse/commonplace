import { addProperties, addMethods, listTable } from '@commonplace/core';
import { ZettelSchneider } from '..';
import { RootFragment } from './fragment';
import { RenderLinkFactory } from './render-link-factory';

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
    return doc.clips.find(c => c.overlaps(fragment.clip));
  }

  function zettel() {
    if (!zettelCache) {
      let renderLinks = ensureRenderLinks();

      let clipToZettel = (clip, index) =>
        ZettelSchneider(clip, renderLinks, index.toString())
          .zettel();

      zettelCache = doc.clips.map(clipToZettel).flat();
    }
    return zettelCache;
  }

  function ensureRenderLinks() {
    if (!renderLinksCache) {
      renderLinksCache = RenderLinkFactory(doc, links).renderLinks();
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

    let hash = listTable();
    fragments.forEach(f => hash.push(f.clip.origin, f));

    for(let key of hash.keys()) {
      let frags = hash.get(key);
      for(let i = 0; i < frags.length; ++i) {
        let overlapping = false;
        for(let j = 0; j < frags.length; ++j) {
          if (j !== i && frags[i].clip.overlapingButNotEngulfing(frags[j].clip)){
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
