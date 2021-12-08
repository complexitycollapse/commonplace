import { Fragment } from "react";

export function ZettelComponent({ zettel }) {

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
    <SurroundingTag><span style={style}>{zettel.content}</span></SurroundingTag>
  );
}
