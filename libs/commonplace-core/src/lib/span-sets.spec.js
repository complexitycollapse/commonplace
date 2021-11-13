import { describe, expect, it, test } from '@jest/globals';
import { spanSet } from './span-sets';
import { span } from './spans';
import { toEqualSpan } from './spans.test-helpers';

expect.extend({
  toEqualSpan
});

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

describe('iterate', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = spanSet(10).iterate();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the spans in sequence', () => {
    let ss = spanSet(10);
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    ss.append(s1);
    ss.append(s2);
    ss.append(s3);
    let iterator = ss.iterate();

    expect(iterator()).toEqualSpan(s1);
    expect(iterator()).toEqualSpan(s2);
    expect(iterator()).toEqualSpan(s3);
    expect(iterator()).toBeUndefined();
  });
});