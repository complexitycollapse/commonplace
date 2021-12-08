import { Fragment } from "react";

export function SpanComponent({ zettel }) {

  let style = {};
  let SurroundingTag = Fragment;

  zettel.endsets.forEach(endset => {
    let link = endset.link;
    
    let thisStyle = link.style;
    if (thisStyle) {
      Object.getOwnPropertyNames(thisStyle).forEach(propName => {
        style[propName] = thisStyle[propName];
      });
    }

    let innerTag = link.innerTag;
    if (innerTag) { SurroundingTag = innerTag };
  });

  return (
    <cpla-span cpla-key={zettel.key}>
      <SurroundingTag>
        <span style={style}>{zettel.content}</span>
      </SurroundingTag>
    </cpla-span>
  );
}
