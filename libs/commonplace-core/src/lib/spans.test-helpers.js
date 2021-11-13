export function toEqualSpan(actualSpan, expectedSpan) {
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
