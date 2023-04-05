import { CssStyle } from '@commonplace/html';
import { ZettelComponent } from './zettel-component';

export function EdlComponent({ edl }) {
  let innerComponents = edl.zettel.map(f => f.pointer.pointerType === "edl"
    ? (<EdlComponent key={f.key} edl={f}/>)
    : <ZettelComponent key={f.key} zettel={f}/>);

  let cssStyle = CssStyle(edl.markup.values());
  let fragmentTags = cssStyle.fragmentTags();
  let style = cssStyle.css();

  function wrap(i) {
    if (fragmentTags.length <= i) {
      return (<div style={style}>{innerComponents}</div>);
    } else {
      let Tag = fragmentTags[i];
      return (<Tag style={style}>{wrap(i + 1)}</Tag>);
    }
  }

  return (<cpla-edl cpla-key={edl.key}>{wrap(0)}</cpla-edl>);
}
