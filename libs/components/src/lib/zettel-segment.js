import { ZettelComponent } from './zettel-component';

export function ZettelSegment({ segment }) {
  let innerComponents = segment.children.map(f => f.isSegment
    ? (<ZettelSegment key={f.key} segment={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  function wrap(i) {
    if (segment.endsets.length <= i) {
      return innerComponents;
    } else {
      let Tag = segment.endsets[i].link.fragmentTag;
      return (<Tag>{wrap(i + 1)}</Tag>);
    }
  }

  return (<cpla-segment>{wrap(0)}</cpla-segment>);
}
