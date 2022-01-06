export function SpanComponent({ zettel }) {

  let style = zettel.style();

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style}>{zettel.content()}</span>
    </cpla-span>
  );
}
