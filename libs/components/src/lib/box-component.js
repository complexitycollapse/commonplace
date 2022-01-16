import { CssStyle } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function BoxComponent({ zettel }) {
  let [zettelPartState, setZettelPartState] = useState(zettel.part());

  useEffect(() => {
    zettel.setOnUpdate(() => setZettelPartState(zettel.part()));
  }, []);

  let style = CssStyle(zettel.style()).css();
  let imagePath = "";
  let innerStyle = {};

  if (zettelPartState) {
    imagePath = URL.createObjectURL(zettelPartState.content);
    let clip = zettelPartState.pointer;
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
    <cpla-box cpla-key={zettel.key}>
      <div style={style}>
        <div style={innerStyle}/>
      </div>
    </cpla-box>
  );
}
