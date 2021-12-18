import { describe, expect, it, test, jest } from '@jest/globals';
import { Span, leafDataToSpan, spanTesting } from './span';
import { boxTesting, Box } from './box';

expect.extend({
  toEqualSpan: spanTesting.toEqualSpan
});

let make = spanTesting.makeSpan;

describe('span', () => {
  it('has origin, start and length', () => {
    let actual = Span('origin', 1, 100);
    expect(actual.origin).toBe('origin');
    expect(actual.start).toBe(1);
    expect(actual.length).toBe(100);
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
    expect(make().clone({ origin: 'other' })).toEqualSpan(Span('other', 10, 20 ));
  });

  it('replaces only start when that is passed as a parameter', () => {
    expect(make().clone({ start: 99 })).toEqualSpan(Span('origin', 99, 20));
  });

  it('replaces only length when that is passed as a parameter', () => {
    expect(make().clone({ length: 99 })).toEqualSpan(Span('origin', 10, 99));
  });
});

describe('basic span functions', () => {
  test('isEdit returns true', () => {
    expect(make().isEdit).toBeTruthy();
  });
  
  test('edit type returns span', () => {
    expect(make().editType).toBe("span");
  });

  test('same type returns true for another span', () => {
    expect(make().sameType(make())).toBeTruthy();
  });

  test('same type returns false for a box', () => {
    expect(make().sameType(boxTesting.makeBox())).toBeFalsy();
  });

  test('next returns the position exactly after the end of the span', () => {
    expect(make().next).toBe(30);
  });

  test('end returns the last position occupied by the span', () => {
    expect(make().end).toBe(29);
  });

  test('equalOrigin returns true if the origins are the same', () => {
    expect(Span('origin1', 10, 20).equalOrigin(Span('origin1', 15, 25)));
  });

  test('equalOrigin returns false if the origins are different', () => {
    expect(Span('origin1', 10, 20).equalOrigin(Span('origin2', 10, 20)));
  });

  test('startDiff returns the difference between the start points or two spans', () => {
    expect(make().startDiff(Span('abc', 15, 20))).toBe(-5);
  });

  test('endDiff returns the difference between the start points or two spans', () => {
    expect(make().endDiff(Span('abc', 10, 15))).toBe(5);
  });

  test('displace returns a span whose start has been moved by the given amount', () => {
    let original = make();
    expect(original.displace(22)).toEqualSpan(
      Span(original.origin, original.start + 22, original.length)
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
    expect(s.contains(s.next)).toBeFalsy();
  });

  it('is true if the point is the start of the span', () => {
    let s = make();
    expect(s.contains(s.start)).toBeTruthy();
  });

  it('is true if the point is the end of the span', () => {
    let s = make();
    expect(s.contains(s.end)).toBeTruthy();
  });

  it('is true if the point is within the span', () => {
    let s = make();
    expect(s.contains(15)).toBeTruthy();
  });

  it('is true if the span is one point long and the point equals it', () => {
    let s = Span('origin', 100, 1);
    expect(s.contains(s.start)).toBeTruthy();
  });
});

describe('abuts', () => {
  it('is false for a box', () => {
    expect(make().abuts(boxTesting.makeBox())).toBeFalsy();
  });

  it('returns true when the next position of the 1st span is equal to the start of the 2nd', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
    expect(s1.abuts(s2)).toBeTruthy();
  });

  it('returns false if the spans have different origins', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'something else', start: s1.next });
    expect(s1.abuts(s2)).toBeFalsy();
  });

  it('returns false if the spans overlap', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end });
    expect(s1.abuts(s2)).toBeFalsy();
  });

  it('returns false the abut the wrong way round', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
    expect(s2.abuts(s1)).toBeFalsy();
  });

  it('returns false if the spans have a gap between them', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next + 1 });
    expect(s1.abuts(s2)).toBeFalsy();
  });
});

