export function ZettelComponent({ zettel }) {

  let style = {};
  zettel.endsets.forEach(endset => {
    let thisStyle = endset.link.style;
    if (thisStyle) {
      Object.getOwnPropertyNames(thisStyle).forEach(propName => {
        style[propName] = thisStyle[propName];
      });
    }
  });

  return (
    <span style={style}>{zettel.content}</span>
  );
}
