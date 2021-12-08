import { ZettelComponent } from './zettel-component';

export function ZettelFragment({ fragment }) {
  let childComponents = fragment.children.map(f => f?.frag
    ? (<ZettelFragment fragment={f}/>)
    : <ZettelComponent zettel = {f.zettel}/>);

  let Tag = fragment.link?.type === "paragraph" ? "p" : "React.Fragment";

  return (<Tag>{childComponents}</Tag>);
}
