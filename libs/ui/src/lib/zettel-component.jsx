import { ImageComponent } from "./image-component";
import { SpanComponent } from "./span-component";

export function ZettelComponent(props) {
  let pointerType = props.zettel.pointer.pointerType;

  if (pointerType === "span") { return SpanComponent(props); }
  if (pointerType === "image") { return ImageComponent(props); }
}
