export function SpanComponent({ zettel }) {

  let style = zettel.style();
  let part = zettel.part();
  let content = "";
  if (part) {
    content = part.content.substring(part.clip.start, part.clip.next);
  }

  return (
    <cpla-span cpla-key={zettel.key}>
      <span style={style}>{content}</span>
    </cpla-span>
  );
}
