import { CssStyle } from "@commonplace/html";
import { ZettelComponent } from "./zettel-component";

export function BoxComponent({ box }) {
  let style = CssStyle(box).css();
  let boxChildren = box.members.length > 0 && box.members[0].isBox;

  let innerComponents = boxChildren ? box.members.map(m => (<BoxComponent key={m.key} box={m} />))
    : box.members.map(m => (<ZettelComponent key={m.key} zettel={m} />));

  if (box.markup.get("list")) {
    let listItems = innerComponents.map(component => (<li key={component.key}>{component}</li>));
    if (style["listStyleType"] === "numeric") {
      return (<cpla-box key={box.key} cpla-key={box.key} style={style}><ol>{listItems}</ol></cpla-box>);
    } else {
      return (<cpla-box key={box.key} cpla-key={box.key} style={style}><ul>{listItems}</ul></cpla-box>);
    }
  } else {
    return (<cpla-box key={box.key} cpla-key={box.key} style={style}>{innerComponents}</cpla-box>);
  }
}
