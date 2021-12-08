import { ZettelComponent } from './zettel-component';
import { ZettelSchneider } from '@commonplace/html';
import styled from '@emotion/styled';
const StyledComponents = styled.div`
  color: pink;
`;
export function DocumentComponent({ doc }) {
  let zettel = doc.edits.edits.map(ZettelSchneider).flat();

  // Hack in some hard-coded content
  zettel[0].content = "This is Hypertext";
  zettel[1].content = "Here we have a long spans whose purpose is to show that text can be wrapped, formatted as paragraphs, and " + 
  "similar things. It will hopefully be long enough to wrap across several lines when it's rendered but you never know as high def" + 
  " screens are quite wide.";
  zettel[2].content = "Here is a second paragraph. This one doesn't have to be quite as long.";

  return (
    <div>
      { zettel.map(z => (<ZettelComponent zettel={z}></ZettelComponent>))}
    </div>
  );
}
export default Document;
