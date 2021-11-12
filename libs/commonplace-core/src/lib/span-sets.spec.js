import { describe, expect, it, test } from '@jest/globals';
import { spanSet } from './span-sets';
import { span } from './spans';

function makeSpan({origin = "origin", start = 10, length = 20} = {}) {
  return span(origin, start, length);
}

describe('spanSet', () => {
  it('sets the offset', () => {
    expect(spanSet(123).offset()).toEqual(123);
  });
});

describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(spanSet(123).concLength()).toEqual(0);
  });

  it('returns the length of a span when it has one span', () => {
    let ss = spanSet(123);
    ss.append(makeSpan({length: 100}));
    expect(ss.concLength()).toEqual(100);
  });

  it('returns the sum of the lengths of spans it contains', () => {
    let ss = spanSet(123);
    ss.append(makeSpan({length: 100}));
    ss.append(makeSpan({length: 50}));
    ss.append(makeSpan({length: 3}));
    expect(ss.concLength()).toEqual(153);
  });
});