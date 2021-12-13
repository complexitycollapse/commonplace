import { ZettelFragment } from './zettel-fragment';
import { ZettelSchneider, RenderLink } from '@commonplace/html';
import { leafDataToLink, Part, leafDataToDoc } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docName, cache, fetcher }) {

  let [fragmentState, setFragmentState] = useState(fragmentize([]));

  useEffect(() => {
    async function loadDoc() {
      async function loadContent(edit, isObject) {
        let content = isObject ? cache.getObject(edit) : cache.getPart(edit);
        if (content) {
          return [true, isObject ? content : content];
        } else {
        return isObject ? [false, leafDataToLink(await fetcher.getObject(edit))] : [false, Part(edit, await fetcher.getPart(edit))];
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
      let links = (await loadAll(doc.overlay, true)).map(RenderLink);
      let zettel = doc.edits.map((e, index) => ZettelSchneider(e, links, index.toString()).zettel()).flat();
      let fragment = fragmentize(zettel);

      let parts = await loadAll(doc.edits, false);

      parts.forEach(part => {
        zettel.forEach(z => {
          if (part.engulfs(z.edit)) { z.content = part.content.substring(z.edit.start, z.edit.next); }
        });
      });

      setFragmentState(fragment);
    }

    loadDoc();
  }, []);

  // Hack in some hard-coded content
  // zettel[0].content = "This is Hypertext";
  // zettel[1].content = "Here we have a long spans whose purpose is to show that text can be wrapped, formatted as paragraphs, and " + 
  // "similar things. It will hopefully be long enough to wrap across several lines when it's rendered but you never know as high def" + 
  // " screens are quite wide.";
  // zettel[2].content = "Here is a second paragraph. This one doesn't have to be quite as long.";
  // let titleLink = RenderLink(leafDataToLink());
  // zettel[0].addEndset(titleLink.endsets[0], titleLink);
  // let testLink = RenderLink(leafDataToLink({typ: "paragraph", es: [{ptr: [{typ: "span", ori: "origin", st: 100, ln: 1000}]}]}));
  // zettel[1].addEndset(testLink.endsets[0], testLink);
  // let italics = RenderLink(leafDataToLink({typ: "italics", es: [{ptr: [{typ: "span", ori:"origin", st: 2100, ln: 50}]}]}));
  // zettel[2].addEndset(italics.endsets[0], italics);
  // let bold = RenderLink(leafDataToLink({typ: "bold", es: [{ptr: [{typ: "span", ori:"origin", st: 2100, ln: 50}]}]}));
  // zettel[2].addEndset(bold.endsets[0], bold);

  return (
    <div>
      <ZettelFragment key="froot" fragment={fragmentState}/>
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
