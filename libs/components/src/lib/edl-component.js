import { ZettelComponent } from './zettel-component';

export function EdlComponent({ edl }) {
  let innerComponents = edl.children.map(f => f.clip.pointerType === "edl"
    ? (<EdlComponent key={f.key} segment={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  function wrap(i) {
    if (edl.renderPointers.length <= i) {
      return innerComponents;
    } else {
      let link = edl.renderPointers[i].renderLink;
      let Tag = link.fragmentTag;
      let style = link.style();
      return (<Tag style={style}>{wrap(i + 1)}</Tag>);
    }
  }

  return (<cpla-edl key={edl.key}>{wrap(0)}</cpla-edl>);
}
