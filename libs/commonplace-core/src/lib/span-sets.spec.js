import { describe, expect, it, test, jest} from '@jest/globals';
import { spanSet } from './span-sets';
import { span } from './spans';
import { toEqualSpan, makeSpans } from './spans.test-helpers';

expect.extend({
  toEqualSpan,
  hasSpans(ss, ...spans) {
    let iterator = ss.spanSource();
    let i = 0;
    let failed = false;

    spans.forEach(span => {
      if (failed === false) {
        let actual = iterator();
        let singleResult = toEqualSpan(actual, span);
        if (!singleResult.pass) {
          failed = {span, i, actual};
        }
        ++i;
      }
    });

    if (failed) {
      return {
        message: () => `expected ${JSON.stringify(failed.span)} at position ${failed.i}, received ${JSON.stringify(failed.actual)}`,
        pass: false
      };
    }

    if (iterator() !== undefined) {
      let remaining = 0;
      //iterator.forEach(_ => ++remaining);
      return {
        message: () => `too many items in SpanSet, expected ${spans.length}, actual ${remaining + i + 1}`,
        pass: false
      }
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

function sumLengths(spans) {
  return spans.reduce((a, s) => a + s.length, 0);
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

describe('spanSource', () => {
  it('returns undefined if the array is empty', () => {
    let iterator = spanSet().spanSource();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
    expect(iterator()).toBeUndefined();
  });

  it('returns the spans in sequence', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss = spanSet(s1, s2, s3);
    let iterator = ss.spanSource();

    expect(iterator()).toEqualSpan(s1);
    expect(iterator()).toEqualSpan(s2);
    expect(iterator()).toEqualSpan(s3);
    expect(iterator()).toBeUndefined();
  });

  describe('spanSource.foreach', () => {
    it('is present on the iterator', () => {
      expect(spanSet().spanSource()).toHaveProperty("forEach");
    });

    it('never calls the callback if the SpanSet is empty', () => {
      const mockCallback = jest.fn(x => x);

      spanSet().spanSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(0);
    });

    it('calls the callback with all the present spans in order', () => {
      const mockCallback = jest.fn(x => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = spanSet(s1, s2, s3);

      ss.spanSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(3);
      expect(mockCallback.mock.calls[0][0]).toEqualSpan(s1);
      expect(mockCallback.mock.calls[1][0]).toEqualSpan(s2);
      expect(mockCallback.mock.calls[2][0]).toEqualSpan(s3);
    });

    it('calls the callback with the sum of the lengths of the previous spans', () => {
      const mockCallback = jest.fn((x, y) => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = spanSet(s1, s2, s3);

      ss.spanSource().forEach(mockCallback);

      expect(mockCallback.mock.calls[0][1]).toEqual(0);
      expect(mockCallback.mock.calls[1][1]).toEqual(20);
      expect(mockCallback.mock.calls[2][1]).toEqual(50);
    });

    it('continues from where the iterator left off', () => {
      const mockCallback = jest.fn(x => x);
      let s1 = span("a", 10, 20), s2 = span("a", 20, 30), s3 = span("a", 30, 40);
      let ss = spanSet(s1, s2, s3);
      let source = ss.spanSource();

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(2);
      expect(mockCallback.mock.calls[0][0]).toEqualSpan(s2);
      expect(mockCallback.mock.calls[0][1]).toEqual(20);
      expect(mockCallback.mock.calls[1][0]).toEqualSpan(s3);
      expect(mockCallback.mock.calls[1][1]).toEqual(50);
    });
  });
});

describe('merge', () => {
  it('leaves an empty SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let ss1 = spanSet(), ss2 = spanSet();
    expect(ss1.merge(ss2)).hasSpans();
  });

  it('leaves a populated SpanSet unchanged if it is merged with an empty SpanSet', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss1 = spanSet(s1, s2, s3), ss2 = spanSet();

    expect(ss1.merge(ss2)).hasSpans(s1, s2, s3);
  });

  it('moves all given spans to an empty SpanSet', () => {
    let s1 = span("a", 1, 10), s2 = span("b", 2, 2), s3 = span("c", 30, 300);
    let ss1 = spanSet(), ss2 = spanSet(s1, s2, s3);

    expect(ss1.merge(ss2)).hasSpans(s1, s2, s3);
  });

  it('appends the given span if doesn\'t overlap or abut the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("b", 15, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    expect(ss1.merge(ss2)).hasSpans(s1, s2);
  });

  it('appends the given span if overlaps he existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 15, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    expect(ss1.merge(ss2)).hasSpans(s1, s2);
  });

  it('merges the given span if it abuts the existing one', () => {
    let s1 = span("a", 10, 20), s2 = span("a", 30, 20);
    let ss1 = spanSet(s1), ss2 = spanSet(s2);

    expect(ss1.merge(ss2)).hasSpans(s1.merge(s2));
  });

  it('merges the middle spans if they abut and leaves all others in sequence', () => {
    let s1a = span("a", 0, 5), s1b = span("a", 5, 5), s1c = span("a", 10, 5);
    let s2a = span("a", 15, 20), s2b = span("a", 35, 10), s2c = span("a", 45, 10);
    let ss1 = spanSet(s1a, s1b, s1c), ss2 = spanSet(s2a, s2b, s2c);

    expect(ss1.merge(ss2)).hasSpans(s1a, s1b, s1c.merge(s2a), s2b, s2c);
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

describe('crop', () => {
  it('returns an empty set if the original had no spans', () => {
    let ss = spanSet();

    expect(ss.crop(0, 5)).hasSpans();
  });

  it('returns all spans if the crop contains all the spans', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5);
    let ss = spanSet(s1, s2);

    expect(ss.crop(0, 10)).hasSpans(s1, s2);
  });

  it('returns the first span if the second is cropped', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5);
    let ss = spanSet(s1, s2);

    expect(ss.crop(0, 5)).hasSpans(s1);
  });

  it('returns the second span if the first is cropped', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5);
    let ss = spanSet(s1, s2);

    expect(ss.crop(5, 10)).hasSpans(s2);
  });

  it('returns a section of the spans if they have their ends cropped off', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5);
    let ss = spanSet(s1, s2);

    expect(ss.crop(1, 8)).hasSpans(span("a", 1, 4), span("b", 2, 4));
  });

  it('returns a span set with the given length', () => {
    let s1 = span("a", 0, 5), s2 = span("b", 2, 5);
    let ss = spanSet(s1, s2);

    expect(ss.crop(1, 8).concLength()).toEqual(8);
  });
});

