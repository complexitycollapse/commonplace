import { Fragment } from "react";

export function SpanComponent({ zettel }) {

  let style = {};

  zettel.endsets.forEach(endset => {
    let link = endset.link;
    
    let thisStyle = link.style;
    if (thisStyle) {
      Object.getOwnPropertyNames(thisStyle).forEach(propName => {
        style[propName] = thisStyle[propName];
      });
    }
  });

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style}>{zettel.content}</span>
    </cpla-span>
  );
}
