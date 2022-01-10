export function BoxComponent({ zettel }) {
  let style = zettel.style();
  let part = zettel.part();
  let imagePath = "";
  let innerStyle = {};

  if (part) {
    imagePath = URL.createObjectURL(part.content);
    let clip = part.pointer;
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
