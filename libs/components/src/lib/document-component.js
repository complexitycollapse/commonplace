import ZettelComponent from './zettel-component';
import ZettelSchneider from '@commonplace/html';
import styled from '@emotion/styled';
const StyledComponents = styled.div`
  color: pink;
`;
export function DocumentComponent({ doc }) {
  let zettelLists = [];
  
  doc.edits.editSource().forEach(e => {
    zettelLists.push(ZettelSchneider(e).zettel());
  });

  let zettel = zettelLists.flat();

  return (
    <div>
      { zettel.map(z => (<ZettelComponent zettel={z}></ZettelComponent>))}
    </div>
  );
}
export default Document;
