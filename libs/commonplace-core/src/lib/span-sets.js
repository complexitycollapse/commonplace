import { span } from './spans';
import { addMethods, addProperties } from './utils';

export function spanSet(...initialSpans) {
  let obj = {};
  let spans = [...initialSpans];

  function append(span) {
    spans.push(span);
  }

  function spanSource() {
    let i = 0;
    let position = 0;
    let iterator = () => {
      if (i < spans.length)
      {
        position += spans[i].length;
        return spans[i++];
      } else {
        return undefined;
      }
    };

    iterator.forEach = (fn) => {
      for (let next = iterator(); next !== undefined; next = iterator()) {
        fn(next, position - next.length);
      }
    }

    return iterator;
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
    return {
      spanSource: () => {
        let iterator = spanSource();
        let point = 0;
        let next = iterator();
        for (; point + next?.length <= start; next = iterator()) {
          point += next.length;
        }
        if (next) {
          next = next.crop(start - point, length);
        }

        return () => {
          if (length <= 0) return undefined;
          if (next) {
            length -= next.length;
            let temp = next;
            next = undefined;
            return temp;
          }

          if (length <= 0) return undefined;
          let result = iterator();
          if (result === undefined) return undefined;
          result = result.crop(0, length);
          length -= result.length;
          return result;
        };
      }
    };
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