describe('overlaps', () => {
  it('is false for a box', () => {
    expect(make().overlaps(boxTesting.makeBox())).toBeFalsy();
  });

  it('returns false if the span has a different origin', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'different' });
    expect(s1.overlaps(s2)).toBeFalsy();
  });

  it('returns true if the span touches our end', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end });
    expect(s1.overlaps(s2)).toBeTruthy();
  });

  it('returns true if we touch the end of the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end });
    expect(s2.overlaps(s1)).toBeTruthy();
  });

  it('returns true if the spans are coextensive', () => {
    let s1 = make();
    let s2 = s1.clone();
    expect(s1.overlaps(s2)).toBeTruthy();
  });

  it('returns false if the span is just after', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
    expect(s1.overlaps(s2)).toBeFalsy();
  });

  it('returns false if the span is just before', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
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
  it('is false for a box', () => {
    expect(make().canMergeWith(boxTesting.makeBox())).toBeFalsy();
  });

  it('is false if the spans have different origins', () => {
    let s1 = make();
    let s2 = s1.clone({ origin: 'different' });
    expect(s1.canMergeWith(s2)).toBeFalsy();
  });

  it('returns true if the span touches our end', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end });
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if we touch the end of the span', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.end });
    expect(s2.canMergeWith(s1)).toBeTruthy();
  });

  it('returns true if the spans are coextensive', () => {
    let s1 = make();
    let s2 = s1.clone();
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if the span is just after', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
    expect(s1.canMergeWith(s2)).toBeTruthy();
  });

  it('returns true if the span is just before', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next });
    expect(s2.canMergeWith(s1)).toBeTruthy();
  });

  it('returns false if the span is after with a gap between', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next + 1 });
    expect(s1.canMergeWith(s2)).toBeFalsy();
  });

  it('returns false if the span is before with a gap between', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.next + 1 });
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
    let s1 = Span("o", 10, 20);
    let s2 = Span ("o", 11, 10);
    expect(s1.merge(s2)).toEqualSpan(s1);
  });

  it('returns a span identical to the argument if this is contained in the argument', () => {
    let s1 = Span("a", 10, 20);
    let s2 = Span ("a", 11, 10);
    expect(s2.merge(s1)).toEqualSpan(s1);
  });

  it('returns a span identical to the original if they are both equal', () => {
    let s1 = Span("b", 10, 20);
    let s2 = s1.clone();
    expect(s1.merge(s2)).toEqualSpan(s1);
  });

  it('returns a span encompassing both spans if this comes before that', () => {
    let s1 = Span("c", 10, 20);
    let s2 = Span ("c", 11, 30);
    expect(s1.merge(s2)).toEqualSpan(Span("c", 10, 31));
  });

  it('returns a span encompassing both spans if that comes before this', () => {
    let s1 = Span("d", 10, 20);
    let s2 = Span ("d", 11, 30);
    expect(s2.merge(s1)).toEqualSpan(Span("d", 10, 31));
  });

  it('uses the origin of the spans', () => {
    let s1 = Span("original", 10, 20);
    let s2 = Span ("original,", 11, 10);
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
    expect(s.crop(1, s.length - 2).length).toBe(s.length - 2);
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

describe('editSource', () => {
  it('returns a function', () => {
    expect(typeof make().editSource()).toBe('function');
  });

  it('returns the span on first call', () => {
    let s = make();
    expect(s.editSource()()).toEqualSpan(s);
  });

  it('has 0 position after first call', () => {
    let s = make();
    let iterator = s.editSource();

    iterator();

    expect(iterator.position()).toBe(0);
  });

  it('returns undefined on second call', () => {
    let s = make();
    let source = s.editSource();
    source();
    expect(source()).toBeUndefined();
  });

  describe('editSource.forEach', () => {
    it('is present on the iterator', () => {
      expect(make().editSource()).toHaveProperty("forEach");
    });

    it('calls the callback exactly once with the span and zero as arguments', () => {
      let s = make();
      const mockCallback = jest.fn((x, y) => x+y);

      s.editSource().forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(1);
      expect(mockCallback.mock.calls[0][0]).toBe(s);
      expect(mockCallback.mock.calls[0][1]).toBe(0);
    });

    it('does not call the callback if the span has already been iterated', () => {
      let source = make().editSource();
      const mockCallback = jest.fn(x => x);

      source();
      source.forEach(mockCallback);

      expect(mockCallback.mock.calls.length).toBe(0);
    });
  })
});

describe('leafData', () => {
  it('has the editType, origin, start and length properties', () => {
    expect(Span("a", 101, 505).leafData()).toEqual({
      typ: "span",
      ori: "a",
      st: 101,
      ln: 505
    });
  });
});

test('leafDataToSpan is inverse of leafData', () => {
  let s = make();
  expect(leafDataToSpan(s.leafData())).toEqualSpan(s);
});

describe('intersect', () => {
  it('returns the original span if the second is equal to it', () => {
    let s1 = make();
    let s2 = s1.clone();

    expect(s1.intersect(s2)).toEqualSpan(s1);
  });

  it('returns the original dimensions if the second span encompasses it', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start - 1, length: s1.length + 2 });

    expect(s1.intersect(s2)).toEqualSpan(s1);
  });

  it('returns the original dimensions if the second span is equal to it', () => {
    let s1 = make();
    let s2 = s1.clone();

    expect(s1.intersect(s2)).toEqualSpan(s1);
  });

  it('returns the dimensions of the second span if we encompass it', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start - 1, length: s1.length + 2 });

    expect(s2.intersect(s1)).toEqualSpan(s1);
  });

  it('has the start of the other span if that is later', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1});

    expect(s1.intersect(s2).start).toBe(s2.start);
  });

  it('has the start of this span if that is later', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1});

    expect(s2.intersect(s1).start).toBe(s2.start);
  });

  it('has the end of the other span if that is earlier', () => {
    let s1 = make();
    let s2 = s1.clone({ length: s1.length - 1});

    expect(s1.intersect(s2).end).toBe(s2.end);
  });

  it('has the end of this span if that is earlier', () => {
    let s1 = make();
    let s2 = s1.clone({ length: s1.length - 1});

    expect(s2.intersect(s1).end).toBe(s2.end);
  });

  it('is equal to the overlapping section if this is earlier than the other', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length + 3});

    expect(s1.intersect(s2).start).toBe(s2.start);
    expect(s1.intersect(s2).end).toBe(s1.end);
  });

  it('is equal to the overlapping section if this is later than the other', () => {
    let s1 = make();
    let s2 = s1.clone({ start: s1.start + 1, length: s1.length + 3});

    expect(s2.intersect(s1).start).toBe(s2.start);
    expect(s2.intersect(s1).end).toBe(s1.end);
  });
});

