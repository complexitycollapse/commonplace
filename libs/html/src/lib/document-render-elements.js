import { addProperties, addMethods, listMap } from '@commonplace/core';
import { ManyZettelSchneider } from './zettel-schneider';
import { RegionBuilder } from './region-builder';
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
      zettelCache = ManyZettelSchneider(doc.clips, renderLinks).zettel();
    }
    return zettelCache;
  }

  function zettelTree() {
    let zs = zettel();
    return RegionBuilder(zs).build();
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

    let hash = listMap();
    fragments.forEach(f => hash.push(f.clip.origin, f));

    for(let [_, frags] of hash.entries()) {
      for(let i = 0; i < frags.length; ++i) {
        let overlapping = false;
        for(let j = 0; j < frags.length; ++j) {
          if (j !== i && frags[i].clip.overlappingButNotEngulfing(frags[j].clip)){
            overlappingLinksCache.push(frags[i]);
            overlapping = true;
            break;
          }
        }
        if (!overlapping) { fragmentTreeCache.tryAddFragment(frags[i]); }
      }
    }
  }

  addMethods(obj, {
    fragmentTree,
    overlappingLinks,
    zettel,
    zettelTree
  });

  return obj;
}
