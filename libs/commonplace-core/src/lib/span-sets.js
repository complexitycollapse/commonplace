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

  function mergeSets(spanSet) {
    let iterator = spanSet.iterate();
    let first = iterator();

    if (first === undefined) return;

    if (spans.length > 0) {
      let last = spans[spans.length - 1];
      if (last.abuts(first)) {
        spans[spans.length - 1] = last.merge(first);
      } else {
        append(first);
      }
    } else {
      append(first);
    }

    for (var next = iterator(); next !== undefined; next = iterator()) {
      append(next);
    }
  }

  addMethods(ss, {
    concLength: () => spans.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    offset: () => offset,
    iterate,
    mergeSets
  });

  return ss;
}
