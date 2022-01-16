import { useState, useEffect } from 'react';

export function SpanComponent({ zettel }) {

  let [zettelPartState, setZettelPartState] = useState(zettel.part());

  useEffect(() => {
    zettel.setContentCallback(() => setZettelPartState(zettel.part()));
  }, []);

  let style = zettel.style();
  let content = zettelPartState ? zettelPartState.content : "";

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style ?? {}}>{content}</span>
    </cpla-span>
  );
}
