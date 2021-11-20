import { describe, expect, it, test, jest } from '@jest/globals';
import { span } from './spans';
import { toEqualSpan } from './edits.test-helpers';

expect.extend({
  toEqualSpan
});

function make({origin = "origin", start = 10, length = 20} = {}) {
  return span(origin, start, length);
}

describe('span', () => {
  it('has origin, start and length', () => {
    let actual = span('origin', 1, 100);
    expect(actual.origin).toEqual('origin');
    expect(actual.start).toEqual(1);
    expect(actual.length).toEqual(100);
  });
});

describe('clone', () => {
  it('produces an exact copy when there are no arguments', () => {
    let original = make();
    expect(original.clone()).toEqualSpan(original);
  });

  it('produces an exact copy when passed an empty object', () => {
    let original = make();
    expect(original.clone({})).toEqualSpan(original);
  });

  it('replaces only origin when that is passed as a parameter', () => {
    expect(make().clone({ origin: 'other' })).toEqualSpan(span('other', 10, 20 ));
  });

  it('replaces only start when that is passed as a parameter', () => {
    expect(make().clone({ start: 99 })).toEqualSpan(span('origin', 99, 20));
  });

  it('replaces only length when that is passed as a parameter', () => {
    expect(make().clone({ length: 99 })).toEqualSpan(span('origin', 10, 99));
  });
});

describe('basic span functions', () => {
  test('next returns the position exactly after the end of the span', () => {
    expect(make().next()).toEqual(30);
  });

  test('end returns the last position occupied by the span', () => {
    expect(make().end()).toEqual(29);
  });

  test('equalOrigin returns true if the origins are the same', () => {
    expect(span('origin1', 10, 20).equalOrigin(span('origin1', 15, 25)));
  });

  test('equalOrigin returns false if the origins are different', () => {
    expect(span('origin1', 10, 20).equalOrigin(span('origin2', 10, 20)));
  });

  test('startDiff returns the difference between the start points or two spans', () => {
    expect(make().startDiff(span('abc', 15, 20))).toEqual(-5);
  });

  test('endDiff returns the difference between the start points or two spans', () => {
    expect(make().endDiff(span('abc', 10, 15))).toEqual(5);
  });

  test('displace returns a span whose start has been moved by the given amount', () => {
    let original = make();
    expect(original.displace(22)).toEqualSpan(
      span(original.origin, original.start + 22, original.length)
    );
  });
});

describe('contains', () => {
  it('is false if the point is before the span', () => {
    let s = make();
    expect(s.contains(s.start - 1)).toBeFalsy();
  });

  it('is false if the point is after the span', () => {
    let s = make();
    expect(s.contains(s.next())).toBeFalsy();
  });

  it('is true if the point is the start of the span', () => {
    let s = make();
    expect(s.contains(s.start)).toBeTruthy();
  });

  it('is true if the point is the end of the span', () => {
    let s = make();
    expect(s.contains(s.end())).toBeTruthy();
  });

  it('is true if the point is within the span', () => {
    let s = make();
    expect(s.contains(15)).toBeTruthy();
  });

  it('is true if the span is one point long and the point equals it', () => {
    let s = span('origin', 100, 1);
    expect(s.contains(s.start)).toBeTruthy();
  });
});

describe('abuts', () => {
  it('returns true when the next position of the 1st span is equal to the start of the 2nd', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s1.abuts(s2)).toBeTruthy();
  });

  it('returns false if the spans have different origins', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'something else', start: s1.next() });
    expect(s1.abuts(s2)).toBeFalsy();
  });

  it('returns false if the spans overlap', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end() });
    expect(s1.abuts(s2)).toBeFalsy();
  });

  it('returns false the abut the wrong way round', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s2.abuts(s1)).toBeFalsy();
  });

  it('returns false if the spans have a gap between them', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() + 1 });
    expect(s1.abuts(s2)).toBeFalsy();
  });
});

describe('overlaps', () => {
  it('returns false if the span has a different origin', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'different' });
    expect(s1.overlaps(s2)).toBeFalsy();
  });

  it('returns true if the span touches our end', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end() });
    expect(s1.overlaps(s2)).toBeTruthy();
  });

  it('returns true if we touch the end of the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end() });
    expect(s2.overlaps(s1)).toBeTruthy();
  });

  it('returns true if the spans are coextensive', () => {
    let s1 = make();
    let s2 = s1.clone();
    expect(s1.overlaps(s2)).toBeTruthy();
  });

  it('returns false if the span is just after', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s1.overlaps(s2)).toBeFalsy();
  });

  it('returns false if the span is just before', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s2.overlaps(s1)).toBeFalsy();
  });

  it('returns true if we contain the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1 });
    expect(s1.overlaps(s2)).toBeTruthy();
  });

  it('returns true if the span contains us', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1 });
    expect(s2.overlaps(s1)).toBeTruthy();
  });
});

