import { ZettelComponent } from './zettel-component';

export function ZettelFragment({ node }) {
  let innerComponents = node.children.map(f => f.isNode
    ? (<ZettelFragment key={f.key} node={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  function wrap(i) {
    if (node.endsets.length <= i) {
      return innerComponents;
    } else {
      let Tag = node.endsets[i].link.fragmentTag;
      return (<Tag>{wrap(i + 1)}</Tag>);
    }
  }

  return wrap(0);
}
