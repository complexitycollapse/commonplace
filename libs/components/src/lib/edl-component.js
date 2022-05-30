import { CssStyle } from '@commonplace/html';
import { ZettelComponent } from './zettel-component';

export function EdlComponent({ edl }) {
  let innerComponents = edl.children.map(f => f.clip.pointerType === "edl"
    ? (<EdlComponent key={f.key} segment={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  let cssStyle = CssStyle(edl.attributes().values());
  let fragmentTags = cssStyle.fragmentTags();
  let style = cssStyle.css();

  function wrap(i) {
    if (fragmentTags.length <= i) {
      return innerComponents;
    } else {
      let Tag = fragmentTags[i];
      return (<Tag style={style}>{wrap(i + 1)}</Tag>);
    }
  }

  return (<cpla-edl key={edl.key}>{wrap(0)}</cpla-edl>);
}