describe('engulfs', () => {
  it('is false for a box', () => {
    expect(make().engulfs(boxTesting.makeBox())).toBeFalsy();
  });

  it('returns true if the spans are equal', () => {
    let span = make();
    expect(span.engulfs(span.clone())).toBeTruthy();
  });

  it('returns true if one span contains the other', () => {
    let span = make({start: 10, length: 5});
    expect(span.engulfs(span.clone({start: 11, length: 3}))).toBeTruthy();
  });

  it('returns false if the spans have different origins', () => {
    let span = make();
    expect(span.engulfs(span.clone({origin: "something else"}))).toBeFalsy();
  });

  it('returns false if that starts before this', () => {
    let span = make();
    expect(span.engulfs(span.clone({start: span.start - 1}))).toBeFalsy();
  });

  it('returns false if that ends after this', () => {
    let span = make();
    expect(span.engulfs(span.clone({length: span.length + 1}))).toBeFalsy();
  });

  it('returns false if they do not overlap at all', () => {
    let span = make({start: 10, length: 10});
    expect(span.engulfs(span.clone({start: 20, length: 10}))).toBeFalsy();
  });
});

describe('equals', () => {
  it('returns true if the spans have the same origin, start and length', () => {
    let span = make();

    expect(span.equals(span.clone())).toBeTruthy();
  });

  it('returns false if the spans have different origin', () => {
    let span = make();

    expect(span.equals(span.clone({origin: "other"}))).toBeFalsy();
  });

  it('returns false if the spans have different start', () => {
    let span = make();

    expect(span.equals(span.clone({start: span.start + 1}))).toBeFalsy();
  });

  it('returns false if the spans have different length', () => {
    let span = make();

    expect(span.equals(span.clone({length: span.length + 1}))).toBeFalsy();
  });

  it('returns false if the other is a box', () => {
    let span = make();

    expect(span.equals(boxTesting.makeBox())).toBeFalsy();
  });
});

describe('overlapingButNotEngulfing', () => {
  it('returns false if this is before that', () => {
    expect(Span("x", 20, 10).overlapingButNotEngulfing(Span("x", 30, 10))).toBeFalsy();
  });

  it('returns false if this is after that', () => {
    expect(Span("x", 30, 10).overlapingButNotEngulfing(Span("x", 20, 10))).toBeFalsy();
  });

  it('returns false if this contains', () => {
    expect(Span("x", 20, 20).overlapingButNotEngulfing(Span("x", 30, 10))).toBeFalsy();
  });

  it('returns false if that contains this', () => {
    expect(Span("x", 30, 10).overlapingButNotEngulfing(Span("x", 20, 20))).toBeFalsy();
  });

  it('returns false if the spans are identical', () => {
    expect(Span("x", 30, 10).overlapingButNotEngulfing(Span("x", 30, 10))).toBeFalsy();
  });

  it('returns true if this overlaps the lower end of that', () => {
    expect(Span("x", 20, 10).overlapingButNotEngulfing(Span("x", 29, 10))).toBeTruthy();
  });

  it('returns true if that overlaps the lower end of this', () => {
    expect(Span("x", 29, 10).overlapingButNotEngulfing(Span("x", 20, 10))).toBeTruthy();
  });

  it('returns false if they have different origins', () => {
    expect(Span("x", 29, 10).overlapingButNotEngulfing(Span("y", 20, 10))).toBeFalsy();
  });

  it('returns false if they have different edit types', () => {
    expect(Span("x", 29, 10).overlapingButNotEngulfing(Box("x", 20, 5, 10, 5))).toBeFalsy();
  });
});
