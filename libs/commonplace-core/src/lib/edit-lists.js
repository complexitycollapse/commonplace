import { editIterator } from './edit-iterators';
import { addMethods } from './utils';

export function editList(...editDesignators) {
  let obj = {};
  let edits = [];

  {
    let last = undefined;
    editDesignators.forEach(x => x.editSource().forEach(s => {
      if (last !== undefined) {
        if (last.abuts(s)) {
          edits.pop();
          s = last.merge(s);
        }
      }
      last = s;
      edits.push(s);
    }));
  }

  function append(edit) {
    edits.push(edit);
  }

  function editSource() {
    return editIterator(state => [state.shift(), state], [...edits]);
  }

  function range(start, length) {
    if (length === 0) return editList();

    let rangeSpans = [];
    let i = 0;

    while(edits[i] !== undefined && start >= edits[i].length) {
      start -= edits[i].length;
      i += 1;
    }

    if (edits[i] === undefined) return editList();

    let firstSpan = edits[i].crop(start, length);
    rangeSpans.push(firstSpan);
    length -= firstSpan.length;
    i += 1;

    while(edits[i] !== undefined && length > 0) {
      rangeSpans.push(edits[i].crop(0, length));
      length -= edits[i].length;
      i += 1;
    }
    
    return editList(...rangeSpans);
  }

  addMethods(obj, {
    concLength: () => edits.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    editSource,
    range
  });

  return obj;
}
