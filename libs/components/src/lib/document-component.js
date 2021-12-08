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

  let fragments = fragmentize(zettel);

  return (
    <div>
      {fragments.map(f => f?.frag ? (<ZettelFragment children={f.children} link={f.link}/>) : <ZettelComponent zettel = {f}/>)}
    </div>
  );
}
export default Document;

function fragmentize(zettel) {
  let i = 0;
  function doFragment(endset) {
    let list = [];

    while(zettel[i].hasModifiedEndset(endset)) {
      list.push(zettel[i]);
      ++i;
    }
  
    return list;    
  }

  let list = [];

  while(i < zettel.length) {
    let endset = zettel[i].endsets.find(e => e.link.type === "paragraph");
    if (endset) {
      list.push({frag: true, children: doFragment(endset), link: endset.link });
    } else {
      list.push(zettel[i]);
      ++i;
    }
  }
  
  return list;
}
