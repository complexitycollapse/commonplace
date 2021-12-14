import { leafDataToBox } from './box';
import { EditIterator } from './edit-iterator';
import { leafDataToSpan } from './span';
import { finalObject, addProperties } from './utils';

export function EditList(...editDesignators) {
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

  addProperties(obj, {
    edits
  });

  function append(edit) {
    edits.push(edit);
  }

  function editSource() {
    return EditIterator(state => [state.shift(), state], [...edits]);
  }

  function range(start, length) {
    if (length === 0) return EditList();

    let rangeSpans = [];
    let i = 0;

    while(edits[i] !== undefined && start >= edits[i].length) {
      start -= edits[i].length;
      i += 1;
    }

    if (edits[i] === undefined) return EditList();

    let firstSpan = edits[i].crop(start, length);
    rangeSpans.push(firstSpan);
    length -= firstSpan.length;
    i += 1;

    while(edits[i] !== undefined && length > 0) {
      rangeSpans.push(edits[i].crop(0, length));
      length -= edits[i].length;
      i += 1;
    }
    
    return EditList(...rangeSpans);
  }

  function leafData() {
    return edits.map(e => e.leafData());
  }

  return finalObject(obj, {
    concLength: () => edits.map(s => s.length).reduce((a, b) => a + b, 0),
    append,
    editSource,
    range,
    leafData
  });
}

export function leafDataToEditList(leafData) {
  return EditList(...leafData.map(leafDataToEdit));
}

export function leafDataToEdit(leafData) {
  if (leafData.typ === "span") {
    return leafDataToSpan(leafData);
  } else if (leafData.typ === "box") {
    return leafDataToBox(leafData);
  } else {
    throw `leafDataToEdit does not understand '${leafData}'`;
  }
}
