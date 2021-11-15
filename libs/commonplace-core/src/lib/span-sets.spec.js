import { describe, expect, it, test, jest} from '@jest/globals';
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
  it('sets the spans to the given initial spans', () => {
    let s1 = span("a", 1, 2), s2 = span("b", 3, 4);
    expect(spanSet(s1, s2)).hasSpans(s1, s2);
  });
});

describe('concLength', () => {
  it('returns 0 for empty set', () => {
    expect(spanSet().concLength()).toEqual(0);
  });

  it('returns the length of a span when it has one span', () => {
    let ss = spanSet();
    ss.append(makeSpan({length: 100}));
    expect(ss.concLength()).toEqual(100);
  });

  it('returns the sum of the lengths of spans it contains', () => {
    let ss = spanSet();
    ss.append(makeSpan({length: 100}));
    ss.append(makeSpan({length: 50}));
    ss.append(makeSpan({length: 3}));
    expect(ss.concLength()).toEqual(153);
  });
});

describe('iterate', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = spanSet().iterate();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the spans in sequence', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss = spanSet(s1, s2, s3);
    let iterator = ss.iterate();

    expect(iterator()).toEqualSpan(s1);
    expect(iterator()).toEqualSpan(s2);
    expect(iterator()).toEqualSpan(s3);
    expect(iterator()).toBeUndefined();
  });

  describe('iterator.foreach', () => {
    it('is present on the iterator', () => {
      expect(spanSet().iterate()).toHaveProperty("forEach");
    });

    it('never calls the callback if the SpanSet is empty', () => {
      const mockCallback = jest.fn(x => x);

      spanSet().iterate().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(0);
    });

    it('calls the callback with all the present spans in order', () => {
      const mockCallback = jest.fn(x => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = spanSet(s1, s2, s3);

      ss.iterate().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(3);
      expect(mockCallback.mock.calls[0][0]).toEqualSpan(s1);
      expect(mockCallback.mock.calls[1][0]).toEqualSpan(s2);
      expect(mockCallback.mock.calls[2][0]).toEqualSpan(s3);
    });

    it('calls the callback with the sum of the lengths of the previous spans', () => {
      const mockCallback = jest.fn((x, y) => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = spanSet(s1, s2, s3);

      ss.iterate().forEach(mockCallback);

      expect(mockCallback.mock.calls[0][1]).toEqual(0);
      expect(mockCallback.mock.calls[1][1]).toEqual(20);
      expect(mockCallback.mock.calls[2][1]).toEqual(50);
    });
  });
});

describe('mergeSets', () => {
  it('leaves an empty SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let ss1 = spanSet(), ss2 = spanSet();
    ss1.mergeSets(ss2);
    expect(ss1.concLength()).toEqual(0);
  });

  it('leaves a populated SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss1 = spanSet(s1, s2, s3), ss2 = spanSet();

    ss1.mergeSets(ss2);
    expect(ss1).hasSpans(s1, s2, s3);
  });

  it('moves all given spans to an empty SpanSet', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss1 = spanSet(), ss2 = spanSet(s1, s2, s3);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2, s3);
  });

  it('appends the given span if doesn\'t overlap or abut the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("b", 15, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2);
  });

  it('appends the given span if overlaps he existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 15, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1, s2);
  });

  it('merges the given span if it abuts the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 30, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1.merge(s2));
  });

  it('merges the middle spans if they abut and leaves all others in sequence', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 5, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 35, 10), s2c = span("a", 45, 10);
    let ss1 = spanSet(s1a, s1b, s1c), ss2 = spanSet(s2a, s2b, s2c);

    ss1.mergeSets(ss2);

    expect(ss1).hasSpans(s1a, s1b, s1c.merge(s2a), s2b, s2c);
  });
});

describe('split', () => {
  it('returns two empty SpanSets if the original set was empty', () => {
    let ss = spanSet();

    let result = ss.split(0);

    expect(result[0]).hasSpans();
    expect(result[1]).hasSpans();
  });

  it('returns an empty span and a copy of the original SpanSet if the point is zero', () => {
    let s1 = span("a", 0, 5), s2 = span("a", 5, 5);
    let ss = spanSet(s1, s2);

    let result = ss.split(0);

    expect(result[0]).hasSpans();
    expect(result[1]).hasSpans(s1, s2);
  });

  it('returns a copy of the original SpanSet then an empty span if the point is beyond the total length', () => {
    let s1 = span("a", 0, 5), s2 = span("a", 5, 5);
    let ss = spanSet(s1, s2);

    let result = ss.split(ss.concLength);

    expect(result[0]).hasSpans(s1, s2);
    expect(result[1]).hasSpans();
  });

  it('divides the spans in two if the point is exactly between them', () => {
    let s1 = span("a", 0, 5), s2 = span("a", 2, 5);
    let ss = spanSet(s1, s2);

    let result = ss.split(5);

    expect(result[0]).hasSpans(s1);
    expect(result[1]).hasSpans(s2);
  });

  it('splits the span that the point lies within, with the point included in the second span', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5), s3 = span("c", 10, 20);
    let ss = spanSet(s1, s2, s3);
    let splits = s2.split(3);

    let result = ss.split(8);

    expect(result[0].concLength()).toEqual(8);
    expect(result[0]).hasSpans(s1, splits[0]);
    expect(result[1]).hasSpans(splits[1], s3);
  });

  it('splits the SpanSet into three span sets with the middle set starting at point and having the given length', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5), s3 = span("c", 10, 20), s4 = span("d", 44, 10);
    let ss = spanSet(s1, s2, s3, s4);
    let splits1 = s2.split(3), splits2 = s3.split(8);

    let result = ss.split(8, 10);

    expect(result[0].concLength()).toEqual(8);
    expect(result[1].concLength()).toEqual(10);
    expect(result[0]).hasSpans(s1, splits1[0]);
    expect(result[1]).hasSpans(splits1[1], splits2[0]);
    expect(result[2]).hasSpans(splits2[1], s4);
  });
});
