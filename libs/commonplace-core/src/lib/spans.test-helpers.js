import { span } from "./spans";

export function toEqualSpan(actualSpan, expectedSpan) {
  if (actualSpan === undefined) return {
    message: () => `expected ${JSON.stringify(expectedSpan)} but received undefined`,
    pass: false
  };

  if (actualSpan === undefined) return {
    message: () => `undefined expectation, actual was ${JSON.stringify(actualSpan)}`,
    pass: false
  };

  let pass =
    actualSpan.origin === expectedSpan.origin &&
    actualSpan.start === expectedSpan.start &&
    actualSpan.length === expectedSpan.length;

  if (pass) {
    return {
      message: () =>
        `expected ${JSON.stringify(actualSpan)} to not equal ${JSON.stringify(
          expectedSpan
        )}`,
      pass: true,
    };
  } else {
    return {
      message: () =>
        `expected ${JSON.stringify(actualSpan)} to equal ${JSON.stringify(
          expectedSpan
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