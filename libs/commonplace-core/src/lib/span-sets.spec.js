import { describe, expect, it, test } from '@jest/globals';
import { spanSet } from './span-sets';
import { span } from './spans';
import { toEqualSpan } from './spans.test-helpers';

expect.extend({
  toEqualSpan,
  hasSpans(ss, ...spans) {
    let iterator = ss.iterate();
    let i = 0;
    let failed = false;

    spans.forEach(span => {
      let actual = iterator();
      let singleResult = toEqualSpan(actual, span);
      if (!singleResult.pass) {
        failed =  {span, i, actual};
      }
      ++i;
    });

    if (failed) {
      return {
        message: () => `expected ${JSON.stringify(failed.span)} at position ${failed.i}, received ${JSON.stringify(failed.actual)}`,
        pass: false
      };
    }

    if (iterator() !== undefined) return {
      message: () => `too many items in SpanSet, expected ${span.length}`,
      pass: false
    }

    return {
      message: () => 'expected SpanSets to not contain the given spans',
      pass: true
    };
  }
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

describe('mergeSets', () => {
  it('leaves an empty SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let ss1 = spanSet(10), ss2 = spanSet(10);
    ss1.mergeSets(ss2);
    expect(ss1.concLength()).toEqual(0);
  });

  it('leaves a populated SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let ss1 = spanSet(10), ss2 = spanSet(10);
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    ss1.append(s1);
    ss1.append(s2);
    ss1.append(s3);

    ss1.mergeSets(ss2);
    expect(ss1).hasSpans(s1, s2, s3);
  });

  it('moves all given spans to an empty SpanSet', () => {
    let ss1 = spanSet(10), ss2 = spanSet(10);
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    ss2.append(s1);
    ss2.append(s2);
    ss2.append(s3);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2, s3);
  });

  it('appends the given span if doesn\'t overlap or abut the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("b", 15, 20);
    let ss1 = spanSet(10), ss2 = spanSet(10);
    ss1.append(s1);
    ss2.append(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2);
  });

  it('appends the given span if overlaps he existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 15, 20);
    let ss1 = spanSet(10), ss2 = spanSet(10);
    ss1.append(s1);
    ss2.append(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2);
  });

  it('merges the given span if it abuts the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 30, 20);
    let ss1 = spanSet(10), ss2 = spanSet(10);
    ss1.append(s1);
    ss2.append(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1.merge(s2));
  });

  it('merges the middle spans if they abut and leaves all others in sequence', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 5, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 35, 10), s2c = span("a", 45, 10);
    let ss1 = spanSet(10), ss2 = spanSet(10);
    ss1.append(s1a);
    ss1.append(s1b);
    ss1.append(s1c);
    ss2.append(s2a);
    ss2.append(s2b);
    ss2.append(s2c);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1a, s1b, s1c.merge(s2a), s2b, s2c);
  });
});