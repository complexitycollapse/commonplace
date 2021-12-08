import { ZettelFragment } from './zettel-fragment';
import { ZettelSchneider } from '@commonplace/html';
import styled from '@emotion/styled';
import { ZettelComponent } from './zettel-component';
import { leafDataToLink } from '@commonplace/core';
const StyledComponents = styled.div`
  color: pink;
`;
export function DocumentComponent({ doc }) {
  let zettel = doc.edits.edits.map(e => ZettelSchneider(e).zettel()).flat();
  

  // Hack in some hard-coded content
  zettel[0].content = "This is Hypertext";
  zettel[1].content = "Here we have a long spans whose purpose is to show that text can be wrapped, formatted as paragraphs, and " + 
  "similar things. It will hopefully be long enough to wrap across several lines when it's rendered but you never know as high def" + 
  " screens are quite wide.";
  zettel[2].content = "Here is a second paragraph. This one doesn't have to be quite as long.";

  let testLink = leafDataToLink({typ: "paragraph", es: [["", {typ: "span", ori: "origin", st: 100, ln: 1000}]]});
  zettel[1].addEndset(testLink.endsets[0], testLink);

  let fragment = fragmentize(zettel);

  return (
    <div>
      <ZettelFragment fragment={fragment}/>
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
        list.push({frag: false, zettel: zettel[i]});
      previous = zettel[i];
      ++i;
      }
    }
  
    return {frag: true, children: list, link: endset?.link };    
  }

  return doFragment(undefined);
}
