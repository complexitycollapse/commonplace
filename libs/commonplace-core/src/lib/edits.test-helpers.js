import { span } from "./spans";

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