describe('insert', () => {
  it('inserting spans into empty set produces a set with just those spans', () => {
    let spans = makeSpans(5);
    let ss = spanSet(...spans);

    expect(spanSet().insert(ss, 0)).hasSpans(...spans);
  });

  it('inserting no spans into a spanSet produces an identical spanSet', () => {
    let spans = makeSpans(5);
    let ss = spanSet(...spans);

    expect(ss.insert(spanSet(), 0)).hasSpans(...spans);
  });

  it('inserting spans at the beginning of a spanSet prepends them', () => {
    let existingSpans = makeSpans(5);
    let newSpans = makeSpans(5);
    let ss = spanSet(...existingSpans);

    expect(ss.insert(spanSet(...newSpans), 0)).hasSpans(...existingSpans.concat(newSpans));
  });

  it('inserting spans at the end of a spanSet appends them', () => {
    let existingSpans = makeSpans(5);
    let existingSpansLength = sumLengths(existingSpans);
    let newSpans = makeSpans(5);
    let ss = spanSet(...existingSpans);

    expect(ss.insert(spanSet(...newSpans), existingSpansLength)).hasSpans(...newSpans.concat(existingSpans));
  });

  it('inserting spans into a span will split the span', () => {
    let existingSpan = makeSpans(1)[0];
    let splits = existingSpan.split(2);
    let newSpans = makeSpans(5);
    let expectedSpans = [splits[0]].concat(newSpans, [splits[1]]);
    let ss = spanSet(existingSpan);

    expect(ss.insert(spanSet(...newSpans), 2)).hasSpans(...expectedSpans);
  });
});

