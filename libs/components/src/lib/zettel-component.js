import { BoxComponent } from "./box-component";
import { SpanComponent } from "./span-component";

export function ZettelComponent(props) {
  let clipType = props.zettel.clip.clipType;

  if (clipType === "span") { return SpanComponent(props); }
  if (clipType === "box") { return BoxComponent(props); }
}
