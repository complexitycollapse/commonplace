import { span } from './spans';
import { addMethods, addProperties } from './utils';

export function spanSet(...initialSpans) {
  let obj = {};
  let spans = [...initialSpans];

  function append(span) {
    spans.push(span);
  }

  function iterate() {
    let i = 0;
    let iterator = () => {
      return spans[i++];
    };


    iterator.forEach = (fn) => {
      let position = 0;
      for (let next = iterator(); next !== undefined; next = iterator()) {
        fn(next, position);
        position += next.length;
      }
    }

    return iterator;
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

    iterator.forEach(append);
  }

  function splitInternal(ss, point) {
    let iterator = ss.iterate();
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

  addMethods(obj, {
    concLength: () => spans.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    iterate,
    mergeSets,
    split
  });

  return obj;
}
