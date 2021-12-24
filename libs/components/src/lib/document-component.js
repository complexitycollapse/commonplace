import { ZettelFragment } from './zettel-fragment';
import { ManyZettelSchneider, RenderLinkFactory, TreeBuilder } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToDoc } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docName, cache, fetcher }) {

  let [fragmentState, setFragmentState] = useState(TreeBuilder([]).build());

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(clip, isObject) {
        let content = isObject ? cache.getObject(clip) : cache.getPart(clip);
        if (content) {
          return [true, isObject ? content : content];
        } else {
        return isObject ? [false, leafDataToLink(await fetcher.getObject(clip))] : [false, Part(clip, await fetcher.getPart(clip))];
        }
      }

      async function loadAll(iterable, areObjects) {
        let results = await Promise.all(iterable.map(item => loadContent(item, areObjects)));
        results.forEach(r => {
          if (!r[0]) { areObjects? cache.addObject(r[1]) : cache.addPart(r[1]); }
        });

        return results.map(r => r[1]);
      }

      let doc = cache.getObject(docName) || leafDataToDoc(await fetcher.getObject(docName));
      let rawLinks = (await loadAll(doc.overlay, true));
      let links = RenderLinkFactory(doc, rawLinks).renderLinks();
      let zettel = ManyZettelSchneider(doc.clips, links).zettel();
      let tree = TreeBuilder(zettel).build();
      console.log(tree);
      //let fragment = fragmentize(zettel);

      let parts = await loadAll(doc.clips, false);

      parts.forEach(part => {
        zettel.forEach(z => {
          if (part.engulfs(z.clip)) { z.content = part.content.substring(z.clip.start, z.clip.next); }
        });
      });

      setFragmentState(tree);
    }

    loadDoc();
  }, []);

  return (
    <div>
      <ZettelFragment key="froot" node={fragmentState}/>
    </div>
  );
}

export default Document;

function fragmentize(zettel) {
  let i = 0;
  let previous = undefined;

  function doFragment(endset) {
    let list = [];

    while(i < zettel.length
      && (endset === undefined || zettel[i].hasModifiedEndset(endset))) {
      let newEndsets = zettel[i].endsetsNotInOther(previous);
      let nextEndset = newEndsets.find(e => e !== endset && e.link.type === "paragraph");
      if (nextEndset) {
        list.push(doFragment(nextEndset));
      } else {
        list.push({frag: false, zettel: zettel[i], key: zettel.key});
      previous = zettel[i];
      ++i;
      }
    }
  
    return {frag: true, children: list, link: endset?.link, key: "f" + i.toString() };    
  }

  return doFragment(undefined);
}
