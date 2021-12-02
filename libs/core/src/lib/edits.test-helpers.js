import { spanTesting } from "./spans";
import { boxTesting } from "./boxes";


export function toEqualEdit(actualEdit, expectedEdit) {
  if (actualEdit.editType !== expectedEdit.editType) {
    return {
      message: () => `Expected '${JSON.stringify(expectedEdit)}', received '${JSON.stringify(actualEdit)}'`,
      pass: false
    };
  }

  if (expectedEdit.editType == "span") {
    return spanTesting.toEqualSpan(actualEdit, expectedEdit);
  }

  if (expectedEdit.editType == "box") {
    return boxTesting.toEqualBox(actualEdit, expectedEdit);
  }

  return {
    message: () => `Edit type '${expectedEdit.editType}' not understood`,
    pass: false
  };
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
