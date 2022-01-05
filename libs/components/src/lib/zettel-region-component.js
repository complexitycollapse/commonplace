import { ZettelComponent } from './zettel-component';

export function ZettelRegionComponent({ segment }) {
  let innerComponents = segment.children.map(f => f.isSegment
    ? (<ZettelRegionComponent key={f.key} segment={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  function wrap(i) {
    if (segment.endsets.length <= i) {
      return innerComponents;
    } else {
      let link = segment.endsets[i].renderLink;
      let Tag = link.fragmentTag;
      let style = link.style();
      return (<Tag style={style}>{wrap(i + 1)}</Tag>);
    }
  }

  return (<cpla-segment>{wrap(0)}</cpla-segment>);
}
