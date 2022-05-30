import { CssStyle } from '@commonplace/html';
import { useState, useEffect } from 'react';

export function SpanComponent({ zettel }) {

  let [zettelPartState, setZettelPartState] = useState(zettel.part());

  useEffect(() => {
    zettel.setOnUpdate(() => setZettelPartState(zettel.part()));
  }, []);

  let style = CssStyle(zettel.attributes().values()).css();
  let content = zettelPartState ? zettelPartState.content : "";

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style ?? {}}>{content}</span>
    </cpla-span>
  );
}
