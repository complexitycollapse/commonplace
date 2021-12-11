import { ZettelFragment } from './zettel-fragment';
import { ZettelSchneider, RenderLink } from '@commonplace/html';
import { leafDataToLink, Doc, Part, leafDataToDoc } from '@commonplace/core';
import { useState, useEffect } from 'react';

export function DocumentComponent({ docName, cache, fetcher }) {

  let [fragmentState, setFragmentState] = useState(fragmentize([]));

  useEffect(() => {
    async function loadDoc() {
      console.log(docName);
      let doc = cache.getObject(docName) || leafDataToDoc(await fetcher.getObject(docName));
      let zettel = doc.edits.edits.map((e, index) => ZettelSchneider(e, [], index.toString()).zettel()).flat();
      let fragment = fragmentize(zettel);
      
      async function loadContent(edit) {
        let content = cache.getObject(edit);
        let part = content
          ? [true, Part(edit, Promise.resolve(content))]
          : [false, Part(edit, await fetcher.getPart(edit))];

        return part;
      }

      let results = await Promise.all(doc.edits.edits.map(loadContent));
      results.forEach(r => {
        if (!r[0]) { cache.addPart(r[1]); }
      });

      let parts = results.map(r => r[1]);

      parts.forEach(part => {
        zettel.forEach(z => {
          if (part.engulfs(z.edit)) { z.content = part.content; }
        });
      });

      setFragmentState(fragment);
    }

    loadDoc();
  });

  // Hack in some hard-coded content
  // zettel[0].content = "This is Hypertext";
  // zettel[1].content = "Here we have a long spans whose purpose is to show that text can be wrapped, formatted as paragraphs, and " + 
  // "similar things. It will hopefully be long enough to wrap across several lines when it's rendered but you never know as high def" + 
  // " screens are quite wide.";
  // zettel[2].content = "Here is a second paragraph. This one doesn't have to be quite as long.";
  // let titleLink = RenderLink(leafDataToLink({typ: "title", es: [{ptr: [{typ: "span", ori: "origin", st: 0, ln: 10}]}]}));
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
