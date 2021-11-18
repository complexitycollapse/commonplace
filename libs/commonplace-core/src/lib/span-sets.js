import { spanIterator } from './span-iterators';
import { span } from './spans';
import { addMethods, addProperties } from './utils';

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

  function merge(toMerge) {
    let iterator = toMerge.spanSource();
    let first = iterator();

    function getInitialSpans() {
      if (first === undefined) return spans;

      if (spans.length > 0) {
        let last = spans[spans.length - 1];
        if (last.abuts(first)) {
          return spans.slice(0, -1).concat([last.merge(first)]);
        }
      }

      return spans.concat(first);
    }

    let result = spanSet(...getInitialSpans());

    iterator.forEach(result.append);

    return result;
  }

  function splitInternal(ss, point) {
    let iterator = ss.spanSource();
    let first = spanSet(), second = spanSet();

    iterator.forEach((span, position) => {
      if (position >= point) {
        second.append(span);
      } else if (position + span.length > point) {
        let splits = span.split(point - position);
        first.append(splits[0]);
        second.append(splits[1]);
      } else {
        first.append(span);
      }
    });

    return [first, second];
  }

  function split(point, length) {
    let firstSplit = splitInternal(obj, point);
    if (length === undefined) return firstSplit;
    let secondSplit = splitInternal(firstSplit[1], length);
    return [firstSplit[0], ...secondSplit];
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
    range,
    merge,
    split,
    crop: (start, length) => split(start, length)[1],
    insert: (newSpans, point) => {
      let splits = split(point);
      return splits[0].merge(newSpans).merge(splits[1]);
    },
    delete: (start, length) =>  {
      let splits = split(start, length);
      return splits[0].merge(splits[2]);
    }
  });

  return obj;
}
