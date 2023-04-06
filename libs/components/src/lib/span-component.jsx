import { CssStyle } from '@commonplace/html';

export function SpanComponent({ zettel }) {

  let style = CssStyle(zettel.markup).css();
  let content = zettel.getContent();

  return (
    <cpla-span cpla-key={zettel.key} cpla-start={zettel.pointer.start} cpla-length={zettel.pointer.length}>
      <span style={style ?? {}}>{content}</span>
    </cpla-span>
  );
}
