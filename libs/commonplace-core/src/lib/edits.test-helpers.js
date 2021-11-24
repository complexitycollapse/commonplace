import { span } from "./spans";
import { box } from "./boxes";

export function toEqualSpan(actualSpan, expectedSpan) {
  return compareElements(actualSpan, expectedSpan, (actual, expected) => {
    return actual.origin === expected.origin &&
      actual.start === expected.start &&
      actual.length === expected.length;
  });
}

export function toEqualBox(actualBox, expectedBox) {
  return compareElements(actualBox, expectedBox, (actual, expected) => {
    return actual.origin === expected.origin &&
      actual.x === expected.x &&
      actual.y === expected.y &&
      actual.height === expected.height &&
      actual.width === expected.width;
  });
}

export function toEqualEdit(actualEdit, expectedEdit) {
  if (actualEdit.editType !== expectedEdit.editType) {
    return false;
  }

  if (expectedEdit.editType == "span") {
    return toEqualSpan(actualEdit, expectedEdit);
  }

  if (expectedEdit.editType == "box") {
    return toEqualBox(actualEdit, expectedEdit);
  }

  throw `Edit type '${expectedEdit.editType}' not understood`;
}

function compareElements(actual, expected, testFn) {
  if (actual === undefined) return {
    message: () => `expected ${JSON.stringify(expected)} but received undefined`,
    pass: false
  };

  if (actual === undefined) return {
    message: () => `undefined expectation, actual was ${JSON.stringify(actual)}`,
    pass: false
  };

  let pass = testFn(actual, expected);
    

  if (pass) {
    return {
      message: () =>
        `expected ${JSON.stringify(actual)} to not equal ${JSON.stringify(
          expected
        )}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected ${JSON.stringify(actual)} to equal ${JSON.stringify(
          expected
        )}`,
      pass: false,
    };
  }
}

export function makeSpans(qty) {
  let result = [];
  for (let i = 0; i < qty; i++) {
    result.push(span(i.toString(), i, 5));
  }

  return result;
}

export function hasEdits(el, ...edits) {
  let iterator = el.editSource();
  let i = 0;
  let failed = false;

  try {
    edits.forEach(edit => {
      if (failed === false) {
        let actual = iterator();
        let singleResult = toEqualEdit(actual, edit);
        if (!singleResult.pass) {
          failed = {edit, i, actual};
          throw "test failed";
        }
        ++i;
      }
    });
  } catch (ex) {
    if (ex !== "test failed") throw ex;
  }

  if (failed) {
    return {
      message: () => `expected ${JSON.stringify(failed.edit)} at position ${failed.i}, received ${JSON.stringify(failed.actual)}`,
      pass: false
    };
  }

  if (iterator() !== undefined) {
    let remaining = 0;
    iterator.forEach(_ => ++remaining);
    return {
      message: () => `too many items in EditList, expected ${edits.length}, actual ${remaining + i + 1}`,
      pass: false
    }
  }

  return {
    message: () => 'expected EditLists to not contain the given edits',
    pass: true
  };
}

export function makeSpan({origin = "origin", start = 10, length = 20} = {}) {
  return span(origin, start, length);
}

export function makeBox({origin = "origin", x = 10, y = 11, width = 20, height = 30} = {}) {
  return box(origin, x, y, width, height);
}
