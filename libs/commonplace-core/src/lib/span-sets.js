import { span } from './spans';
import { addMethods, addProperties } from './utils';

function cons(head, rest) {
  return { head, rest };
}

let nil = {isNull: true};

function fold(init, fn, list) {
  for(let rest = list; rest != nil; rest = rest.rest) {
    init = fn(init, rest.head);
  }

  return init;
}

export function spanSet(offset) {
  let ss = {};
  let spans = nil;

  function append(span) {
    if (spans == nil) {
      spans = cons(span, nil);
    } else {
      let rest = spans;
      for(; rest.rest != nil; rest = rest.rest);
      rest.rest = cons(span, nil);
    }
  }

  addMethods(ss, {
    concLength: () => fold(0, (x, y)=> x + y.length, spans),
    append,
    offset: () => offset
  });

  return ss;
}
