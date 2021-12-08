import { ZettelComponent } from './zettel-component';

export function ZettelFragment({ fragment }) {
  let childComponents = fragment.children.map(f => f?.frag
    ? (<ZettelFragment key={f.key} fragment={f}/>)
    : <ZettelComponent key={f.zettel.key} zettel={f.zettel}/>);

  let Tag = fragment.link?.fragmentTag ?? "React.Fragment";

  return (<Tag>{childComponents}</Tag>);
}
