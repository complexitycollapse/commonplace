export function SpanComponent({ zettel }) {

  let style = zettel.style();
  let part = zettel.part();
  let content = "";
  if (part) {
    content = part.content.substring(part.pointer.start, part.pointer.next);
  }

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style}>{content}</span>
    </cpla-span>
  );
}
