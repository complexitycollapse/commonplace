import { spanIterator } from './span-iterators';
import { addMethods } from './utils';

export function spanSet(...spanDesignators) {
  let obj = {};
  let spans = [];

  {
    let last = undefined;
    spanDesignators.forEach(x => x.spanSource().forEach(s => {
      if (last !== undefined) {
        if (last.abuts(s)) {
          spans.pop();
          s = last.merge(s);
        }
      }
      last = s;
      spans.push(s);
    }));
  }

  function append(span) {
    spans.push(span);
  }

  function spanSource() {
    return spanIterator(state => [state.shift(), state], [...spans]);
  }

  function range(start, length) {
    if (length === 0) return spanSet();

    let rangeSpans = [];
    let i = 0;

    while(spans[i] !== undefined && start >= spans[i].length) {
      start -= spans[i].length;
      i += 1;
    }

    if (spans[i] === undefined) return spanSet();

    let firstSpan = spans[i].crop(start, length);
    rangeSpans.push(firstSpan);
    length -= firstSpan.length;
    i += 1;

    while(spans[i] !== undefined && length > 0) {
      rangeSpans.push(spans[i].crop(0, length));
      length -= spans[i].length;
      i += 1;
    }
    
    return spanSet(...rangeSpans);
  }

  addMethods(obj, {
    concLength: () => spans.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    spanSource,
    range
  });

  return obj;
}
