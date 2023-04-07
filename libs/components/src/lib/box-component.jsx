import { ZettelComponent } from "./zettel-component";

export function BoxComponent({ box }) {
  let boxChildren = box.members.length > 0 && box.members[0].isBox;

  let innerComponents = boxChildren ? box.members.map(m => (<BoxComponent box={m} />))
    : box.members.map(m => (<ZettelComponent zettel={m} />));

  return (<cpla-box><div>{innerComponents}</div></cpla-box>);
}
