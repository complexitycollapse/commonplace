import { CssStyle } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function ImageComponent({ zettel }) {
  let [zettelContentState, setZettelContentState] = useState(zettel.getContent());

  // useEffect(() => {
  //   zettel.setOnUpdate(() => setZettelContentState(zettel.getContent()));
  // }, []);

  let style = CssStyle(zettel).css();
  let imagePath = "";
  let innerStyle = {};

  if (zettelContentState) {
    imagePath = URL.createObjectURL(zettelContentState);
    let clip = zettel.pointer;
    innerStyle = {
      backgroundImage: `url("${imagePath}")`,
      width: clip.width,
      height: clip.height,
      backgroundPositionX: clip.x * -1,
      backgroundPositionY: clip.y * -1,
      overflow: "hidden",
      backgroundRepeat: "no-repeat"
    };
  }

  return (
    <cpla-image cpla-key={zettel.key}>
      <div style={style}>
        <div style={innerStyle}/>
      </div>
    </cpla-image>
  );
}