describe('canMergeWith', () => {
  it('is false if the spans have different origins', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'different' });
    expect(s1.canMergeWith(s2)).toBeFalsy();
  });

  it('returns true if the span touches our end', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end() });
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if we touch the end of the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end() });
    expect(s2.canMergeWith(s1)).toBeTruthy();
  });

  it('returns true if the spans are coextensive', () => {
    let s1 = make();
    let s2 = s1.clone();
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if the span is just after', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if the span is just before', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() });
    expect(s2.canMergeWith(s1)).toBeTruthy();
  });

  it('returns false if the span is after with a gap between', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() + 1 });
    expect(s1.canMergeWith(s2)).toBeFalsy();
  });

  it('returns false if the span is before with a gap between', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next() + 1 });
    expect(s2.canMergeWith(s1)).toBeFalsy();
  });

  it('returns true if we contain the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1 });
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if the span contains us', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length - 1 });
    expect(s2.canMergeWith(s1)).toBeTruthy();
  });
});

describe('merge', () => {
  it('returns an identical span if the argument is contained in this', () => {
    let s1 = span("o", 10, 20);
    let s2 = span ("o", 11, 10);
    expect(s1.merge(s2)).toEqualSpan(s1);
  });

  it('returns a span identical to the argument if this is contained in the argument', () => {
    let s1 = span("a", 10, 20);
    let s2 = span ("a", 11, 10);
    expect(s2.merge(s1)).toEqualSpan(s1);
  });

  it('returns a span identical to the original if they are both equal', () => {
    let s1 = span("b", 10, 20);
    let s2 = s1.clone();
    expect(s1.merge(s2)).toEqualSpan(s1);
  });

  it('returns a span encompassing both spans if this comes before that', () => {
    let s1 = span("c", 10, 20);
    let s2 = span ("c", 11, 30);
    expect(s1.merge(s2)).toEqualSpan(span("c", 10, 31));
  });

  it('returns a span encompassing both spans if that comes before this', () => {
    let s1 = span("d", 10, 20);
    let s2 = span ("d", 11, 30);
    expect(s2.merge(s1)).toEqualSpan(span("d", 10, 31));
  });

  it('uses the origin of the spans', () => {
    let s1 = span("original", 10, 20);
    let s2 = span ("original,", 11, 10);
    expect(s1.merge(s2).origin).toEqualSpan("original");
  });
});

describe('crop', () => {
  it('returns an identical span if whole span is selected', () => {
    let s = make();
    expect(s.crop(0, s.length)).toEqualSpan(s);
  });

  it('removes initial elements if start is greater than 0', () => {
    let s = make();
    expect(s.crop(2, s.length)).toEqualSpan(s.clone({start: s.start + 2, length: s.length - 2}));
  });

  it('removes final elements if length is less than the span length', () => {
    let s = make();
    expect(s.crop(0, s.length - 2)).toEqualSpan(s.clone({length: s.length - 2}));
  });

  it('always returns a span of the given length, even when initial elements are removed, so long as the requested length is shorter or equal to the original', () => {
    let s = make();
    expect(s.crop(1, s.length - 2).length).toEqual(s.length - 2);
  });

  it('removes initial and final elements if a narrow span is requested', () => {
    let s = make();
    expect(s.crop(1, s.length - 2)).toEqualSpan(s.clone({start: s.start + 1, length: s.length - 2}));
  });

  it('removes no final elements if length is not passed', () => {
    let s = make();
    expect(s.crop(1)).toEqualSpan(s.clone({start: s.start + 1, length: s.length - 1}));
  });

  it('removes no final elements if length is longer than the span length', () => {
    let s = make();
    expect(s.crop(1, s.length + 1)).toEqualSpan(s.clone({start: s.start + 1, length: s.length - 1}));
  });

  it('treats negative start as equivalent to 0', () => {
    let s = make();
    expect(s.crop(-1, s.length - 1)).toEqualSpan(s.crop(0, s.length - 1));
  });
});

describe('spanSource', () => {
  it('returns a function', () => {
    expect(typeof make().spanSource()).toEqual('function');
  });

  it('returns the span on first call', () => {
    let s = make();
    expect(s.spanSource()()).toEqualSpan(s);
  });

  it('has 0 position after first call', () => {
    let s = make();
    let iterator = s.spanSource();

    iterator();

    expect(iterator.position()).toEqual(0);
  });

  it('returns undefined on second call', () => {
    let s = make();
    let source = s.spanSource();
    source();
    expect(source()).toBeUndefined();
  });

  describe('spanSource.forEach', () => {
    it('is present on the iterator', () => {
      expect(make().spanSource()).toHaveProperty("forEach");
    });

    it('calls the callback exactly once with the span and zero as arguments', () => {
      let s = make();
      const mockCallback = jest.fn((x, y) => x+y);

      s.spanSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(1);
      expect(mockCallback.mock.calls[0][0]).toEqual(s);
      expect(mockCallback.mock.calls[0][1]).toEqual(0);
    });

    it('does not call the callback if the span has already been iterated', () => {
      let source = make().spanSource();
      const mockCallback = jest.fn(x => x);

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toEqual(0);
    });
  })
});
