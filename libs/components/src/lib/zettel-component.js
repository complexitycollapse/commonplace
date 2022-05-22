import { BoxComponent } from "./box-component";
import { SpanComponent } from "./span-component";

export function ZettelComponent(props) {
  let pointerType = props.zettel.clip.pointerType;

  if (pointerType === "span") { return SpanComponent(props); }
  if (pointerType === "box") { return BoxComponent(props); }
}
