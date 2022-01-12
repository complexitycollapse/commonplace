export function SpanComponent({ zettel }) {

  let style = zettel.style();
  let part = zettel.part();

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style}>{part.content}</span>
    </cpla-span>
  );
}
