import { ZettelComponent } from "./zettel-component";

export function BoxComponent({ box }) {
  let boxChildren = box.members.length > 0 && box.members[0].isBox;

  let innerComponents = boxChildren ? box.members.map(m => (<BoxComponent key={m.key} box={m} />))
    : box.members.map(m => (<ZettelComponent key={m.key} zettel={m} />));

  return (<cpla-box cpla-key={box.key}><div>{innerComponents}</div></cpla-box>);
}
