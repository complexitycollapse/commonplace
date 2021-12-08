import { BoxComponent } from "./box-component";
import { SpanComponent } from "./span-component";

export function ZettelComponent(props) {
  let editType = props.zettel.edit.editType;

  if (editType === "span") { return SpanComponent(props); }
  if (editType === "box") { return BoxComponent(props); }
}
