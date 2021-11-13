import { span } from './spans';
import { addMethods, addProperties } from './utils';

export function spanSet(offset) {
  let ss = {};
  let spans = [];

  function append(span) {
    spans.push(span);
  }

  function iterate() {
    let i = 0;
    return () => {
      return spans[i++];
    };
  }

  addMethods(ss, {
    concLength: () => spans.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    offset: () => offset,
    iterate
  });

  return ss;
}