describe('delete', () => {
  it('is possible to delete nothing from nothing, leaving nothing', () => {
    expect(spanSet().delete(0, 0)).hasSpans();
  });

  it('is possible to delete nothing from something, leaving the something', () => {
    let spans = makeSpans(5);

    expect(spanSet(...spans).delete(20, 0)).hasSpans(...spans);
  });

  it('removes a span if the start and length match it', () => {
    let spans = makeSpans(5);
    let expectedSpans = [spans[0], ...spans.slice(2)];

    expect(spanSet(...spans).delete(spans[0].next(), spans[1].length)).hasSpans(...expectedSpans);
  });

  it('removes two spans if the start and length match them', () => {
    let spans = makeSpans(5);
    let expectedSpans = [spans[0], ...spans.slice(3)];

    expect(spanSet(...spans).delete(spans[0].next(), spans[1].length + spans[2].length)).hasSpans(...expectedSpans);
  });

  it('removes the start of a span', () => {
    let spans = makeSpans(5);
    let splits = spans[1].split(2);
    let expectedSpans = [spans[0], splits[1], ...spans.slice(2)];

    expect(spanSet(...spans).delete(spans[0].next(), 2)).hasSpans(...expectedSpans);
  });

  it('removes the start of the first span', () => {
    let spans = makeSpans(5);
    let splits = spans[0].split(3);
    let expectedSpans = [splits[1], ...spans.slice(1)];
    
    expect(spanSet(...spans).delete(0, 3)).hasSpans(...expectedSpans);
  });

  it('removes the end of a span', () => {
    let spans = makeSpans(5);
    let splits = spans[1].split(2);
    let expectedSpans = [spans[0], splits[0], ...spans.slice(2)];

    expect(spanSet(...spans).delete(spans[0].next() + 2, 3)).hasSpans(...expectedSpans);
  });

  it('removes the end of the last span', () => {
    let spans = makeSpans(5);
    let splits = spans[4].split(3);
    let expectedSpans = [...spans.slice(0, 4), splits[0]];
    
    expect(spanSet(...spans).delete(sumLengths(spans) - 2, 2)).hasSpans(...expectedSpans);
  });

  it('removes a section from a span', () => {
    let spans = makeSpans(5);
    let splits = spans[1].split(1);
    let expectedSpans = [spans[0], splits[0], splits[1].split(3)[1], ...spans.slice(2)];
    
    expect(spanSet(...spans).delete(spans[0].length + 1, 3)).hasSpans(...expectedSpans);
  });

  it('removes sections from two adjacent spans', () => {
    let spans = makeSpans(5);
    let splits1 = spans[1].split(1), splits2 = spans[2].split(2);
    let expectedSpans = [spans[0], splits1[0], splits2[1], ...spans.slice(3)];
    
    expect(spanSet(...spans).delete(spans[0].length + 1, 6)).hasSpans(...expectedSpans);
  });

  it('removes a range crossing three spans, leaving two parts with one span removed completely', () => {
    let spans = makeSpans(5);
    let splits1 = spans[1].split(1), splits2 = spans[3].split(2);
    let expectedSpans = [spans[0], splits1[0], splits2[1], ...spans.slice(4)];
    
    expect(spanSet(...spans).delete(spans[0].length + 1, 11)).hasSpans(...expectedSpans);
  });
});

describe('range', () => {
  it('has no spans if the SpanSet was empty', () => {
    expect(spanSet().range(0, 100)).hasSpans();
  });

  it('returns all spans if the start and length include them all', () => {
    let spans = makeSpans(5);
    expect(spanSet(...spans).range(0, sumLengths(spans))).hasSpans(...spans);
  });

  it('returns only the first spans if the later ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(spanSet(...spans).range(0, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns the first spans when the start point is negative', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(0, -2);
    expect(spanSet(...spans).range(-1, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns only the last spans if the earlier ones are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(spanSet(...spans).range(start, sumLengths(subset))).hasSpans(...subset);
  });

  it('returns the last spans if the length is excessive', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(2);
    let start = spans[0].length + spans[1].length;
    expect(spanSet(...spans).range(start, sumLengths(subset) + 1)).hasSpans(...subset);
  });

  it('returns only the middle spans if the ends are not included', () => {
    let spans = makeSpans(5);
    let subset = spans.slice(1, -1);
    expect(spanSet(...spans).range(spans[0].length, sumLengths(subset))).hasSpans(...subset);
  });

  it('splits a span if the start point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [spans[1].crop(2), ...spans.slice(2)];
    expect(spanSet(...spans).range(spans[0].length + 2, sumLengths(subset))).hasSpans(...subset);
  });

  it('splits a span if the end point lies within it', () => {
    let spans = makeSpans(5);
    let subset = [...spans.slice(0, 3), spans[3].crop(0, 3)];
    let length = spans[0].length + spans[1].length + spans[2].length + 3;
    expect(spanSet(...spans).range(0, length)).hasSpans(...subset);
  });

  it('splits a span if the start and end points lie within it', () => {
    let spans = makeSpans(5);
    let remaining = spans[2].crop(1, spans[2].length - 2);
    let start = spans[0].length + spans[1].length + 1;
    expect(spanSet(...spans).range(start, spans[2].length - 2)).hasSpans(remaining);
  });

  it('returns no spans if the start is greater than or equal to the span length', () => {
    let spans = makeSpans(5);
    expect(spanSet(...spans).range(sumLengths(spans), 10)).hasSpans();
  });

  it('returns no spans if the length is 0', () => {
    let spans = makeSpans(5);
    expect(spanSet(...spans).range(11, 0)).hasSpans();
  });
});
